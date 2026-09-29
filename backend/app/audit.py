from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog

router = APIRouter(
    prefix="/api/audit",
    tags=["Audit Trail"],
)


@router.get("/")
def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if entity_type:
        query = query.filter(
            AuditLog.entity_type == entity_type
        )

    if entity_id is not None:
        query = query.filter(
            AuditLog.entity_id == entity_id
        )

    logs = (
        query
        .order_by(AuditLog.timestamp.desc())
        .limit(min(limit, 500))
        .all()
    )

    result = []

    for log in logs:
        result.append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "details": log.details,
                "timestamp": log.timestamp,
            }
        )

    return {
        "count": len(result),
        "logs": result,
    }