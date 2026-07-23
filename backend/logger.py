"""
Centralized Structured Logging Module
=====================================
Provides a thread-safe, JSON-formatted structured logging system for the V2 parser engine.
Leverages ContextVars for thread-local tracking of PDF names, pages, and strategies.
Automatically falls back to console logging if file writes fail.
"""

import os
import sys
import json
import logging
import threading
import contextvars
from datetime import datetime
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Dict, List, Optional, Any, Tuple

from config import ParserConfig

# Thread-local context variables for context-rich structured logs
ctx_pdf_name = contextvars.ContextVar("pdf_name", default="")
ctx_page_number = contextvars.ContextVar("page_number", default=None)
ctx_publisher = contextvars.ContextVar("publisher", default="")
ctx_question_number = contextvars.ContextVar("question_number", default=None)
ctx_parser_strategy = contextvars.ContextVar("parser_strategy", default="")
ctx_execution_time = contextvars.ContextVar("execution_time", default=None)

_logger_initialized = False
_logger_lock = threading.Lock()

# -----------------------------------------------------------------------------
# Structured JSON Formatter
# -----------------------------------------------------------------------------
class JsonFormatter(logging.Formatter):
    """
    Formats logging records into structured JSON lines containing context metadata.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_payload = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "module": record.module,
            "function": record.funcName,
            "message": record.getMessage()
        }

        # Inject context variables if set
        pdf_name = ctx_pdf_name.get()
        if pdf_name:
            log_payload["pdf_name"] = pdf_name

        page = ctx_page_number.get()
        if page is not None:
            log_payload["page"] = page

        publisher = ctx_publisher.get()
        if publisher:
            log_payload["publisher"] = publisher

        q_num = ctx_question_number.get()
        if q_num is not None:
            log_payload["question_number"] = q_num

        strategy = ctx_parser_strategy.get()
        if strategy:
            log_payload["parser_strategy"] = strategy

        exec_time = ctx_execution_time.get()
        if exec_time is not None:
            log_payload["execution_time"] = exec_time

        # Append exception details if present
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_payload, default=str)


# -----------------------------------------------------------------------------
# Lazy Thread-Safe Logger Initializer
# -----------------------------------------------------------------------------
def setup_logging(log_dir: str = "logs", log_level: int = logging.INFO) -> None:
    """
    Sets up rotating file handlers and console output with JSON formatters.
    Guaranteed thread-safe and fail-proof (falls back to console-only if directories are locked).
    """
    global _logger_initialized
    with _logger_lock:
        if _logger_initialized:
            return

        root_logger = logging.getLogger()
        root_logger.setLevel(log_level)
        
        # Clear existing handlers
        root_logger.handlers.clear()

        # Create structured JSON formatter
        formatter = JsonFormatter()

        # 1. Console Handler (stderr)
        console_handler = logging.StreamHandler(sys.stderr)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

        # 2. Rotating File Handlers (if file write is permitted)
        try:
            log_path = Path(log_dir)
            log_path.mkdir(parents=True, exist_ok=True)

            log_files = {
                "parser.log": (logging.INFO, root_logger),
                "errors.log": (logging.ERROR, None),
                "benchmark.log": (logging.INFO, None),
                "review.log": (logging.WARNING, None)
            }

            for filename, (level, target_logger) in log_files.items():
                file_handler = RotatingFileHandler(
                    filename=log_path / filename,
                    maxBytes=5 * 1024 * 1024,  # 5 MB
                    backupCount=5,
                    encoding="utf-8"
                )
                file_handler.setFormatter(formatter)
                file_handler.setLevel(level)
                
                # Dedicated loggers get their own handlers, or add to root
                if target_logger is None:
                    # Create isolated sub-logger
                    sub_logger = logging.getLogger(filename.split(".")[0])
                    sub_logger.setLevel(level)
                    sub_logger.addHandler(file_handler)
                    sub_logger.propagate = False
                else:
                    root_logger.addHandler(file_handler)

            _logger_initialized = True
            logging.info(" central logger initialized successfully.")
        except Exception as e:
            # Revert to console fallback in case of write failures
            logging.warning(f"File logging setup failed: {e}. Falling back to console-only logging.")
            _logger_initialized = True


# -----------------------------------------------------------------------------
# Public Logging Helpers
# -----------------------------------------------------------------------------
def get_logger(name: str) -> logging.Logger:
    """
    Returns a logger instance. Automatically triggers setup_logging if not already run.
    """
    if not _logger_initialized:
        setup_logging()
    return logging.getLogger(name)


def set_context(
    pdf_name: Optional[str] = None,
    page_number: Optional[int] = None,
    publisher: Optional[str] = None,
    question_number: Optional[int] = None,
    parser_strategy: Optional[str] = None,
    execution_time: Optional[float] = None
) -> None:
    """
    Sets thread-safe log context variables for the current execution flow.
    """
    if pdf_name is not None:
        ctx_pdf_name.set(pdf_name)
    if page_number is not None:
        ctx_page_number.set(page_number)
    if publisher is not None:
        ctx_publisher.set(publisher)
    if question_number is not None:
        ctx_question_number.set(question_number)
    if parser_strategy is not None:
        ctx_parser_strategy.set(parser_strategy)
    if execution_time is not None:
        ctx_execution_time.set(execution_time)


def clear_context() -> None:
    """
    Clears all contextual log variables.
    """
    ctx_pdf_name.set("")
    ctx_page_number.set(None)
    ctx_publisher.set("")
    ctx_question_number.set(None)
    ctx_parser_strategy.set("")
    ctx_execution_time.set(None)


# -----------------------------------------------------------------------------
# Parser-Specific Structured Log Wrappers
# -----------------------------------------------------------------------------
def log_parser_start(pdf_name: str, publisher: str) -> None:
    set_context(pdf_name=pdf_name, publisher=publisher)
    get_logger("parser").info(f"Started PDF parsing session for file: {pdf_name}")


def log_parser_finish(pdf_name: str, total_q: int, accepted: int) -> None:
    get_logger("parser").info(
        f"Completed PDF parsing session for: {pdf_name}. "
        f"Total Questions: {total_q}, Accepted: {accepted}"
    )
    clear_context()


def log_question_parsed(q_num: int, strategy: str) -> None:
    set_context(question_number=q_num, parser_strategy=strategy)
    get_logger("parser").info(f"Successfully extracted question number: {q_num}")


def log_validation_error(q_num: int, error_codes: List[str]) -> None:
    set_context(question_number=q_num)
    get_logger("review").warning(
        f"Question {q_num} failed validation checking. Error codes: {error_codes}"
    )


def log_duplicate_found(orig_id: str, dup_id: str, similarity: float) -> None:
    get_logger("review").warning(
        f"Duplicate question detected. Original ID: {orig_id}, "
        f"Duplicate ID: {dup_id}. Similarity: {similarity:.2f}"
    )


def log_review_required(q_num: int, reason: str) -> None:
    set_context(question_number=q_num)
    get_logger("review").warning(
        f"Question {q_num} flagged for manual review queue. Reason: {reason}"
    )


def log_exception(message: str, exc: Exception) -> None:
    get_logger("errors").error(message, exc_info=exc)


def log_metrics(pdf_name: str, total_time: float, total_q: int) -> None:
    set_context(pdf_name=pdf_name, execution_time=total_time)
    get_logger("benchmark").info(
        f"Performance metrics: File={pdf_name}, Total Time={total_time:.2f}s, "
        f"Questions={total_q}"
    )
