import logging
import os
import subprocess
import sys
import tempfile
import time
import traceback
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine import execute


load_dotenv()


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(
    "quantumlearn.quantum-api"
)


# ============================================================
# ENVIRONMENT
# ============================================================

QUANTUM_API_KEY = os.getenv(
    "QUANTUM_API_KEY",
    "",
).strip()

QBRAID_API_KEY = os.getenv(
    "QBRAID_API_KEY",
    "",
).strip()

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "QUANTUM_ALLOWED_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]


# ============================================================
# CODE EXECUTION CONFIGURATION
# ============================================================

MAX_CODE_LENGTH = 50_000
CODE_TIMEOUT_SECONDS = 15
MAX_OUTPUT_LENGTH = 1_000_000

ALLOWED_IMPORTS = (
    "qiskit",
    "qiskit_aer",
    "pennylane",
    "cirq",
    "numpy",
    "scipy",
    "matplotlib",
    "math",
    "cmath",
    "statistics",
    "collections",
    "itertools",
    "functools",
    "fractions",
    "decimal",
    "random",
)

BLOCKED_CODE_PATTERNS = [
    "os.system",
    "os.popen",
    "subprocess",
    "socket",
    "requests",
    "urllib",
    "httpx",
    "ctypes",
    "winreg",
    "pathlib",
    "__import__",
    "importlib",
    "eval(",
    "exec(",
    "compile(",
    "open(",
    "builtins",
    "globals(",
    "locals(",
    "getattr(",
    "setattr(",
    "delattr(",
]


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="QuantumLearn Quantum Execution API",
    version="1.1.0",
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
# QUANTUM REQUEST MODEL
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
# CODE EXECUTION REQUEST MODEL
# ============================================================

class CodeExecutionRequest(BaseModel):
    code: str = Field(
        min_length=1,
        max_length=MAX_CODE_LENGTH,
    )


# ============================================================
# AUTHENTICATION
# ============================================================

def verify_api_key(
    x_api_key: str | None,
) -> None:
    if (
        QUANTUM_API_KEY
        and x_api_key != QUANTUM_API_KEY
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid quantum API key.",
        )


# ============================================================
# CODE VALIDATION
# ============================================================

def validate_code(
    code: str,
) -> str | None:

    if not code.strip():
        return "No code was provided."

    if len(code) > MAX_CODE_LENGTH:
        return (
            f"Code is too large. Maximum allowed "
            f"size is {MAX_CODE_LENGTH} characters."
        )

    lowered = code.lower()

    for pattern in BLOCKED_CODE_PATTERNS:
        if pattern.lower() in lowered:
            return (
                "This code contains a restricted "
                "operation and cannot be executed."
            )

    # Validate explicit imports.
    for line in code.splitlines():
        stripped = line.strip()

        if stripped.startswith("import "):
            imported_part = stripped[
                len("import "):
            ]

            modules = [
                item.strip().split(" as ")[0].strip()
                for item in imported_part.split(",")
            ]

            for module in modules:
                if not any(
                    module == allowed
                    or module.startswith(
                        allowed + "."
                    )
                    for allowed in ALLOWED_IMPORTS
                ):
                    return (
                        f"Import '{module}' is not "
                        "allowed in the QuantumLearn coding environment."
                    )

        elif stripped.startswith("from "):
            parts = stripped.split()

            if len(parts) >= 2:
                module = parts[1].strip()

                if not any(
                    module == allowed
                    or module.startswith(
                        allowed + "."
                    )
                    for allowed in ALLOWED_IMPORTS
                ):
                    return (
                        f"Import '{module}' is not "
                        "allowed in the QuantumLearn coding environment."
                    )

    return None


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


# ============================================================
# QUANTUM CIRCUIT EXECUTION
# ============================================================

@app.post("/execute")
def execute_quantum(
    payload: ExecutionRequest,
    x_api_key: str | None = Header(
        default=None,
    ),
):
    verify_api_key(
        x_api_key,
    )

    started_at = time.perf_counter()

    logger.info(
        "Quantum execution requested: "
        "backend=%s qubits=%s shots=%s",
        payload.backend,
        payload.qubits,
        payload.shots,
    )

    if payload.backend == "qbraid":
        logger.info(
            "qBraid execution requested. "
            "QBRAID_API_KEY configured=%s",
            bool(QBRAID_API_KEY),
        )

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
            "Quantum execution completed: "
            "backend=%s time_ms=%s",
            payload.backend,
            result["executionTimeMs"],
        )

        return {
            "success": True,
            **result,
        }

    except Exception as error:
        logger.error(
            "Quantum execution FAILED: "
            "backend=%s error=%s",
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


# ============================================================
# PYTHON QUANTUM CODING EXECUTION
# ============================================================

@app.post("/execute-code")
def execute_code(
    payload: CodeExecutionRequest,
    x_api_key: str | None = Header(
        default=None,
    ),
):
    verify_api_key(
        x_api_key,
    )

    code = payload.code

    validation_error = validate_code(
        code,
    )

    if validation_error:
        raise HTTPException(
            status_code=400,
            detail=validation_error,
        )

    started_at = time.perf_counter()

    temporary_directory = None

    try:
        temporary_directory = tempfile.mkdtemp(
            prefix="quantumlearn-code-",
        )

        script_path = Path(
            temporary_directory
        ) / "main.py"

        script_path.write_text(
            code,
            encoding="utf-8",
        )

        environment = {
            "PATH": os.getenv(
                "PATH",
                "",
            ),
            "PYTHONIOENCODING": "utf-8",
            "PYTHONUTF8": "1",
            "PYTHONDONTWRITEBYTECODE": "1",
        }

        process = subprocess.run(
            [
                sys.executable,
                "-I",
                "-u",
                str(script_path),
            ],
            cwd=temporary_directory,
            capture_output=True,
            text=True,
            timeout=CODE_TIMEOUT_SECONDS,
            env=environment,
        )

        execution_time = round(
            (
                time.perf_counter()
                - started_at
            )
            * 1000,
            2,
        )

        stdout = (
            process.stdout or ""
        )[:MAX_OUTPUT_LENGTH]

        stderr = (
            process.stderr or ""
        )[:MAX_OUTPUT_LENGTH]

        if process.returncode != 0:
            return {
                "success": False,
                "output": stdout,
                "error": (
                    stderr
                    or "Python program exited with an error."
                ),
                "executionTime": execution_time,
            }

        return {
            "success": True,
            "output": (
                stdout
                or "Program executed successfully with no output."
            ),
            "error": stderr,
            "executionTime": execution_time,
        }

    except subprocess.TimeoutExpired as error:
        execution_time = round(
            (
                time.perf_counter()
                - started_at
            )
            * 1000,
            2,
        )

        stdout = (
            error.stdout or ""
        )

        stderr = (
            error.stderr or ""
        )

        if isinstance(stdout, bytes):
            stdout = stdout.decode(
                "utf-8",
                errors="replace",
            )

        if isinstance(stderr, bytes):
            stderr = stderr.decode(
                "utf-8",
                errors="replace",
            )

        return {
            "success": False,
            "output": stdout[
                :MAX_OUTPUT_LENGTH
            ],
            "error":
                "Execution timed out. "
                f"Your program must finish within "
                f"{CODE_TIMEOUT_SECONDS} seconds.",
            "executionTime":
                execution_time,
        }

    except Exception as error:
        logger.error(
            "Python code execution failed: %s",
            error,
        )

        logger.error(
            "Code execution traceback:\n%s",
            traceback.format_exc(),
        )

        return {
            "success": False,
            "output": "",
            "error": str(error),
            "executionTime": round(
                (
                    time.perf_counter()
                    - started_at
                )
                * 1000,
                2,
            ),
        }

    finally:
        if temporary_directory:
            try:
                for file in Path(
                    temporary_directory
                ).iterdir():
                    try:
                        file.unlink(
                            missing_ok=True,
                        )
                    except Exception:
                        pass

                Path(
                    temporary_directory
                ).rmdir()

            except Exception as cleanup_error:
                logger.warning(
                    "Code execution cleanup failed: %s",
                    cleanup_error,
                )