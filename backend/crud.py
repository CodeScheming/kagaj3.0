from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash
import solana_utils

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def get_articles(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Article)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            models.Article.title.ilike(search_pattern) |
            models.Article.content.ilike(search_pattern) |
            models.Article.tags.ilike(search_pattern)
        )
    return query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

def get_article(db: Session, article_id: int):
    return db.query(models.Article).filter(models.Article.id == article_id).first()

def create_user_article(db: Session, article: schemas.ArticleCreate, user_id: int):
    # Generate SHA-256 hash
    content_hash = solana_utils.generate_article_hash(article.title, article.content)
    
    # Save to get article ID
    db_article = models.Article(
        **article.model_dump(), 
        author_id=user_id,
        content_hash=content_hash
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    # Create structured proof
    user = get_user(db, user_id)
    article_proof = {
        "article_id": db_article.id,
        "author_wallet": user.wallet_address if user else None,
        "content_hash": content_hash,
        "published_at": db_article.created_at.isoformat(),
        "license": "CC BY 4.0"
    }
    
    # Publish proof to Solana
    tx_signature = solana_utils.publish_hash_to_solana(article_proof)
    
    # Update with tx_signature
    db_article.tx_signature = tx_signature
    db.commit()
    db.refresh(db_article)
    
    return db_article

def update_article(db: Session, article_id: int, article_update: schemas.ArticleUpdate):
    db_article = get_article(db, article_id)
    if db_article:
        update_data = article_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_article, key, value)
        db.commit()
        db.refresh(db_article)
    return db_article

def delete_article(db: Session, article_id: int):
    db_article = get_article(db, article_id)
    if db_article:
        db.delete(db_article)
        db.commit()
    return db_article
