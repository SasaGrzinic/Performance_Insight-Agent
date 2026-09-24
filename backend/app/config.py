import re
from datetime import date
from functools import lru_cache
from zoneinfo import ZoneInfo

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://sonio:sonio@postgres:5432/sonio"
    app_origin: str = "http://localhost:8080"
    environment: str = "production"
    cookie_secure: bool = True
    trust_proxy: bool = False
    demo_enabled: bool = False
    admin_username: str = "admin"
    admin_password: str = ""
    admin_email: str = ""
    report_timezone: str = "Europe/Zurich"
    report_hour: int = 8
    report_start_month: str = "2026-09"
    report_recipients: str = ""
    sync_interval_minutes: int = 60
    openrouter_api_key: str = ""
    openrouter_model: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_starttls: bool = True
    google_client_id: str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""
    ga4_property_id: str = ""
    google_ads_customer_id: str = ""
    google_ads_developer_token: str = ""
    google_ads_login_customer_id: str = ""
    google_ads_api_version: str = "v25"
    google_ads_currency: str = "CHF"
    linkedin_access_token: str = ""
    linkedin_refresh_token: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    linkedin_ad_account_id: str = ""
    linkedin_organization_id: str = ""
    linkedin_api_version: str = "202608"
    linkedin_currency: str = "CHF"
    mailchimp_api_key: str = ""
    mailchimp_server: str = ""
    youtube_channel_id: str = ""
    ms_tenant_id: str = ""
    ms_client_id: str = ""
    ms_client_secret: str = ""
    ms_drive_id: str = ""
    ms_folder_id: str = ""
    event_date_column: str = "Anmeldedatum"
    event_email_column: str = "E-Mail"

    @model_validator(mode="after")
    def validate_runtime(self):
        ZoneInfo(self.report_timezone)
        if not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", self.report_start_month):
            raise ValueError("REPORT_START_MONTH must be YYYY-MM")
        date.fromisoformat(self.report_start_month + "-01")
        if self.report_recipients:
            for recipient in self.report_recipients.split(","):
                if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", recipient.strip()):
                    raise ValueError("Invalid report recipient")
        if self.smtp_host and not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", self.smtp_from):
            raise ValueError("SMTP_FROM must be an email address")
        if not 0 <= self.report_hour <= 23 or self.sync_interval_minutes < 5:
            raise ValueError("Invalid schedule")
        if self.environment == "production" and (
            not self.cookie_secure or not self.app_origin.startswith("https://")
        ):
            raise ValueError("Production requires HTTPS APP_ORIGIN and COOKIE_SECURE=true")
        return self


@lru_cache
def get_settings():
    return Settings()
