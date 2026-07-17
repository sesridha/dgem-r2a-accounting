from typing import Optional

from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse

from .helpers import run_query

# ---------------------------------------------------------------------------
# Journal Entry Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api", tags=["Journal Entries"])


@router.get("/journal-entries")
def get_journal_entries(
    document_name: Optional[str] = Query(None),
    company_code: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """
    Return JE input data (je_preparation), business rules, and proof-of-work.
    """

    # --- je_preparation (INPUT table) ---
    prep_where: list[str] = []
    if document_name:
        prep_where.append(f"document_name = '{document_name}'")
    if company_code:
        prep_where.append(f"company_code = '{company_code}'")
    prep_clause = (" WHERE " + " AND ".join(prep_where)) if prep_where else ""
    prep_query = f"""
        SELECT * FROM r2a.journal.je_preparation
        {prep_clause}
        ORDER BY company_code, document_number
        LIMIT {limit}
    """

    # --- business_rules_staging filtered for Journal Entry ---
    rules_query = """
        SELECT * FROM r2a.shared.business_rules
        WHERE sub_system_name = 'Journal Entry'
        ORDER BY document_name, order_of_execution
    """

    # --- proof_of_work ---
    pow_query = f"""
        SELECT * FROM r2a.shared.proof_of_work
        ORDER BY `timestamp` DESC
        LIMIT {limit}
    """

    prep_data = run_query(prep_query)
    rules_data = run_query(rules_query)
    pow_data = run_query(pow_query)

    return JSONResponse(content={
        "data": {
            "je_preparation": {"rows": prep_data, "count": len(prep_data)},
            "business_rules_staging": {"rows": rules_data, "count": len(rules_data)},
            "proof_of_work": {"rows": pow_data, "count": len(pow_data)},
        },
        "status": "success",
    })


@router.get("/journal-entries/{entry_id}")
def get_journal_entry_by_id(entry_id: int):
    query = f"SELECT * FROM r2a.journal.je_preparation WHERE je_preparation_id = {entry_id}"
    data = run_query(query)
    if data:
        return JSONResponse(content={"data": data[0], "status": "success"})
    return JSONResponse(
        status_code=404,
        content={"status": "error", "message": "Journal entry not found"},
    )


@router.post("/journal-entries")
async def create_journal_entry(request: Request):
    """Placeholder – forward to workflow or insert."""
    body = await request.json()
    return JSONResponse(content={"data": body, "status": "success", "message": "Received (no-op placeholder)"})


@router.get("/je/posting")
def get_je_posting(
    document_name: Optional[str] = Query(None),
    company_code: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """JE output table – used after workflow execution."""
    conditions: list[str] = []
    if document_name:
        conditions.append(f"b.document_name = '{document_name}'")
    if company_code:
        conditions.append(f"a.company_code = '{company_code}'")
    # Always restrict to the latest load batch
    conditions.append("a.load_timestamp = (SELECT max(load_timestamp) FROM r2a.journal.je_posting)")
    where = " WHERE " + " AND ".join(conditions)
    query = f"""
        SELECT a.* FROM r2a.journal.je_posting a
        JOIN r2a.journal.je_preparation b
          ON a.je_preparation_id = b.je_preparation_id
        {where}
        ORDER BY a.posting_date DESC
        LIMIT {limit}
    """
    data = run_query(query)
    return JSONResponse(content={"data": data, "status": "success"})
