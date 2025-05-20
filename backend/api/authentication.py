from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

auth_bp = Blueprint('auth', __name__)

# Extrae la tabla users
users = Table('users', metadata, autoload_with=engine)
employees = Table('employees', metadata, autoload_with=engine)
admins = Table('admins', metadata, autoload_with=engine)

@auth_bp.route('/login',methods=['POST'])
def login():
    data = request.get_json()
    mail = data.get('mail')
    password = data.get('password')

    with engine.connect() as conn:
        # Busca en users
        stmt = select(users).where(users.c.mail == mail)
        result = conn.execute(stmt).fetchone()
        if result and result.password == password:
            session['user_id'] = result.user_id
            session['user_role'] = 'user'
            return jsonify({
                'message': 'Sesión iniciada correctamente',
                'id': session['user_id'],
                'role': session['role']
            })
        
        # Busca en employees
        stmt = select(employees).where(employees.c.mail == mail)
        result = conn.execute(stmt).fetchone()
        if result and result.password == password:
            session['user_id'] = result.employee_id
            session['user_role'] = 'employee'
            return jsonify({
                'message': 'Sesión iniciada correctamente',
                'id': session['user_id'],
                'role': session['role']
            })
        
        # Busca en admins
        stmt = select(admins).where(admins.c.mail == mail)
        result = conn.execute(stmt).fetchone()
        if result and result.password == password:
            session['user_id'] = result.admin_id
            session['user_role'] = 'admin'
            return jsonify({
                'message': 'Sesión iniciada correctamente',
                'id': session['user_id'],
                'role': session['role']
            })
        return {'error': 'Email o contraseña incorrectos'}


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()    
    return jsonify({'message': 'Sesión cerrada correctamente'})