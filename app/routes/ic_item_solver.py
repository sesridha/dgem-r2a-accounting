import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .helpers import get_token, logger

# ---------------------------------------------------------------------------
# IC Item Solver Router
# Proxies requests to the IC Item Solver Databricks App.
# Auth: Service principal token via get_token().
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api", tags=["IC Item Solver"])

IC_APP_BASE_URL = (
    "https://ic-item-sample-api-7405615922005290.10.azure.databricksapps.com"
)


@router.get("/ic-item-solver/raw-files")
async def get_ic_raw_files():
    """Proxy to the IC Item Solver Databricks App /data/raw-files endpoint."""
    token = get_token()
    target_url = f"{IC_APP_BASE_URL}/data/raw-files"

    try:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=False) as client:
            resp = await client.get(
                target_url,
                headers={"Authorization": f"Bearer {token}"},
            )

        ct = resp.headers.get("content-type", "")
        logger.info("[IC proxy] status=%s ct=%s len=%s", resp.status_code, ct, len(resp.content))

        if resp.is_redirect or "text/html" in ct:
            return JSONResponse(status_code=502, content={
                "status": "error",
                "message": "IC App auth failed — check SP permissions on the IC App",
            })

        return JSONResponse(status_code=resp.status_code, content=resp.json())

    except httpx.TimeoutException:
        return JSONResponse(status_code=504, content={"status": "error", "message": "IC App timed out"})
    except Exception as exc:
        logger.exception("[IC proxy] %s", exc)
        return JSONResponse(status_code=502, content={"status": "error", "message": str(exc)})
