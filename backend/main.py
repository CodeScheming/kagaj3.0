import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import shutil
import uuid

import models, schemas, crud, auth, database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: create tables and import articles
    models.Base.metadata.create_all(bind=database.engine)
    
    # Import articles from external APIs
    import import_articles
    db = database.SessionLocal()
    try:
        import_articles.run_import(db)
    except Exception as e:
        logger.error(f"Article import failed: {e}")
    finally:
        db.close()
    
    yield
    # Shutdown: nothing to clean up

app = FastAPI(title="Kagaj Ko Katha — Publishing Platform API", lifespan=lifespan)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS — allow the frontend origin (supports both dev and production)
allowed_origins = [FRONTEND_URL]
# Also allow localhost variants for dev convenience
if "localhost" not in FRONTEND_URL:
    allowed_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.update_user(db=db, user_id=current_user.id, user_update=user_update)

@app.get("/users/{user_id}", response_model=schemas.UserProfile)
def read_user_profile(user_id: int, db: Session = Depends(auth.get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/articles", response_model=schemas.ArticleResponse)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_user_article(db=db, article=article, user_id=current_user.id)

@app.get("/articles", response_model=List[schemas.ArticleResponse])
def read_articles(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(auth.get_db)):
    articles = crud.get_articles(db, skip=skip, limit=limit, search=search)
    return articles

@app.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = f"uploads/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"{BACKEND_URL}/uploads/{filename}"}

@app.get("/articles/{article_id}", response_model=schemas.ArticleResponse)
def read_article(article_id: int, db: Session = Depends(auth.get_db)):
    db_article = crud.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return db_article

@app.put("/articles/{article_id}", response_model=schemas.ArticleResponse)
def update_article(article_id: int, article: schemas.ArticleUpdate, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_article = crud.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    if db_article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this article")
    
    return crud.update_article(db=db, article_id=article_id, article_update=article)

@app.delete("/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_article = crud.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    if db_article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this article")
    
    crud.delete_article(db=db, article_id=article_id)
    return {"message": "Article deleted successfully"}
