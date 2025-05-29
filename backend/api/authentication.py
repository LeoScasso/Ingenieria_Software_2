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
    errores = []

    if not email:
        errores.append("Email requerido")
    if not password:
        errores.append("Contraseña requerida")

    if errores:
        return jsonify({"message": " / ".join(errores)}), 400

    user_sources = [
        (users, 'user', 'user_id'),
        (employees, 'employee', 'employee_id'),
        (admins, 'admin','admin_id')
    ]
    with engine.connect() as conn:
        for table, role, id_field in user_sources:
            stmt = select(table).where(table.c.email == email)
            result = conn.execute(stmt).fetchone()
            if result and result.password == str(password):
                session['user_id'] = getattr(result,id_field)
                session['user_role'] = role
                session['user_name'] = getattr(result, 'name')
                return jsonify({
                    'message': 'Sesión iniciada correctamente',
                    'user_id': session['user_id'],
                    'user_role': session['user_role'],
                    'user_name': session['user_name']
                }), 200
    
    return jsonify({'error': 'Email o contraseña incorrectos'}), 400


@authentication_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada correctamente'}), 200