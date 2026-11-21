import ast
import logging
import os
import shutil
import signal
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

from engine import EngineInputError, execute


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

MAX_MEMORY_MB = 512

MAX_CPU_SECONDS = 15

MAX_PROCESSES = 16

MAX_FILE_SIZE_MB = 10

MAX_TEMP_FILES = 100


# ============================================================
# SANDBOX CONFIGURATION
# ============================================================
#
# Submitted code is untrusted. The AST/string filters below are only
# a first layer: Python deny-lists can always be bypassed (for example
# through modules that allowed packages import internally). The real
# security boundary is a throwaway Docker container with no network,
# a read-only filesystem, no capabilities and strict resource limits.
#
# If Docker is unavailable, execution is REFUSED (fail closed).
# For local development only, ALLOW_UNSANDBOXED_CODE_EXECUTION=true
# runs code directly on this machine. Never set it in production.

SANDBOX_IMAGE = os.getenv(
    "CODE_SANDBOX_IMAGE",
    "quantumlearn-sandbox:latest",
).strip()

DOCKER_BINARY = os.getenv(
    "DOCKER_BINARY",
    "docker",
).strip()

ALLOW_UNSANDBOXED_CODE_EXECUTION = (
    os.getenv(
        "ALLOW_UNSANDBOXED_CODE_EXECUTION",
        "",
    ).strip().lower()
    == "true"
)


# ============================================================
# ALLOWED PYTHON IMPORTS
# ============================================================

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


# ============================================================
# BLOCKED MODULES
# ============================================================

BLOCKED_MODULES = {
    "os",
    "sys",
    "subprocess",
    "socket",
    "requests",
    "urllib",
    "http",
    "httpx",
    "ftplib",
    "telnetlib",
    "smtplib",
    "ssl",
    "ctypes",
    "multiprocessing",
    "threading",
    "asyncio",
    "signal",
    "resource",
    "pty",
    "tty",
    "termios",
    "fcntl",
    "shutil",
    "pathlib",
    "glob",
    "tempfile",
    "pickle",
    "marshal",
    "shelve",
    "dbm",
    "sqlite3",
    "importlib",
    "pkgutil",
    "site",
    "venv",
    "ensurepip",
    "zipimport",
    "code",
    "codeop",
    "pdb",
    "trace",
    "profile",
    "pstats",
    "gc",
    "weakref",
}


# ============================================================
# BLOCKED AST NAMES
# ============================================================

BLOCKED_NAMES = {
    "__import__",
    "__builtins__",
    "__loader__",
    "__spec__",
    "__package__",
    "__file__",
    "__cached__",
    "__path__",
    "__globals__",
    "__locals__",
    "__code__",
    "__closure__",
    "__func__",
    "__self__",
    "__module__",
    "__class__",
    "__base__",
    "__bases__",
    "__subclasses__",
    "__mro__",
    "__dict__",
    "__getattribute__",
    "__setattr__",
    "__delattr__",
    "__reduce__",
    "__reduce_ex__",
    "__new__",
    "__init__",
    "__del__",
}


# ============================================================
# BLOCKED CALLS
# ============================================================

BLOCKED_CALL_NAMES = {
    "eval",
    "exec",
    "compile",
    "open",
    "input",
    "breakpoint",
    "__import__",
    "help",
    "exit",
    "quit",
}


# ============================================================
# BLOCKED STRING PATTERNS
# ============================================================

# This remains as a secondary layer.
# AST validation below is the primary validation layer.
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
    version="1.2.0",
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
        le=12,
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
    """
    Protect the execution API with the server-side
    QUANTUM_API_KEY.

    If the environment variable is configured,
    the supplied API key must match exactly.

    If QUANTUM_API_KEY is empty, local development
    remains compatible with the existing setup.
    """

    if (
        QUANTUM_API_KEY
        and x_api_key != QUANTUM_API_KEY
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid quantum API key.",
        )


# ============================================================
# IMPORT VALIDATION HELPERS
# ============================================================

def module_is_allowed(
    module: str,
) -> bool:
    """
    Validate an import against the explicit
    allow-list and blocked-module list.
    """

    normalized = module.strip()

    if not normalized:
        return False

    root_module = normalized.split(
        ".",
        1,
    )[0]

    if (
        root_module in BLOCKED_MODULES
        or normalized in BLOCKED_MODULES
    ):
        return False

    return any(
        normalized == allowed
        or normalized.startswith(
            allowed + "."
        )
        for allowed in ALLOWED_IMPORTS
    )


# ============================================================
# AST SECURITY VALIDATION
# ============================================================

class UnsafeCodeVisitor(
    ast.NodeVisitor
):
    """
    Performs structural validation of submitted
    Python source code.

    This is deliberately restrictive because the
    endpoint executes user-provided Python.
    """

    def __init__(self) -> None:
        self.errors: list[str] = []

    def add_error(
        self,
        message: str,
    ) -> None:
        if len(self.errors) < 10:
            self.errors.append(message)

    def visit_Import(
        self,
        node: ast.Import,
    ) -> None:
        for alias in node.names:
            module = alias.name

            if not module_is_allowed(
                module,
            ):
                self.add_error(
                    f"Import '{module}' is not allowed."
                )

        self.generic_visit(node)

    def visit_ImportFrom(
        self,
        node: ast.ImportFrom,
    ) -> None:
        module = node.module or ""

        if not module_is_allowed(
            module,
        ):
            self.add_error(
                f"Import '{module}' is not allowed."
            )

        self.generic_visit(node)

    def visit_Name(
        self,
        node: ast.Name,
    ) -> None:
        if node.id in BLOCKED_NAMES:
            self.add_error(
                f"Use of '{node.id}' is not allowed."
            )

        self.generic_visit(node)

    def visit_Attribute(
        self,
        node: ast.Attribute,
    ) -> None:
        if node.attr in BLOCKED_NAMES:
            self.add_error(
                f"Access to '{node.attr}' is not allowed."
            )

        if node.attr.startswith(
            "__"
        ):
            self.add_error(
                "Dunder attribute access is not allowed."
            )

        self.generic_visit(node)

    def visit_Call(
        self,
        node: ast.Call,
    ) -> None:
        if isinstance(
            node.func,
            ast.Name,
        ):
            if (
                node.func.id
                in BLOCKED_CALL_NAMES
            ):
                self.add_error(
                    f"Call to '{node.func.id}' is not allowed."
                )

        if isinstance(
            node.func,
            ast.Attribute,
        ):
            if node.func.attr in {
                "system",
                "popen",
                "spawn",
                "fork",
                "exec",
                "execve",
                "execl",
                "execlp",
                "execle",
                "execlpe",
                "execv",
                "execvp",
                "execvpe",
                "kill",
                "terminate",
                "start",
                "connect",
                "bind",
                "listen",
                "send",
                "sendall",
                "recv",
                "recvfrom",
                "load_library",
            }:
                self.add_error(
                    f"Call to '{node.func.attr}' is not allowed."
                )

        self.generic_visit(node)

    def visit_Lambda(
        self,
        node: ast.Lambda,
    ) -> None:
        self.generic_visit(node)

    def visit_FunctionDef(
        self,
        node: ast.FunctionDef,
    ) -> None:
        if node.name.startswith(
            "__"
        ):
            self.add_error(
                "Dunder function definitions are not allowed."
            )

        self.generic_visit(node)

    def visit_AsyncFunctionDef(
        self,
        node: ast.AsyncFunctionDef,
    ) -> None:
        if node.name.startswith(
            "__"
        ):
            self.add_error(
                "Dunder function definitions are not allowed."
            )

        self.generic_visit(node)

    def visit_ClassDef(
        self,
        node: ast.ClassDef,
    ) -> None:
        if node.name.startswith(
            "__"
        ):
            self.add_error(
                "Dunder class definitions are not allowed."
            )

        self.generic_visit(node)


def validate_ast(
    code: str,
) -> str | None:
    """
    Parse source code before execution and reject
    structurally unsafe constructs.
    """

    try:
        tree = ast.parse(
            code,
            mode="exec",
        )
    except SyntaxError as error:
        line = (
            error.lineno
            if error.lineno
            else "unknown"
        )

        return (
            f"Syntax error on line {line}."
        )

    visitor = UnsafeCodeVisitor()

    visitor.visit(tree)

    if visitor.errors:
        return visitor.errors[0]

    return None


# ============================================================
# CODE VALIDATION
# ============================================================

def validate_code(
    code: str,
) -> str | None:
    """
    Multi-layer validation.

    Layer 1:
        Size and empty-input validation.

    Layer 2:
        Fast blocked-string detection.

    Layer 3:
        AST-based structural validation.
    """

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

    ast_error = validate_ast(
        code,
    )

    if ast_error:
        return ast_error

    return None


# ============================================================
# SANDBOX ENVIRONMENT
# ============================================================

def create_execution_environment(
    temporary_directory: str,
) -> dict[str, str]:
    """
    Build a minimal environment for submitted code.

    Only the executable PATH and Python execution
    configuration are inherited.

    Sensitive application environment variables
    are deliberately not forwarded.
    """

    environment: dict[str, str] = {
        "PATH": os.getenv(
            "PATH",
            "",
        ),
        "PYTHONIOENCODING": "utf-8",
        "PYTHONUTF8": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONNOUSERSITE": "1",
        "PYTHONHASHSEED": "random",
        "HOME": temporary_directory,
        "TMP": temporary_directory,
        "TEMP": temporary_directory,
        "TMPDIR": temporary_directory,
    }

    return environment


# ============================================================
# UNIX RESOURCE LIMITS
# ============================================================

def apply_unix_resource_limits() -> None:
    """
    Apply OS-level resource limits on Unix-like systems.

    Windows does not provide the resource module,
    so Windows uses process-group termination instead.
    """

    try:
        import resource
    except ImportError:
        return

    try:
        memory_bytes = (
            MAX_MEMORY_MB
            * 1024
            * 1024
        )

        resource.setrlimit(
            resource.RLIMIT_CPU,
            (
                MAX_CPU_SECONDS,
                MAX_CPU_SECONDS + 1,
            ),
        )

        resource.setrlimit(
            resource.RLIMIT_AS,
            (
                memory_bytes,
                memory_bytes,
            ),
        )

        file_size_bytes = (
            MAX_FILE_SIZE_MB
            * 1024
            * 1024
        )

        resource.setrlimit(
            resource.RLIMIT_FSIZE,
            (
                file_size_bytes,
                file_size_bytes,
            ),
        )

        resource.setrlimit(
            resource.RLIMIT_NPROC,
            (
                MAX_PROCESSES,
                MAX_PROCESSES,
            ),
        )

    except (
        ValueError,
        OSError,
    ) as error:
        logger.warning(
            "Unable to apply one or more Unix resource limits: %s",
            error,
        )


# ============================================================
# PROCESS CONFIGURATION
# ============================================================

def build_process_kwargs(
    temporary_directory: str,
    environment: dict[str, str],
) -> dict[str, Any]:
    """
    Configure subprocess isolation in a platform-aware way.
    """

    # NOTE: Popen does not accept subprocess.run()'s `capture_output`
    # or `timeout`; passing them raised TypeError on every request.
    # The timeout is applied via communicate().
    kwargs: dict[str, Any] = {
        "cwd": temporary_directory,
        "stdout": subprocess.PIPE,
        "stderr": subprocess.PIPE,
        "text": True,
        "env": environment,
    }

    if os.name == "nt":
        creation_flags = getattr(
            subprocess,
            "CREATE_NEW_PROCESS_GROUP",
            0,
        )

        if creation_flags:
            kwargs[
                "creationflags"
            ] = creation_flags

    else:
        kwargs[
            "start_new_session"
        ] = True

        kwargs[
            "preexec_fn"
        ] = apply_unix_resource_limits

    return kwargs


# ============================================================
# WINDOWS PROCESS CLEANUP
# ============================================================

def terminate_windows_process_tree(
    process: subprocess.Popen[Any],
) -> None:
    """
    Best-effort termination of the submitted Python process
    and any child processes on Windows.
    """

    if os.name != "nt":
        return

    try:
        subprocess.run(
            [
                "taskkill",
                "/PID",
                str(process.pid),
                "/T",
                "/F",
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
    except Exception as error:
        logger.warning(
            "Windows process-tree cleanup failed: %s",
            error,
        )


# ============================================================
# UNIX PROCESS GROUP CLEANUP
# ============================================================

def terminate_unix_process_group(
    process: subprocess.Popen[Any],
) -> None:
    """
    Best-effort termination of the submitted process group
    on Unix-like systems.
    """

    if os.name == "nt":
        return

    try:
        os.killpg(
            process.pid,
            signal.SIGKILL,
        )
    except (
        ProcessLookupError,
        PermissionError,
        OSError,
    ) as error:
        logger.warning(
            "Unix process-group cleanup failed: %s",
            error,
        )


# ============================================================
# OUTPUT NORMALIZATION
# ============================================================

def docker_is_available() -> bool:
    if not shutil.which(DOCKER_BINARY):
        return False

    try:
        result = subprocess.run(
            [
                DOCKER_BINARY,
                "image",
                "inspect",
                SANDBOX_IMAGE,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return False

    return result.returncode == 0


def build_docker_command(
    temporary_directory: str,
    container_name: str,
) -> list[str]:
    """
    Run main.py in a disposable, locked-down container.
    The container receives no host environment variables.
    """

    return [
        DOCKER_BINARY,
        "run",
        "--rm",
        "--name",
        container_name,
        "--network",
        "none",
        "--read-only",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--user",
        "65534:65534",
        "--memory",
        f"{MAX_MEMORY_MB}m",
        "--memory-swap",
        f"{MAX_MEMORY_MB}m",
        "--cpus",
        "1",
        "--pids-limit",
        "64",
        "--ulimit",
        f"fsize={MAX_FILE_SIZE_MB * 1024 * 1024}",
        "--tmpfs",
        "/tmp:rw,noexec,nosuid,size=32m",
        "--env",
        "HOME=/tmp",
        "--volume",
        f"{temporary_directory}:/sandbox:ro",
        "--workdir",
        "/tmp",
        SANDBOX_IMAGE,
        "python",
        "-I",
        "-u",
        "/sandbox/main.py",
    ]


def build_docker_cli_environment() -> dict[str, str]:
    """
    Environment for the docker CLI process itself (not the container).
    Only what the CLI needs to reach the daemon is forwarded.
    """

    environment: dict[str, str] = {}

    for name in (
        "PATH",
        "SYSTEMROOT",
        "HOME",
        "USERPROFILE",
        "DOCKER_HOST",
        "DOCKER_CONFIG",
        "DOCKER_CONTEXT",
        "DOCKER_TLS_VERIFY",
        "DOCKER_CERT_PATH",
    ):
        value = os.getenv(name)

        if value:
            environment[name] = value

    return environment


def kill_container(
    container_name: str,
) -> None:
    try:
        subprocess.run(
            [
                DOCKER_BINARY,
                "kill",
                container_name,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=10,
        )
    except Exception as error:
        logger.warning(
            "Failed to kill sandbox container %s: %s",
            container_name,
            error,
        )


def normalize_output(
    value: Any,
) -> str:
    """
    Normalize subprocess output safely.

    Handles both text and byte output because
    TimeoutExpired may return bytes depending on
    the Python subprocess configuration.
    """

    if value is None:
        return ""

    if isinstance(
        value,
        bytes,
    ):
        return value.decode(
            "utf-8",
            errors="replace",
        )

    return str(value)


# ============================================================
# TEMPORARY DIRECTORY CLEANUP
# ============================================================

def cleanup_execution_directory(
    temporary_directory: str | None,
) -> None:
    if not temporary_directory:
        return

    try:
        shutil.rmtree(
            temporary_directory,
            ignore_errors=True,
        )
    except Exception as error:
        logger.warning(
            "Code execution cleanup failed: %s",
            error,
        )


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
            result[
                "executionTimeMs"
            ],
        )

        return {
            "success": True,
            **result,
        }

    except EngineInputError as error:
        # Our own validation messages; safe to return.
        raise HTTPException(
            status_code=error.code,
            detail=error.message,
        ) from error

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
            detail="Quantum backend execution failed.",
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

    use_docker = docker_is_available()

    if (
        not use_docker
        and not ALLOW_UNSANDBOXED_CODE_EXECUTION
    ):
        logger.error(
            "Code execution refused: sandbox image %s is not available "
            "via '%s'. Build it (see sandbox/Dockerfile) or, for local "
            "development only, set ALLOW_UNSANDBOXED_CODE_EXECUTION=true.",
            SANDBOX_IMAGE,
            DOCKER_BINARY,
        )

        raise HTTPException(
            status_code=503,
            detail="Code execution sandbox is not available.",
        )

    started_at = time.perf_counter()

    temporary_directory: str | None = None

    process: subprocess.Popen[Any] | None = None

    container_name = (
        f"ql-sandbox-{os.getpid()}-{time.time_ns()}"
    )

    try:
        # --------------------------------------------------------
        # Temporary execution workspace
        # --------------------------------------------------------

        temporary_directory = tempfile.mkdtemp(
            prefix="quantumlearn-code-",
        )

        script_path = (
            Path(
                temporary_directory
            )
            / "main.py"
        )

        script_path.write_text(
            code,
            encoding="utf-8",
        )

        if use_docker:
            # mkdtemp is 0700; the container runs as nobody and
            # mounts this directory read-only.
            os.chmod(
                temporary_directory,
                0o755,
            )
            os.chmod(
                script_path,
                0o644,
            )

        # --------------------------------------------------------
        # Restricted environment
        # --------------------------------------------------------

        environment = (
            create_execution_environment(
                temporary_directory,
            )
        )

        # --------------------------------------------------------
        # Platform-aware process configuration
        # --------------------------------------------------------

        if use_docker:
            command = build_docker_command(
                temporary_directory,
                container_name,
            )

            # No preexec rlimits here: they would apply to the docker
            # CLI, not the container (which has its own limits).
            process_kwargs: dict[str, Any] = {
                "stdout": subprocess.PIPE,
                "stderr": subprocess.PIPE,
                "text": True,
                "env": build_docker_cli_environment(),
            }
        else:
            logger.warning(
                "Running submitted code WITHOUT a sandbox "
                "(ALLOW_UNSANDBOXED_CODE_EXECUTION=true). "
                "Development use only."
            )

            command = [
                sys.executable,
                "-I",
                "-u",
                str(script_path),
            ]

            process_kwargs = (
                build_process_kwargs(
                    temporary_directory,
                    environment,
                )
            )

        # --------------------------------------------------------
        # Execute submitted Python
        # --------------------------------------------------------

        process = subprocess.Popen(
            command,
            **process_kwargs,
        )

        try:
            stdout_bytes, stderr_bytes = (
                process.communicate(
                    timeout=CODE_TIMEOUT_SECONDS,
                )
            )

        except subprocess.TimeoutExpired as error:
            logger.warning(
                "Python code execution timed out. "
                "pid=%s",
                process.pid,
            )

            if use_docker:
                kill_container(
                    container_name,
                )
            elif os.name == "nt":
                terminate_windows_process_tree(
                    process,
                )
            else:
                terminate_unix_process_group(
                    process,
                )

            try:
                stdout_bytes, stderr_bytes = (
                    process.communicate(
                        timeout=5,
                    )
                )
            except Exception:
                stdout_bytes = (
                    getattr(
                        error,
                        "output",
                        None,
                    )
                    or ""
                )

                stderr_bytes = (
                    getattr(
                        error,
                        "stderr",
                        None,
                    )
                    or ""
                )

            execution_time = round(
                (
                    time.perf_counter()
                    - started_at
                )
                * 1000,
                2,
            )

            stdout = normalize_output(
                stdout_bytes,
            )

            stderr = normalize_output(
                stderr_bytes,
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

        execution_time = round(
            (
                time.perf_counter()
                - started_at
            )
            * 1000,
            2,
        )

        stdout = normalize_output(
            stdout_bytes,
        )

        stderr = normalize_output(
            stderr_bytes,
        )

        stdout = stdout[
            :MAX_OUTPUT_LENGTH
        ]

        stderr = stderr[
            :MAX_OUTPUT_LENGTH
        ]

        if process.returncode != 0:
            logger.info(
                "Python program exited with code %s.",
                process.returncode,
            )

            return {
                "success": False,
                "output": stdout,
                "error": (
                    stderr
                    or "Python program exited with an error."
                ),
                "executionTime":
                    execution_time,
            }

        return {
            "success": True,
            "output": (
                stdout
                or "Program executed successfully with no output."
            ),
            "error": stderr,
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
            "error":
                "Unable to execute the submitted program.",
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
        cleanup_execution_directory(
            temporary_directory,
        )