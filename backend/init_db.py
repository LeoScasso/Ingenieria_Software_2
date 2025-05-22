import sqlite3
import os

def init_db():
    # Eliminar la base de datos existente si existe
    if os.path.exists('DataBase v1.1.db'):
        os.remove('DataBase v1.1.db')
    
    # Crear una nueva conexión
    conn = sqlite3.connect('DataBase v1.1.db')
    
    try:
        # Leer el archivo SQL
        with open('database.sql', 'r') as sql_file:
            sql_script = sql_file.read()
        
        # Ejecutar el script SQL
        conn.executescript(sql_script)
        
        print("Base de datos inicializada correctamente.")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db() 