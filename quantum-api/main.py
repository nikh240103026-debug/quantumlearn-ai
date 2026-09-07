import os
import time
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


QUANTUM_API_KEY = os.getenv(
    "QUANTUM_API_KEY"
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "QUANTUM_ALLOWED_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]


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
    if (
        QUANTUM_API_KEY
        and x_api_key != QUANTUM_API_KEY
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid quantum API key.",
        )

    started_at = time.perf_counter()

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

        return {
            "success": True,
            **result,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error