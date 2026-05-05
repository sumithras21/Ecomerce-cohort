import logging
import sys

def get_logger(name):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s request_id=%(request_id)s %(message)s"
        )
        
        # Stream handler (console)
        sh = logging.StreamHandler(sys.stdout)
        sh.setFormatter(formatter)
        class RequestIdFilter(logging.Filter):
            def filter(self, record):
                if not hasattr(record, "request_id"):
                    record.request_id = "-"
                return True

        sh.addFilter(RequestIdFilter())
        logger.addHandler(sh)
        
    return logger
