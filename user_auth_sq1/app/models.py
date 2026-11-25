from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, func
from sqlalchemy.orm import mapped_column, Mapped
from database import Base

class User(Base):
    __tablename__ = "user_table"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    role = Column(Enum("user", "admin", name="user_role"), default="user")
    created_at = Column(DateTime(timezone=True), default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), default=func.current_timestamp(), onupdate=func.current_timestamp())