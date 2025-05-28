# import pytest_asyncio
# from fastapi.testclient import TestClient
# from sqlalchemy_utils import database_exists, drop_database, create_database
#
# from core.config import settings
# from main import app
#
#
# @pytest_asyncio.fixture(scope="session")
# def test_app():
#     yield app
#
#
# @pytest_asyncio.fixture(scope="session")
# def setup_db():
#     temp_db_url: str = str(settings.db.url) + ".pytest"
#
#     if database_exists(temp_db_url):
#         drop_database(temp_db_url)
#
#     create_database(temp_db_url)
#     yield
#     drop_database(temp_db_url)
#
#
# @pytest_asyncio.fixture
# def client(test_app):
#     return TestClient(app=test_app)
