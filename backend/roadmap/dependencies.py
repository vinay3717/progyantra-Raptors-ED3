from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from core.config import settings

bearer = HTTPBearer()

def get_current_user(token=Depends(bearer)):
    try:
        payload = jwt.decode(token.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        return payload  # { user_id, email, selected_skill }
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")