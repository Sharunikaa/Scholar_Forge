"""
Database Package: MongoDB connection and models
"""

from .connection import (
    connect_to_mongo,
    close_mongo_connection,
    get_database
)
from .models import (
    Session,
    Query,
    Report,
    Citation,
    QueryStatus
)

__all__ = [
    "connect_to_mongo",
    "close_mongo_connection",
    "get_database",
    "Session",
    "Query",
    "Report",
    "Citation",
    "QueryStatus"
]
