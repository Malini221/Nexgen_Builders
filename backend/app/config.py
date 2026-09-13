from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    duplicate_threshold: float = 0.85
    related_threshold: float = 0.70
    similarity_threshold: float = 0.70
    cors_origins: str = "http://localhost:3000"
    models_dir: str = "models"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
