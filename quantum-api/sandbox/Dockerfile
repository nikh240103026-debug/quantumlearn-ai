# Sandbox image for user-submitted Python (POST /execute-code).
#
# Build on the machine that runs the quantum API:
#   docker build -t quantumlearn-sandbox:latest quantum-api/sandbox
#
# main.py runs each submission in a fresh container from this image with
# no network, a read-only root filesystem, no capabilities, user "nobody"
# and memory/CPU/PID limits. Keep this image minimal: only the libraries
# students are allowed to import, no app code and no secrets.

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MPLBACKEND=Agg \
    MPLCONFIGDIR=/opt/mplconfig \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN pip install \
        "qiskit>=2.0,<3" \
        "qiskit-aer>=0.17,<1" \
        "pennylane>=0.45,<1" \
        "cirq>=1.7,<2" \
        "numpy>=2.0,<3" \
        "scipy>=1.14,<2" \
        "matplotlib>=3.10,<4" \
    # Pre-build caches so the read-only container doesn't try to write them.
    && mkdir -p /opt/mplconfig \
    && python -c "import matplotlib.pyplot, qiskit, qiskit_aer, pennylane, cirq" \
    && chmod -R a+rX /opt/mplconfig

USER 65534:65534

WORKDIR /tmp
