"""
Base Medical Agent Class
=========================
Abstract base class for all specialist AI agents.
Uses Google Gemini API for natural language processing.
"""

import os
import json
import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

# Import Gemini API
try:
    import google.generativeai as genai
    from google.generativeai.types import content_types
except ImportError:
    raise ImportError(
        "google-generativeai is required. Install it with: pip install google-generativeai"
    )

# Import Triage Service
from app.services.triage_service import classify_triage

# Tool Definition for Drug Interaction
DRUG_INTERACTION_TOOL = {
    'function_declarations': [{
        'name': 'check_drug_interaction',
        'description': 'Check for interactions between two drugs using the RxNav API.',
        'parameters': {
            'type_': 'OBJECT',
            'properties': {
                'drug1': {'type_': 'STRING', 'description': 'Name of the first drug'},
                'drug2': {'type_': 'STRING', 'description': 'Name of the second drug'}
            },
            'required': ['drug1', 'drug2']
        }
    }]
}

# Tool Definition for Drug Information (Pharmacy)
DRUG_INFO_TOOL = {
    'function_declarations': [{
        'name': 'get_drug_info',
        'description': 'Get comprehensive information about a drug including side effects, dosage, class, and usage.',
        'parameters': {
            'type_': 'OBJECT',
            'properties': {
                'drug_name': {'type_': 'STRING', 'description': 'Name of the drug to look up'}
            },
            'required': ['drug_name']
        }
    }]
}

async def execute_drug_interaction(drug1: str, drug2: str) -> str:
    """
    Fetches interaction data from RxNav API.
    """
    try:
        # 1. Get RxCUIs
        async with httpx.AsyncClient() as client:
            r1_resp = await client.get(f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug1}")
            r2_resp = await client.get(f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug2}")

            r1_data = r1_resp.json()
            r2_data = r2_resp.json()

            # Extract RxCUI
            def get_rxcui(data):
                groups = data.get("idGroup", {}).get("conceptGroup", [])
                for g in groups:
                    concepts = g.get("conceptProperties", [])
                    if concepts: return concepts[0].get("rxcui")
                return None

            rxcui1 = get_rxcui(r1_data)
            rxcui2 = get_rxcui(r2_data)

            if not rxcui1 or not rxcui2:
                return f"Could not find one or both drugs in the database. Please check spelling."

            # 2. Check Interaction
            int_resp = await client.get(f"https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui1={rxcui1}&rxcui2={rxcui2}")
            int_data = int_resp.json()

            groups = int_data.get("interactionTypeGroup", {}).get("interactionType", [])
            for g in groups:
                pairs = g.get("interactionPair", [])
                for p in pairs:
                    severity = p.get("severity", "Unknown")
                    desc = p.get("description", "No description.")
                    return f"Interaction Found! Severity: {severity}. Details: {desc}"

            return "No significant interactions found between these two drugs."
    except Exception as e:
        return f"Error checking interaction: {str(e)}"


async def execute_drug_info(drug_name: str) -> str:
    """
    Fetches comprehensive drug information from RxNav and OpenFDA APIs.
    """
    try:
        async with httpx.AsyncClient() as client:
            # 1. Get RxCUI
            rxcui_resp = await client.get(f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug_name}")
            rxcui_data = rxcui_resp.json()
            
            def get_rxcui(data):
                groups = data.get("idGroup", {}).get("conceptGroup", [])
                for g in groups:
                    concepts = g.get("conceptProperties", [])
                    if concepts: return concepts[0].get("rxcui")
                return None

            rxcui = get_rxcui(rxcui_data)
            if not rxcui:
                return f"Drug '{drug_name}' not found in database. Please check spelling."

            # 2. Get Drug Properties from RxNav
            # Get drug name and synonyms
            name_resp = await client.get(f"https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/allrelated.json")
            name_data = name_resp.json()
            
            synonyms = []
            for group in name_data.get("relatedGroup", {}).get("rela", []):
                if group.get("rela") == "synonym" or group.get("rela") == "trade_name":
                    synonyms.append(group.get("name", ""))
            
            # 3. Get Side Effects & Usage from OpenFDA
            fda_resp = await client.get(
                f"https://api.fda.gov/drug/label.json?search=openfda.brand_name:{drug_name}+openfda.generic_name:{drug_name}&limit=1"
            )
            
            fda_data = fda_resp.json()
            results = fda_data.get("results", [])
            
            info_parts = []
            
            if results:
                label = results[0]
                
                # Purpose/Usage
                purpose = label.get("purpose", [])
                if purpose:
                    info_parts.append(f"**Purpose**: {purpose[0]}")
                
                # Side Effects
                warnings = label.get("warnings", [])
                if warnings:
                    info_parts.append(f"**Warnings**: {warnings[0][:300]}...")
                
                adverse_reactions = label.get("adverse_reactions", [])
                if adverse_reactions:
                    info_parts.append(f"**Side Effects**: {adverse_reactions[0][:300]}...")
                
                # Dosage
                dosage = label.get("dosage_and_administration", [])
                if dosage:
                    info_parts.append(f"**Dosage**: {dosage[0][:200]}...")
                
                # Contraindications
                contraindications = label.get("contraindications", [])
                if contraindications:
                    info_parts.append(f"**Contraindications**: {contraindications[0][:200]}...")
                
                # Drug Class
                drug_class = label.get("drug_class", [])
                if drug_class:
                    info_parts.append(f"**Drug Class**: {drug_class[0]}")
            else:
                # Fallback: Try with generic name
                fda_resp2 = await client.get(
                    f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{drug_name}&limit=1"
                )
                fda_data2 = fda_resp2.json()
                results2 = fda_data2.get("results", [])
                
                if results2:
                    label2 = results2[0]
                    purpose = label2.get("purpose", [])
                    if purpose: info_parts.append(f"**Purpose**: {purpose[0]}")
                    
                    adverse = label2.get("adverse_reactions", [])
                    if adverse: info_parts.append(f"**Side Effects**: {adverse[0][:300]}...")
                    
                    dosage = label2.get("dosage_and_administration", [])
                    if dosage: info_parts.append(f"**Dosage**: {dosage[0][:200]}...")
                else:
                    info_parts.append("Limited information available from FDA database.")
            
            # Combine all info
            result_text = f"Drug: {drug_name}\n"
            if synonyms:
                result_text += f"**Also Known As**: {', '.join(synonyms[:5])}\n"
            result_text += "\n".join(info_parts)
            
            return result_text
            
    except Exception as e:
        return f"Error fetching drug info: {str(e)}"


class BaseMedicalAgent(ABC):
    """
    Base class for all medical specialist agents.
    
    Each specialist (Cardiologist, Dermatologist, etc.) inherits from this class
    and provides specialty-specific instructions and tools.
    """
    
    def __init__(self, name: str, agent_id: str, instructions: str, tools: Optional[List[Dict]] = None):
        """
        Initialize a medical specialist agent.
        
        Args:
            name: Display name of the specialist (e.g., "Cardiologist")
            agent_id: Unique identifier (e.g., "cardiologist-specialist")
            instructions: System instructions defining the agent's behavior
            tools: Optional list of tool definitions
        """
        self.name = name
        self.agent_id = agent_id
        self.instructions = instructions
        self.tools = tools or []
        
        # Configure Gemini API
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured in environment variables")
        
        genai.configure(api_key=gemini_api_key)
        
        # Initialize Gemini model
        model_name = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.0-flash")
        self.model = genai.GenerativeModel(model_name)
        
        # Conversation history for context
        self.conversation_history: List[Dict[str, str]] = []
    
    def _build_prompt(self, user_message: str, context: Optional[str] = None) -> str:
        """
        Build the complete prompt for the AI.
        """
        # Run triage analysis on user message
        triage_result = classify_triage(user_message)

        # Determine if this is likely a first message or follow-up
        is_first_message = len(self.conversation_history) == 0

        prompt = f"""{self.instructions}

Current Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

=== TRIAGE ANALYSIS (ALREADY PERFORMED) ===
Triage Level: {triage_result['urgency']} {triage_result['triage_level']}
Risk Score: {triage_result['risk_score']}/100
Recommended Action: {triage_result['action']}
Recommended Tests: {', '.join(triage_result['recommended_tests']) if triage_result['recommended_tests'] else 'None specific'}

SEVERITY MODIFIERS DETECTED: {triage_result.get('severity_detected', False)}

=== DIAGNOSTIC PROTOCOL (FOLLOW STRICTLY) ===

YOU ARE A PROFESSIONAL AI DOCTOR. Your goal is to accurately diagnose and provide specific, actionable treatment plans including medicines, exercises, and lifestyle changes.

STEP 1 - INITIAL ASSESSMENT:
- Analyze the user's symptoms carefully
- Check if you have enough information to make an accurate assessment
- If information is INCOMPLETE, ask 2-3 targeted follow-up questions about:
  * Duration: "How long have you had this symptom?"
  * Severity: "On a scale of 1-10, how severe is the pain/discomfort?"
  * Location: "Exactly where do you feel it? Does it radiate anywhere?"
  * Triggers: "What makes it better or worse?"
  * Associated symptoms: "Do you also experience [related symptoms]?"
  * Medical history: "Do you have any existing conditions or take any medications?"
  * Age and gender (if not already known)

STEP 2 - DIAGNOSIS (when you have enough information):
- Provide your assessment of the likely condition(s)
- Explain the reasoning in simple terms
- Mention the confidence level (High/Medium/Low)

STEP 3 - TREATMENT PLAN (be specific and actionable):
A) MEDICINES (suggest specific, commonly-used options):
   - Name the medicine (generic name)
   - Suggest typical dosage (e.g., "500mg twice daily")
   - Duration of course
   - When to take (before/after meals, morning/night)
   - Common side effects to watch for
   - NOTE: Always add "Consult a pharmacist for availability in your area"

B) EXERCISES & PHYSICAL THERAPY (if applicable):
   - Name specific exercises (e.g., "neck stretches, shoulder rolls, chin tucks")
   - How many reps/sets and how often
   - Proper form tips
   - What to avoid

C) HOME REMEDIES & LIFESTYLE:
   - Specific dietary changes
   - Sleep position advice
   - Stress management techniques
   - Hot/cold therapy instructions

D) WHEN TO ESCALATE:
   - Only mention if triage level is EMERGENCY or symptoms worsen
   - Be brief: "If symptoms worsen or you develop [specific red flag symptoms], seek immediate medical care."

IMPORTANT RULES:
1. DO NOT repeatedly say "I am an AI, consult a real doctor" — you ARE the doctor in this context.
2. DO give specific medicine names, dosages, and exercise routines.
3. DO ask clarifying questions BEFORE giving a full treatment plan if the information is incomplete.
4. DO be confident but honest about uncertainty — say "This could be X or Y, and here's what to do for both."
5. DO use the triage data to prioritize urgency, but don't over-emphasize it in every response.
6. If the user already provided detailed symptoms, proceed directly to diagnosis and treatment.
7. If the user says "that's all" or answers your questions, give the full treatment plan immediately.

IMPORTANT LANGUAGE RULE:
- Always reply in the SAME LANGUAGE as the user's message.
- If the user speaks Urdu, reply in Urdu.
- If the user speaks English, reply in English.
- Use simple and clear wording appropriate for patients.

IMAGE ANALYSIS INSTRUCTIONS (CRITICAL):
- If the user sends an image, you will receive a "Clinical Image Analysis Report" in the context below.
- You MUST treat this report as your own professional examination findings.
- DO NOT say "I cannot see the image" or "I am an AI".
- INSTEAD, say: "Based on the clinical analysis of your skin/image..." or "Examining the image you provided..."
- Use the details in the report (e.g., redness, acne, dryness) to give specific, actionable advice on how to improve the condition.
- Provide a skincare routine, lifestyle changes, and potential treatments based on the findings.

CLINICAL DECISION SUPPORT (YOUR EXPERTISE):
- Based on the user's symptoms, recommend specific diagnostic tests (e.g., "Get HbA1c test for diabetes screening").
- Suggest appropriate treatment options based on diagnosis.
- Reference our platform's health screening features using EXACT format below:

WHEN RECOMMENDING OUR PLATFORM TESTS, USE THESE EXACT MARKERS:
- For Blood Pressure: [TEST:BP_ESTIMATION]Check Your Blood Pressure (Free AI Scan)[/TEST]
- For Eye/Neurological: [TEST:EYE_SCAN]Get Eye Health Scan (Detect Fatigue, Liver, Neurological Issues)[/TEST]
- For Drug Interactions: [TEST:DRUG_CHECKER]Check Drug Interactions (Free Tool)[/TEST]

Example: "Based on your symptoms, I recommend you also try our free tools: [TEST:BP_ESTIMATION]Check Your Blood Pressure (Free AI Scan)[/TEST] and [TEST:EYE_SCAN]Get Eye Health Scan (Detect Fatigue, Liver, Neurological Issues)[/TEST]"

AVAILABLE TOOLS:
- You have access to two tools:
  1. `check_drug_interaction`: Check for interactions between two drugs.
  2. `get_drug_info`: Get comprehensive information about a single drug including side effects, dosage, drug class, and usage.
- If the user asks about a specific medicine's side effects, dosage, or usage, use the `get_drug_info` tool.
- If the user asks about combining two medicines, use the `check_drug_interaction` tool.
- Once you receive the tool output, use that accurate data to answer the user.

TREATMENT SIMULATION FEATURE:
- If the user asks "What will happen if...", "Simulate treatment", or "What are the effects of [Medicine/Exercise]?", you MUST provide a structured response.
- Use the following format for simulations:
  [SIMULATION_START]
  Recovery Timeline: [e.g., 3-5 days]
  Success Probability: [e.g., 85%]
  Side Effects: [List 2-3 common side effects]
  Details: [Brief explanation of the outcome]
  [SIMULATION_END]
"""
        if context:
            prompt += f"\n=== CLINICAL CONTEXT & IMAGE ANALYSIS ===\n{context}\n=== END CONTEXT ===\n"

        prompt += f"\n=== PATIENT MESSAGE ===\n{user_message}\n=== END PATIENT MESSAGE ==="

        return prompt
    
    async def run(self, user_message: str, context: Optional[str] = None) -> str:
        """
        Run the agent with user message.

        Args:
            user_message: User's input message
            context: Optional context (file analysis results, symptoms, etc.)

        Returns:
            AI agent's response
        """
        # Build complete prompt
        prompt = self._build_prompt(user_message, context)

        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat()
        })

        try:
            # Generate response using Gemini with Tools
            response = await self.model.generate_content_async(
                prompt,
                tools=[DRUG_INTERACTION_TOOL, DRUG_INFO_TOOL]
            )
            
            # Check if the model wants to call a function
            if response.candidates and response.candidates[0].content.parts:
                part = response.candidates[0].content.parts[0]
                
                # If it's a function call
                if part.function_call:
                    func_name = part.function_call.name
                    args = part.function_call.args
                    
                    if func_name == 'check_drug_interaction':
                        # Execute the tool
                        drug1 = args.get('drug1', '')
                        drug2 = args.get('drug2', '')
                        result = await execute_drug_interaction(drug1, drug2)
                        
                        # Send the result back to the model to generate the final answer
                        final_response = await self.model.generate_content_async(
                            [
                                prompt,
                                response, # The model's previous response containing the function call
                                genai.protos.Content(
                                    role="function",
                                    parts=[
                                        genai.protos.Part(
                                            function_response=genai.protos.FunctionResponse(
                                                name='check_drug_interaction',
                                                response={"result": result}
                                            )
                                        )
                                    ]
                                )
                            ],
                            tools=[DRUG_INTERACTION_TOOL, DRUG_INFO_TOOL]
                        )
                        ai_response = final_response.text
                    
                    elif func_name == 'get_drug_info':
                        # Execute the drug info tool
                        drug_name = args.get('drug_name', '')
                        result = await execute_drug_info(drug_name)
                        
                        # Send the result back to the model
                        final_response = await self.model.generate_content_async(
                            [
                                prompt,
                                response,
                                genai.protos.Content(
                                    role="function",
                                    parts=[
                                        genai.protos.Part(
                                            function_response=genai.protos.FunctionResponse(
                                                name='get_drug_info',
                                                response={"result": result}
                                            )
                                        )
                                    ]
                                )
                            ],
                            tools=[DRUG_INTERACTION_TOOL, DRUG_INFO_TOOL]
                        )
                        ai_response = final_response.text
                    else:
                        ai_response = "I'm sorry, I don't have that tool available."
                else:
                    # It's a normal text response
                    ai_response = response.text
            else:
                ai_response = response.text

            # Add to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": ai_response,
                "timestamp": datetime.now().isoformat()
            })

            return ai_response

        except Exception as e:
            error_message = f"I apologize, but I encountered an error processing your request: {str(e)}"
            return error_message
    
    async def run_with_file(self, user_message: str, file_context: Dict[str, Any]) -> str:
        """
        Run agent with file analysis context.
        
        Args:
            user_message: User's message about the file
            file_context: Dictionary with file analysis results
        
        Returns:
            AI agent's response analyzing the file
        """
        # Build context from file analysis
        context_parts = []
        
        if file_context.get('file_type'):
            context_parts.append(f"File Type: {file_context['file_type']}")
        
        if file_context.get('file_name'):
            context_parts.append(f"File Name: {file_context['file_name']}")
        
        if file_context.get('ml_results'):
            ml_results = file_context['ml_results']
            if ml_results.get('analysis_text'):
                context_parts.append(f"AI Analysis Results:\n{ml_results['analysis_text']}")
            elif ml_results.get('success'):
                context_parts.append(f"ML Analysis Results:\n{json.dumps(ml_results, indent=2)}")
        
        if file_context.get('ocr_text'):
            context_parts.append(f"Extracted Report Text:\n{file_context['ocr_text']}")
        
        if file_context.get('structured_data'):
            context_parts.append(f"Structured Data:\n{json.dumps(file_context['structured_data'], indent=2)}")
        
        context = "\n\n".join(context_parts)
        
        return await self.run(user_message, context)
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history
    
    @abstractmethod
    def get_specialty_info(self) -> Dict[str, Any]:
        """
        Return specialty-specific information.
        
        Returns:
            Dictionary with description, icon, common conditions, etc.
        """
        pass
