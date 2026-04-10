"""
AI Agent Registry
==================
Central registry for all specialist AI agents.
Provides functions to get agent instances and list all available agents.
"""

from typing import Dict, Type, Any
from app.agents.base_agent import BaseMedicalAgent

# Import all specialist agents
from app.agents.specialists.general_physician_agent import GeneralPhysicianAgent
from app.agents.specialists.cardiologist_agent import CardiologistAgent
from app.agents.specialists.dermatologist_agent import DermatologistAgent
from app.agents.specialists.ent_specialist_agent import ENTSpecialistAgent
from app.agents.specialists.eye_specialist_agent import EyeSpecialistAgent
from app.agents.specialists.orthopedic_agent import OrthopedicAgent
from app.agents.specialists.dentist_agent import DentistAgent
from app.agents.specialists.pediatrician_agent import PediatricianAgent
from app.agents.specialists.pharmacy_agent import PharmacyAgent
from app.agents.specialists.nutritionist_agent import NutritionistAgent


# Agent registry mapping agent_id to agent class
AGENT_REGISTRY: Dict[str, Type[BaseMedicalAgent]] = {
    "general-physician": GeneralPhysicianAgent,
    "cardiologist-specialist": CardiologistAgent,
    "dermatologist-specialist": DermatologistAgent,
    "ent-specialist": ENTSpecialistAgent,
    "eye-specialist": EyeSpecialistAgent,
    "orthopedic-specialist": OrthopedicAgent,
    "dentist-specialist": DentistAgent,
    "pediatrician-specialist": PediatricianAgent,
    "pharmacy-assistant": PharmacyAgent,
    "nutritionist-specialist": NutritionistAgent,
}


def get_agent(agent_id: str) -> BaseMedicalAgent:
    """
    Get an agent instance by ID.
    
    Args:
        agent_id: Specialist agent ID (e.g., "cardiologist-specialist")
    
    Returns:
        Initialized agent instance
    
    Raises:
        ValueError: If agent_id is not found
    """
    agent_class = AGENT_REGISTRY.get(agent_id)
    if not agent_class:
        available_agents = ", ".join(AGENT_REGISTRY.keys()) if AGENT_REGISTRY else "No agents registered yet"
        raise ValueError(f"Agent '{agent_id}' not found. Available agents: {available_agents}")
    return agent_class()


def get_all_agents() -> Dict[str, Dict[str, Any]]:
    """
    Get information about all available agents.
    
    Returns:
        Dictionary mapping agent_id to agent info
    """
    agents_info = {}
    for agent_id, agent_class in AGENT_REGISTRY.items():
        try:
            agent = agent_class()
            agents_info[agent_id] = {
                "name": agent.name,
                "agent_id": agent_id,
                **agent.get_specialty_info()
            }
        except Exception as e:
            agents_info[agent_id] = {
                "name": "Error loading agent",
                "error": str(e)
            }
    return agents_info


def list_specialists() -> list:
    """
    Get list of all specialist names.
    
    Returns:
        List of specialist display names
    """
    return [info["name"] for info in get_all_agents().values()]


def register_agent(agent_id: str, agent_class: Type[BaseMedicalAgent]):
    """
    Register a new agent class.
    
    Args:
        agent_id: Unique agent identifier
        agent_class: Agent class (not instance)
    """
    AGENT_REGISTRY[agent_id] = agent_class
