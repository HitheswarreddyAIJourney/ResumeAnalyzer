from pydantic import BaseModel, Field
from typing import Optional, List, Literal


class HealthResponse(BaseModel):
    status: str = "ok"
    version: Optional[str] = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    answer: str
    suggestions: Optional[List[str]] = None
    score: Optional[float] = None