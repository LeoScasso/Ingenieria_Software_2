import os
from sqlalchemy import MetaData, create_engine

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DB_PATH = os.path.join(BASE_DIR, 'data', 'DataBase v1.2.db')

engine = create_engine(f'sqlite:///{DB_PATH}', echo=True)
metadata = MetaData()