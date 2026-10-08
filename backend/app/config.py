"""
Application Configuration
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

APP_NAME = "Money Trail Hunter API"
APP_VERSION = "1.0.0"
DEBUG = True
