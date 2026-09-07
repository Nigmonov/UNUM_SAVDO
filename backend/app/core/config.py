from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./unum_savdo.db"
    SECRET_KEY: str = "unum-local-dev-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Telegram Web Login (OIDC). Serverda Telegram bot ishlamaydi.
    TELEGRAM_CLIENT_ID: str = ""
    TELEGRAM_CLIENT_SECRET: str = ""
    TELEGRAM_REDIRECT_URI: str = "http://127.0.0.1:8000/api/auth/telegram/callback"

    # Faqat lokal test uchun. Productionda false qiling.
    DEV_MODE: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
