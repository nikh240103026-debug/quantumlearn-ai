import logging
import os
import time
import traceback
from typing import Any

from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    Header,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine import execute


load_dotenv()


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
)

logger = logging.getLogger(
    "quantumlearn.quantum-api"
)


# ============================================================
# ENVIRONMENT
# ============================================================

QUANTUM_API_KEY = os.getenv(
    "QUANTUM_API_KEY"
)

QBRAID_API_KEY = os.getenv(
    "QBRAID_API_KEY"
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "QUANTUM_ALLOWED_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="QuantumLearn Quantum Execution API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ExecutionRequest(BaseModel):
    backend: str

    qubits: int = Field(
        ge=1,
        le=30,
    )

    shots: int = Field(
        ge=1,
        le=100000,
    )

    circuit: list[
        dict[str, Any]
    ]


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "service":
            "QuantumLearn Quantum Execution API",
        "status":
            "ok",
    }


@app.get("/health")
def health():
    return {
        "status":
            "healthy",
        "service":
            "quantum-engine",
    }


@app.post("/execute")
def execute_quantum(
    payload: ExecutionRequest,
    x_api_key: str | None = Header(
        default=None,
    ),
):
    # --------------------------------------------------------
    # QuantumLearn API authentication
    # --------------------------------------------------------

    if (
        QUANTUM_API_KEY
        and x_api_key != QUANTUM_API_KEY
    ):
        logger.warning(
            "Rejected /execute request: invalid QuantumLearn API key."
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid quantum API key.",
        )

    started_at = time.perf_counter()

    logger.info(
        "Quantum execution requested: backend=%s qubits=%s shots=%s",
        payload.backend,
        payload.qubits,
        payload.shots,
    )

    # --------------------------------------------------------
    # qBraid diagnostic information
    # --------------------------------------------------------

    if payload.backend == "qbraid":
        logger.info(
            "qBraid execution requested. "
            "QBRAID_API_KEY configured=%s, key_length=%s",
            bool(QBRAID_API_KEY),
            len(QBRAID_API_KEY or ""),
        )

    # --------------------------------------------------------
    # Execute
    # --------------------------------------------------------

    try:
        result = execute(
            payload.model_dump()
        )

        result[
            "executionTimeMs"
        ] = round(
            (
                time.perf_counter()
                - started_at
            )
            * 1000,
            2,
        )

        logger.info(
            "Quantum execution completed successfully: backend=%s time_ms=%s",
            payload.backend,
            result["executionTimeMs"],
        )

        return {
            "success": True,
            **result,
        }

    except Exception as error:

        # IMPORTANT:
        # Print the complete traceback into Render logs.
        logger.error(
            "Quantum execution FAILED: backend=%s error=%s",
            payload.backend,
            str(error),
        )

        logger.error(
            "Complete execution traceback:\n%s",
            traceback.format_exc(),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error