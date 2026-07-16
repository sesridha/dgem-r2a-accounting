import os
import math
import time
import logging
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Optional

import httpx
from databricks import sql as databricks_sql

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("r2a-backend")

# ---------------------------------------------------------------------------
# Configuration (environment variables set by Databricks Apps runtime)
# ---------------------------------------------------------------------------
RAW_HOST = os.getenv("DATABRICKS_HOST", "")
DATABRICKS_HOST = RAW_HOST if RAW_HOST.startswith("https://") else f"https://{RAW_HOST}"
SERVER_HOSTNAME = RAW_HOST.replace("https://", "").replace("http://", "")

# Serving endpoint target (fixed workspace URL)
SERVING_ENDPOINT_BASE = "https://adb-7405615922005290.10.azuredatabricks.net"

HTTP_PATH = os.getenv(
    "DATABRICKS_SQL_HTTP_PATH",
    "/sql/1.0/warehouses/dcd626e7d6645f1d",
)
CLIENT_ID = os.getenv("DATABRICKS_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("DATABRICKS_CLIENT_SECRET", "")
PORT = int(os.getenv("DATABRICKS_APP_PORT", os.getenv("PORT", "8000")))

# ---------------------------------------------------------------------------
# OAuth token cache (service-principal client_credentials flow)
# ---------------------------------------------------------------------------
_cached_token: Optional[str] = None
_token_expiry: float = 0


def get_token() -> str:
    global _cached_token, _token_expiry
    if _cached_token and time.time() < _token_expiry:
        return _cached_token

    resp = httpx.post(
        f"{DATABRICKS_HOST}/oidc/v1/token",
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "scope": "all-apis",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    resp.raise_for_status()
    payload = resp.json()
    _cached_token = payload["access_token"]
    _token_expiry = time.time() + payload.get("expires_in", 3600) - 60
    logger.info("Refreshed Databricks OAuth token")
    return _cached_token


# ---------------------------------------------------------------------------
# SQL helpers
# ---------------------------------------------------------------------------
def get_connection():
    token = get_token()
    return databricks_sql.connect(
        server_hostname=SERVER_HOSTNAME,
        http_path=HTTP_PATH,
        access_token=token,
    )


def _serialize_value(val):
    """Convert DB driver types to JSON-safe Python types."""
    try:
        if val is None:
            return None
        if isinstance(val, (date, datetime)):
            return val.isoformat()
        if isinstance(val, Decimal):
            try:
                f = float(val)
                return f if math.isfinite(f) else None
            except (ValueError, InvalidOperation, OverflowError):
                return None
        if isinstance(val, float):
            return val if math.isfinite(val) else None
        if isinstance(val, bytes):
            return val.decode("utf-8", errors="replace")
        # Handle Databricks Row objects (structs) - must come BEFORE tuple check
        if hasattr(val, "asDict"):
            return {k: _serialize_value(v) for k, v in val.asDict().items()}
        if isinstance(val, dict):
            return {str(k): _serialize_value(v) for k, v in val.items()}
        if isinstance(val, (list, tuple)):
            return [_serialize_value(v) for v in val]
        # Primitive types pass through; unknown types converted to string
        if isinstance(val, (int, str, bool)):
            return val
        return str(val)
    except Exception as exc:
        logger.warning("Serialization fallback for %s: %s", type(val).__name__, exc)
        return str(val)


def run_query(query: str) -> list[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]
        return [
            {col: _serialize_value(val) for col, val in zip(cols, row)}
            for row in rows
        ]
    except Exception:
        logger.exception("SQL query failed: %s", query[:200])
        raise
    finally:
        conn.close()
