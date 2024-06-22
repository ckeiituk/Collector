# app/__init__.py

from flask import Flask
from flask_wtf import CSRFProtect

from config import Config
from .database import db

csrf = CSRFProtect()
