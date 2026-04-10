import httpx
import logging

logger = logging.getLogger(__name__)

# RxNav API Base URL (Free, No API Key Required)
RXNAV_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

async def get_rxcui(drug_name: str) -> str | None:
    """
    Search for a drug name and return its RxCUI (RxNorm Concept Unique Identifier).
    """
    url = f"{RXNAV_BASE_URL}/rxcui.json?name={drug_name}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
            
            # RxNav returns a list of concepts, we take the first valid one
            concept_groups = data.get("idGroup", {}).get("conceptGroup", [])
            for group in concept_groups:
                concepts = group.get("conceptProperties", [])
                if concepts:
                    return concepts[0].get("rxcui")
    except Exception as e:
        logger.error(f"Error fetching RxCUI for {drug_name}: {e}")
    return None

async def check_interaction(rxcui1: str, rxcui2: str) -> dict | None:
    """
    Check for interactions between two drugs using their RxCUIs.
    """
    url = f"{RXNAV_BASE_URL}/interaction/interaction.json?rxcui1={rxcui1}&rxcui2={rxcui2}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
            
            interaction_type_groups = data.get("interactionTypeGroup", {}).get("interactionType", [])
            
            # We look for "interactionPair"
            for group in interaction_type_groups:
                pairs = group.get("interactionPair", [])
                for pair in pairs:
                    severity = pair.get("severity", "Unknown")
                    description = pair.get("description", "No description available.")
                    return {
                        "severity": severity,
                        "description": description
                    }
    except Exception as e:
        logger.error(f"Error checking interaction between {rxcui1} and {rxcui2}: {e}")
    return None
