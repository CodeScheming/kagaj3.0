from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[str] = None
    article_type: Optional[str] = None

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[str] = None
    article_type: Optional[str] = None

class ArticleResponse(ArticleBase):
    id: int
    source_slug: Optional[str] = None
    content_hash: Optional[str] = None
    tx_signature: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    author_id: int
    author_wallet: Optional[str] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserUpdate(BaseModel):
    wallet_address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    wallet_address: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    articles: List[ArticleResponse] = []

class Token(BaseModel):
    access_token: str
    token_type: str
