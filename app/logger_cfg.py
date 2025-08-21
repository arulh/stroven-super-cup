import logging, structlog

def configure_logging(log_file: str | None = None):
    processors = [
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ]
    structlog.configure(processors=processors)
    handlers = [logging.StreamHandler()]
    if log_file:
        fh = logging.FileHandler(log_file)
        handlers.append(fh)
    logging.basicConfig(level=logging.INFO, handlers=handlers)
    return structlog.get_logger()