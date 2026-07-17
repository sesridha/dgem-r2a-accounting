import asyncio
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse

from .helpers import run_query, get_token, SERVING_ENDPOINT_BASE, logger

# ---------------------------------------------------------------------------
# Trial Balance Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api", tags=["Trial Balance"])

# TB serving endpoint
TB_SERVING_ENDPOINT = (
    f"{SERVING_ENDPOINT_BASE}/serving-endpoints/tb-agent-deploy-endpoint-v2/invocations"
)

# In-memory async task store (TB workflow polling)
_tb_tasks: dict[str, dict] = {}


# ===================================================================
# DATA ENDPOINTS – Trial Balance tables (r2a.trial_balance.*)
# ===================================================================

# 1. tb_preparation  →  Trial Balance Input data
# ------------------------------------------------------------------
@router.get("/trial-balance")
def get_trial_balance(
    company_code: Optional[str] = Query(None),
    account_group: Optional[str] = Query(None),
    bs_pl_item_text: Optional[str] = Query(None),
    fiscal_year: Optional[int] = Query(None),
    fiscal_period: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """Return TB input data from tb_preparation."""
    conditions: list[str] = []
    if company_code:
        conditions.append(f"company_code = '{company_code}'")
    if account_group:
        conditions.append(f"account_group = '{account_group}'")
    if bs_pl_item_text:
        conditions.append(f"bs_pl_item_text = '{bs_pl_item_text}'")
    if fiscal_year:
        conditions.append(f"fiscal_year = {fiscal_year}")
    if fiscal_period:
        conditions.append(f"period = {fiscal_period}")
    where = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    query = f"""
        SELECT * FROM r2a.trial_balance.tb_preparation
        {where}
        ORDER BY company_code, account_number
        LIMIT {limit}
    """
    try:
        data = run_query(query)
    except Exception as exc:
        logger.exception("tb_preparation query failed")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(exc)},
        )

    return JSONResponse(content={
        "data": {
            "tb_preparation": {"rows": data, "count": len(data)},
        },
        "status": "success",
    })


# 2. tb_transaction_reference  →  Posting-level input data
# ------------------------------------------------------------------
@router.get("/trial-balance/transaction-reference")
def get_tb_transaction_reference(
    company_code: Optional[str] = Query(None),
    account_number: Optional[str] = Query(None),
    fiscal_year: Optional[int] = Query(None),
    fiscal_period: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """Posting-level input data from tb_transaction_reference."""
    conditions: list[str] = []
    if company_code:
        conditions.append(f"company_code = '{company_code}'")
    if account_number:
        conditions.append(f"account_number = '{account_number}'")
    if fiscal_year:
        conditions.append(f"fiscal_year = {fiscal_year}")
    if fiscal_period:
        conditions.append(f"period = {fiscal_period}")
    where = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    query = f"""
        SELECT * FROM r2a.trial_balance.tb_transaction_reference
        {where}
        ORDER BY company_code, account_number
        LIMIT {limit}
    """
    data = run_query(query)
    return JSONResponse(content={
        "data": {"rows": data, "count": len(data)},
        "status": "success",
    })


# 3. tb_business_rules  →  Configured business rules
# ------------------------------------------------------------------
@router.get("/trial-balance/business-rules")
def get_tb_business_rules(limit: int = Query(1000, ge=1, le=10000)):
    """Configured business rules for Trial Balance."""
    query = f"""
        SELECT * FROM r2a.trial_balance.tb_business_rules
        ORDER BY document_name, order_of_execution
        LIMIT {limit}
    """
    data = run_query(query)
    return JSONResponse(content={
        "data": {"rows": data, "count": len(data)},
        "status": "success",
    })


# 4. tb_anomaly_detection  →  Deduped anomaly results (latest per account)
# ------------------------------------------------------------------
@router.get("/trial-balance/anomaly-detection")
def get_tb_anomaly_detection(
    company_code: Optional[str] = Query(None),
    fiscal_year: Optional[int] = Query(None),
    current_period: Optional[int] = Query(None),
    comparison_period: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """
    Anomaly detection results – deduped to latest row per
    (company_code, account_number, fiscal_year).
    Each row already contains both current_period_amount and
    comparison_period_amount, so we only filter on the current
    period to avoid returning duplicate rows per account.
    """
    # --- inner WHERE for the CTE ---
    inner_conditions: list[str] = []
    if company_code:
        inner_conditions.append(f"company_code = '{company_code}'")
    if fiscal_year:
        inner_conditions.append(f"fiscal_year = {fiscal_year}")
    if current_period:
        inner_conditions.append(f"period = {current_period}")

    inner_where = (" WHERE " + " AND ".join(inner_conditions)) if inner_conditions else ""

    query = f"""
        WITH ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY company_code, account_number, fiscal_year
                    ORDER BY created_on DESC
                ) AS rn
            FROM r2a.trial_balance.tb_anomaly_detection
            {inner_where}
        )
        SELECT
            company_code,
            account_number,
            account_name,
            fiscal_year,
            period,
            current_period_amount,
            comparison_period_amount,
            change_in_percentage,
            anomaly_flag,
            anomaly_explanation,
            tb_preparation_id,
            created_by,
            created_on,
            updated_by,
            updated_on,
            business_rules_applied
        FROM ranked
        WHERE rn = 1
        ORDER BY anomaly_flag DESC, company_code, account_number
        LIMIT {limit}
    """

    try:
        data = run_query(query)
    except Exception as exc:
        logger.exception("tb_anomaly_detection query failed")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(exc)},
        )

    anomaly_count = sum(1 for row in data if row.get("anomaly_flag") == "Y")
    risk = "high" if anomaly_count > 50 else ("medium" if anomaly_count > 20 else "low")
    return JSONResponse(content={
        "data": {"rows": data, "count": len(data), "anomalyCount": anomaly_count, "riskLevel": risk},
        "status": "success",
    })


# 5. tb_anomaly_explanation  →  Final output table with anomaly explanations
# ------------------------------------------------------------------
@router.get("/trial-balance/anomaly-explanation")
def get_tb_anomaly_explanation(
    company_code: Optional[str] = Query(None),
    account_number: Optional[str] = Query(None),
    account_group: Optional[str] = Query(None),
    fiscal_year: Optional[int] = Query(None),
    fiscal_period: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
):
    """
    Final output table with anomaly explanations.
    Deduped to the latest row per (company_code, account_number,
    fiscal_year, period) using created_on DESC.
    """
    conditions: list[str] = []
    if company_code:
        conditions.append(f"company_code = '{company_code}'")
    if account_number:
        conditions.append(f"account_number = '{account_number}'")
    if account_group:
        conditions.append(f"account_group = '{account_group}'")
    if fiscal_year:
        conditions.append(f"fiscal_year = {fiscal_year}")
    if fiscal_period:
        conditions.append(f"period = {fiscal_period}")
    inner_where = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    query = f"""
        WITH ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY company_code, account_number, fiscal_year, period
                    ORDER BY created_on DESC
                ) AS rn
            FROM r2a.trial_balance.tb_anomaly_explanation
            {inner_where}
        )
        SELECT *
        FROM ranked
        WHERE rn = 1
        ORDER BY company_code, account_number
        LIMIT {limit}
    """
    data = run_query(query)
    # Remove the internal rn column from each row before returning
    for row in data:
        row.pop("rn", None)
    return JSONResponse(content={
        "data": {"rows": data, "count": len(data)},
        "status": "success",
    })


# ===================================================================
# WORKFLOW – TB Agent Serving Endpoint (polling pattern)
# ===================================================================

async def _call_tb_serving_endpoint(
    task_id: str, target_url: str, body: bytes, token: str, content_type: str,
):
    """Background worker – calls the TB serving endpoint and stores the result."""
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(
                target_url,
                content=body,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": content_type,
                },
            )
        try:
            payload = resp.json()
        except Exception:
            payload = {"raw": resp.text}
        _tb_tasks[task_id] = {
            "status": "completed",
            "statusCode": resp.status_code,
            "result": payload,
        }
    except Exception as exc:
        logger.exception("TB serving endpoint call failed")
        _tb_tasks[task_id] = {"status": "failed", "error": str(exc)}


@router.post("/tb/workflow/submit")
async def submit_tb_workflow(request: Request):
    """
    Kick off the TB agent serving-endpoint call in the background.
    Returns a task_id for polling.

    Expected payload example:
    {
      "dataframe_split": {
        "columns": ["request","prev_year","prev_period","curr_year","curr_period","company_code"],
        "data": [["Run TB anomaly analysis",2024,11,2025,12,"1001"]]
      }
    }
    """
    token = get_token()
    body = await request.body()
    content_type = request.headers.get("content-type", "application/json")
    task_id = uuid.uuid4().hex
    _tb_tasks[task_id] = {"status": "running"}
    asyncio.get_event_loop().create_task(
        _call_tb_serving_endpoint(task_id, TB_SERVING_ENDPOINT, body, token, content_type)
    )
    return JSONResponse(content={"task_id": task_id, "status": "running"})


@router.get("/tb/workflow/status/{task_id}")
async def tb_workflow_status(task_id: str):
    """Poll this endpoint to check whether the TB workflow call has finished."""
    task = _tb_tasks.get(task_id)
    if not task:
        return JSONResponse(
            status_code=404,
            content={"status": "error", "message": "Task not found"},
        )
    if task["status"] == "completed":
        result = _tb_tasks.pop(task_id)
        return JSONResponse(
            status_code=result["statusCode"],
            content={"status": "completed", "result": result["result"]},
        )
    if task["status"] == "failed":
        result = _tb_tasks.pop(task_id)
        return JSONResponse(
            status_code=500,
            content={"status": "failed", "error": result["error"]},
        )
    return JSONResponse(content={"status": "running"})
