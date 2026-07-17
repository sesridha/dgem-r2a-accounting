import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from .helpers import get_token, logger

# ---------------------------------------------------------------------------
# Balance Sheet Item Solver Router
# Proxies requests to the Balance Sheet Item Solver Databricks App.
# Auth: Service principal token via get_token().
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api", tags=["Balance Sheet Solver"])

BS_APP_BASE_URL = (
    "https://balance-sheet-item-solver-7405615922005290.10.azure.databricksapps.com"
)


@router.post("/balance-sheet-solver/summary")
async def get_bs_summary():
    """Proxy to the Balance Sheet Item Solver Databricks App /reco/summary endpoint.
    Returns summary records with company, report_title, count, records[], and total.
    Frontend extracts unique OUs from the records."""
    token = get_token()
    target_url = f"{BS_APP_BASE_URL}/reco/summary"

    try:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=False) as client:
            resp = await client.post(
                target_url,
                content=b"{}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )

        ct = resp.headers.get("content-type", "")
        logger.info("[BS proxy] summary status=%s ct=%s len=%s", resp.status_code, ct, len(resp.content))

        if resp.is_redirect or "text/html" in ct:
            return JSONResponse(status_code=502, content={
                "status": "error",
                "message": "Balance Sheet App auth failed \u2014 check SP permissions on the App",
            })

        return JSONResponse(status_code=resp.status_code, content=resp.json())

    except httpx.TimeoutException:
        return JSONResponse(status_code=504, content={"status": "error", "message": "Balance Sheet App timed out"})
    except Exception as exc:
        logger.exception("[BS proxy] summary %s", exc)
        return JSONResponse(status_code=502, content={"status": "error", "message": str(exc)})


@router.post("/balance-sheet-solver/run-agent")
async def run_bs_agent(request: Request):
    """Proxy to the Balance Sheet Item Solver Databricks App /agent/run-narration endpoint."""
    token = get_token()
    target_url = f"{BS_APP_BASE_URL}/agent/run-narration"
    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=300.0, follow_redirects=False) as client:
            resp = await client.post(
                target_url,
                content=body,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )

        ct = resp.headers.get("content-type", "")
        logger.info("[BS proxy] run-agent status=%s ct=%s len=%s", resp.status_code, ct, len(resp.content))

        if resp.is_redirect or "text/html" in ct:
            return JSONResponse(status_code=502, content={
                "status": "error",
                "message": "Balance Sheet App auth failed \u2014 check SP permissions on the App",
            })

        return JSONResponse(status_code=resp.status_code, content=resp.json())

    except httpx.TimeoutException:
        return JSONResponse(status_code=504, content={
            "status": "error",
            "message": "Balance Sheet Agent timed out. The reconciliation may take longer for large OU sets.",
        })
    except Exception as exc:
        logger.exception("[BS proxy] run-agent %s", exc)
        return JSONResponse(status_code=502, content={"status": "error", "message": str(exc)})


@router.post("/balance-sheet-solver/drilldown")
async def get_bs_drilldown(request: Request):
    """Proxy to the Balance Sheet Item Solver Databricks App /reco/drilldown endpoint."""
    token = get_token()
    target_url = f"{BS_APP_BASE_URL}/reco/drilldown"
    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=180.0, follow_redirects=False) as client:
            resp = await client.post(
                target_url,
                content=body,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )

        ct = resp.headers.get("content-type", "")
        logger.info("[BS proxy] drilldown status=%s ct=%s len=%s", resp.status_code, ct, len(resp.content))

        if resp.is_redirect or "text/html" in ct:
            return JSONResponse(status_code=502, content={
                "status": "error",
                "message": "Balance Sheet App auth failed \u2014 check SP permissions on the App",
            })

        return JSONResponse(status_code=resp.status_code, content=resp.json())

    except httpx.TimeoutException:
        return JSONResponse(status_code=504, content={"status": "error", "message": "Drilldown request timed out"})
    except Exception as exc:
        logger.exception("[BS proxy] drilldown %s", exc)
        return JSONResponse(status_code=502, content={"status": "error", "message": str(exc)})
