# db.py

import pyodbc

def get_db():
    try:
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=localhost\sql19;'
            'DATABASE=Valuecorn;'
            'UID=sa;PWD=P@ssw0rd'
        )
        return conn
    except Exception as e:
        print("❌ DB Connection failed:", e)
        raise
