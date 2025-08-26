"""
config.py
---------
Configuration management for the Career Roadmap AI Pipeline.
"""

import os
from typing import Optional
from pathlib import Path

class Config:
    """
    Configuration class for the pipeline.
    """
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-1106-preview")
    OPENAI_MAX_RETRIES: int = int(os.getenv("OPENAI_MAX_RETRIES", "3"))
    OPENAI_TIMEOUT: int = int(os.getenv("OPENAI_TIMEOUT", "60"))
    
    # Data Configuration
    DATA_DIR: str = os.getenv("DATA_DIR", "data")
    
    # Pipeline Configuration
    MAX_WEEKS: int = int(os.getenv("MAX_WEEKS", "12"))
    MIN_DAILY_TASKS: int = int(os.getenv("MIN_DAILY_TASKS", "5"))
    MAX_DAILY_TASKS: int = int(os.getenv("MAX_DAILY_TASKS", "7"))
    
    # Constraint Configuration
    MAX_DAILY_MINUTES: int = int(os.getenv("MAX_DAILY_MINUTES", "240"))
    MIN_DAILY_MINUTES: int = int(os.getenv("MIN_DAILY_MINUTES", "15"))
    MAX_LONG_SESSIONS_PER_WEEK: int = int(os.getenv("MAX_LONG_SESSIONS_PER_WEEK", "2"))
    LONG_SESSION_THRESHOLD: int = int(os.getenv("LONG_SESSION_THRESHOLD", "120"))
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    @classmethod
    def validate(cls) -> bool:
        """
        Validate required configuration.
        """
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")
        
        if not Path(cls.DATA_DIR).exists():
            Path(cls.DATA_DIR).mkdir(parents=True, exist_ok=True)
        
        return True
    
    @classmethod
    def from_env_file(cls, env_file: str = ".env") -> None:
        """
        Load configuration from environment file.
        """
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except ImportError:
            print("python-dotenv not installed. Install with: pip install python-dotenv")


# Default configuration instance
config = Config()