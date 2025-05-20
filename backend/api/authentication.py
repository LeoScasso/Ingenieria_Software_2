from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

authentication_bp = Blueprint('authentication', __name__)

# Extrae la tabla users
users = Table('users', metadata, autoload_with=engine)
employees = Table('employees', metadata, autoload_with=engine)
admins = Table('admins', metadata, autoload_with=engine)

@authentication_bp.route('/login',methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return {
            jsonify({"message": "mail and password are required"})
        }

    user_sources = [
        (users, 'user', 'user_id'),
        (employees, 'employee', 'employee_id'),
        (admins, 'admin','admin_id')
    ]
    with engine.connect() as conn:
        for table, role, id_field in user_sources:
            stmt = select(table).where(table.c.email == email)
            result = conn.execute(stmt).fetchone()
            if result and result.password == password:
                session['user_id'] = getattr(result,id_field)
                session['user_role'] = role
                return jsonify({
                    'message': 'Sesión iniciada correctamente',
                    'user_id': session['user_id'],
                    'user_role': session['user_role']
                })
    
    return {'error': 'Email o contraseña incorrectos'}


@authentication_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()    
    return jsonify({'message': 'Sesión cerrada correctamente'})

