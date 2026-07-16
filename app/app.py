import os
import asyncio
import uuid

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from routes import je_router, tb_router, ic_router, bs_router, get_token, logger, PORT, SERVING_ENDPOINT_BASE

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="R2A Backend API",
    description="Backend for Journal Entry & Trial Balance \u2013 connects to real Unity Catalog tables",
    version="2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Include domain routers
# ---------------------------------------------------------------------------
app.include_router(je_router)
app.include_router(tb_router)
app.include_router(ic_router)
app.include_router(bs_router)

# ---------------------------------------------------------------------------
# In-memory async task store (workflow polling pattern)
# ---------------------------------------------------------------------------
_tasks: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "r2a-backend"}


# ===================================================================
# PROXY \u2013 Databricks Serving Endpoints (JE workflow agent trigger)
# ===================================================================

# --------------- Async background worker ---------------

async def _call_serving_endpoint(task_id: str, target_url: str, body: bytes, token: str, content_type: str):
    """Background worker \u2013 calls the serving endpoint and stores the result."""
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
        _tasks[task_id] = {"status": "completed", "statusCode": resp.status_code, "result": payload}
    except Exception as exc:
        _tasks[task_id] = {"status": "failed", "error": str(exc)}


# --------------- Submit / Status (polling pattern) ---------------

@app.post("/api/workflow/submit")
async def submit_workflow(request: Request):
    """Kick off the serving-endpoint call in the background; return a task_id immediately."""
    token = get_token()
    body = await request.body()
    target_url = f"{SERVING_ENDPOINT_BASE}/serving-endpoints/je-agent-demo-endpoint-v2/invocations"
    content_type = request.headers.get("content-type", "application/json")
    task_id = uuid.uuid4().hex
    _tasks[task_id] = {"status": "running"}
    asyncio.get_event_loop().create_task(
        _call_serving_endpoint(task_id, target_url, body, token, content_type)
    )
    return JSONResponse(content={"task_id": task_id, "status": "running"})


@app.get("/api/workflow/status/{task_id}")
async def workflow_status(task_id: str):
    """Poll this endpoint to check whether the background workflow call has finished."""
    task = _tasks.get(task_id)
    if not task:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Task not found"})
    if task["status"] == "completed":
        result = _tasks.pop(task_id)
        return JSONResponse(status_code=result["statusCode"], content={"status": "completed", "result": result["result"]})
    if task["status"] == "failed":
        result = _tasks.pop(task_id)
        return JSONResponse(status_code=500, content={"status": "failed", "error": result["error"]})
    return JSONResponse(content={"status": "running"})


# --------------- Direct proxy (fallback) ---------------

@app.api_route(
    "/api/serving-endpoints/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE"],
)
async def proxy_serving_endpoint(request: Request, path: str):
    """Proxy requests to Databricks serving endpoints (e.g. je-agent-demo-endpoint-v2)."""
    token = get_token()
    target_url = f"{SERVING_ENDPOINT_BASE}/serving-endpoints/{path}"
    body = await request.body()

    async with httpx.AsyncClient(timeout=300.0) as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            content=body if body else None,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": request.headers.get("content-type", "application/json"),
            },
        )

    try:
        content = resp.json()
    except Exception:
        content = {"raw": resp.text}

    return JSONResponse(status_code=resp.status_code, content=content)


# ===================================================================
# STATIC FRONTEND (Vite build output)
# ===================================================================

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the Vite SPA \u2013 static assets first, then fallback to index.html."""
    if full_path.startswith("api/"):
        return JSONResponse(
            status_code=404,
            content={"status": "error", "message": "API route not found"},
        )
    file_path = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return JSONResponse(
        status_code=503,
        content={"error": "Frontend not built. Run 'npm run build' first."},
    )


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logger.info("Starting R2A backend on port %s", PORT)
    uvicorn.run(app, host="0.0.0.0", port=PORT)
