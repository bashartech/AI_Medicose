from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.drug_service import get_rxcui, check_interaction

router = APIRouter()

class DrugInteractionRequest(BaseModel):
    drug1: str
    drug2: str

@router.post("/check-interaction")
async def check_drug_interaction(request: DrugInteractionRequest):
    """
    Check for interactions between two drugs.
    """
    # 1. Get RxCUIs for both drugs
    rxcui1 = await get_rxcui(request.drug1)
    rxcui2 = await get_rxcui(request.drug2)

    if not rxcui1 or not rxcui2:
        raise HTTPException(status_code=404, detail="One or both drugs not found in database. Please check spelling.")

    # 2. Check for interactions
    interaction = await check_interaction(rxcui1, rxcui2)

    if interaction:
        return interaction
    
    return {"severity": "None", "description": "No significant interactions found between these two drugs."}
