import sqlite3

DATABASE = 'DataBase.db' # Relative to the root backend directory

def get_db():
    # Adjust path to be relative to the main app.py or use an absolute path if needed
    # For now, assuming DATABASE path is correct when called from app.py context
    conn = sqlite3.connect(DATABASE) 
    conn.row_factory = sqlite3.Row
    return conn 