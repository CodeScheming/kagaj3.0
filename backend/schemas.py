from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    content: str

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    author_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    articles: List[ArticleResponse] = []

class Token(BaseModel):
    access_token: str
    token_type: str
