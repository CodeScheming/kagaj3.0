"""
Import articles from kagajkokatha.com external APIs.
Fetches blogs and literature, auto-creates user accounts for each author,
and creates articles under those users.

Auto-created users get:
  - username: author name lowercased, spaces → underscores
  - email: {username}@kagajkokatha.com
  - password: Admin123@

Authors can claim their accounts by logging in with these credentials.
"""

import re
import logging
from datetime import datetime
import httpx

import crud, schemas
from auth import get_password_hash
import models

logger = logging.getLogger(__name__)

BLOGS_LIST_URL = "https://kagajkokatha.com/api/blogs/"
LITERATURE_LIST_URL = "https://kagajkokatha.com/api/literature/"
BLOG_DETAIL_URL = "https://kagajkokatha.com/api/blogs/{slug}/"
LITERATURE_DETAIL_URL = "https://kagajkokatha.com/api/literature/{slug}/"

DEFAULT_PASSWORD = "Admin123@"


def slugify_username(author_name: str) -> str:
    """Convert author name to a valid username: lowercase, spaces to underscores, strip special chars."""
    name = author_name.strip().lower()
    name = re.sub(r'[^a-z0-9\s_]', '', name)
    name = re.sub(r'\s+', '_', name)
    name = name.strip('_')
    return name or "unknown_author"


def get_or_create_user(db, author_name: str):
    """Get existing user or auto-create one for the given author name."""
    username = slugify_username(author_name)
    
    user = crud.get_user_by_username(db, username)
    if user:
        return user
    
    # Generate a unique email
    email = f"{username}@kagajkokatha.com"
    existing_email = crud.get_user_by_email(db, email)
    if existing_email:
        # If email already taken (different username), append a number
        counter = 2
        while crud.get_user_by_email(db, f"{username}{counter}@kagajkokatha.com"):
            counter += 1
        email = f"{username}{counter}@kagajkokatha.com"
    
    # Create user
    hashed_password = get_password_hash(DEFAULT_PASSWORD)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"Auto-created user: {username} ({email})")
    return db_user


def parse_date(date_str: str) -> datetime:
    """Parse a date string like '2026-03-15' into a datetime object."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return datetime.utcnow()


def import_blogs(db):
    """Fetch and import all blogs from the external API."""
    try:
        with httpx.Client(timeout=30) as client:
            # Fetch list
            resp = client.get(BLOGS_LIST_URL)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])
            
            for item in results:
                slug = item.get("slug", "")
                source_slug = f"blog_{slug}"
                
                # Skip if already imported
                if crud.get_article_by_source_slug(db, source_slug):
                    logger.debug(f"Skipping already imported blog: {slug}")
                    continue
                
                # Fetch detail for full content
                try:
                    detail_resp = client.get(BLOG_DETAIL_URL.format(slug=slug))
                    detail_resp.raise_for_status()
                    detail = detail_resp.json()
                except Exception as e:
                    logger.warning(f"Failed to fetch blog detail for {slug}: {e}")
                    detail = item  # Fall back to list data
                
                author_name = detail.get("author", "Unknown")
                user = get_or_create_user(db, author_name)
                
                # Determine article type
                article_type = detail.get("type", "article")  # article, review
                
                # Build tags from category
                category = detail.get("category", "")
                book_author = detail.get("book_author", "")
                tags_parts = []
                if category:
                    tags_parts.append(category)
                if book_author:
                    tags_parts.append(f"Book by {book_author}")
                if article_type == "review":
                    tags_parts.append("Review")
                    rating = detail.get("rating")
                    if rating:
                        tags_parts.append(f"Rating: {rating}/5")
                tags = ", ".join(tags_parts) if tags_parts else None
                
                crud.create_article_direct(
                    db=db,
                    title=detail.get("title", "Untitled"),
                    content=detail.get("content", detail.get("excerpt", "")),
                    excerpt=detail.get("excerpt", ""),
                    cover_image_url=detail.get("image_url"),
                    article_type=article_type,
                    source_slug=source_slug,
                    tags=tags,
                    author_id=user.id,
                    created_at=parse_date(detail.get("date")),
                )
                
                logger.info(f"Imported blog: {detail.get('title')} by {author_name}")
                
    except Exception as e:
        logger.error(f"Failed to import blogs: {e}")


def import_literature(db):
    """Fetch and import all literature from the external API."""
    try:
        with httpx.Client(timeout=30) as client:
            # Fetch list
            resp = client.get(LITERATURE_LIST_URL)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])
            
            for item in results:
                slug = item.get("slug", "")
                source_slug = f"literature_{slug}"
                
                # Skip if already imported
                if crud.get_article_by_source_slug(db, source_slug):
                    logger.debug(f"Skipping already imported literature: {slug}")
                    continue
                
                # Fetch detail for full content
                try:
                    detail_resp = client.get(LITERATURE_DETAIL_URL.format(slug=slug))
                    detail_resp.raise_for_status()
                    detail = detail_resp.json()
                except Exception as e:
                    logger.warning(f"Failed to fetch literature detail for {slug}: {e}")
                    detail = item  # Fall back to list data
                
                author_name = detail.get("author", "Unknown")
                user = get_or_create_user(db, author_name)
                
                # Determine article type from writing_type
                writing_type = detail.get("writing_type", "other")
                custom_label = detail.get("custom_type_label", "")
                article_type = custom_label.lower() if custom_label else writing_type
                
                # Build tags from category
                category_name = detail.get("category_name", "")
                display_type = detail.get("writing_type_display", "")
                tags_parts = []
                if category_name:
                    tags_parts.append(category_name)
                elif display_type:
                    tags_parts.append(display_type)
                tags = ", ".join(tags_parts) if tags_parts else None
                
                crud.create_article_direct(
                    db=db,
                    title=detail.get("title", "Untitled"),
                    content=detail.get("content", detail.get("excerpt", "")),
                    excerpt=detail.get("excerpt", ""),
                    cover_image_url=detail.get("image_url"),
                    article_type=article_type,
                    source_slug=source_slug,
                    tags=tags,
                    author_id=user.id,
                    created_at=parse_date(detail.get("date")),
                )
                
                logger.info(f"Imported literature: {detail.get('title')} by {author_name}")
                
    except Exception as e:
        logger.error(f"Failed to import literature: {e}")


def run_import(db):
    """Run the full import from both external APIs."""
    logger.info("Starting article import from kagajkokatha.com...")
    import_blogs(db)
    import_literature(db)
    logger.info("Article import complete.")
