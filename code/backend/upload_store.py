# upload_store.py
from typing import Dict, List, Optional
from models import PatientRecord


class UploadStore:
    """In-memory storage for upload sessions and parsed records."""
    
    def __init__(self):
        self._sessions: Dict[str, List[PatientRecord]] = {}
    
    def save_session(self, session_id: str, records: List[PatientRecord]) -> None:
        self._sessions[session_id] = records
    
    def get_records(self, session_id: str) -> Optional[List[PatientRecord]]:
        return self._sessions.get(session_id)
    
    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False


_upload_store_instance = None

def get_upload_store() -> UploadStore:
    global _upload_store_instance
    if _upload_store_instance is None:
        _upload_store_instance = UploadStore()
    return _upload_store_instance