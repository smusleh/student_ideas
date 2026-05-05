from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import Base


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    student_name = Column(String)
    category = Column(String)
    contact_email = Column(String)
    votes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class IdeaCreate(BaseModel):
    title: str
    description: str
    student_name: Optional[str] = None
    category: Optional[str] = None
    contact_email: Optional[str] = None


class IdeaResponse(BaseModel):
    id: int
    title: str
    description: str
    student_name: Optional[str]
    category: Optional[str]
    contact_email: Optional[str]
    votes: int
    created_at: datetime

    model_config = {"from_attributes": True}
