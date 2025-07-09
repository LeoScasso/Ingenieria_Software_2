from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert
from app.db import engine, metadata
from datetime import datetime
from .functions import check_values

registration_bp = Blueprint('registration', __name__)

users = Table('users', metadata, autoload_with=engine)
employees = Table('employees', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)

@registration_bp.route('/registration', methods=['POST'])
def registration():
    data = request.get_json()
    
    # Datos comunes para users y employees
    common_data = {
        'email': data.get('email'),
        'name': data.get('name'),
        'last_name': data.get('last_name'),
        'dni': data.get('dni'),
        'phone_number': data.get('phone_number')
    }
    
    with engine.connect() as conn:
        # Registros internos (por admin o empleado)
        if 'user_role' in session and session['user_role']:
            # Contraseña fija para registros internos
            password = "12345678"
            
            # Registro de empleado por admin
            if session['user_role'] == 'admin':
                # Obtener branch_id
                stmt = select(branches.c.branch_id).where(branches.c.name == data.get('branch'))
                branch_result = conn.execute(stmt).fetchone()
                
                if not branch_result:
                    return jsonify({'message': 'Sucursal no encontrada'}), 400
                
                employee_data = {
                    **common_data,
                    'password': password,
                    'branch_id': branch_result[0]
                }
                
                if check_values(employee_data):
                    return insert_employee(conn, employee_data)
            
            # Registro de cliente por empleado
            elif session['user_role'] == 'employee':
                user_data = {
                    **common_data,
                    'password': password,
                    'registration_date': datetime.now()
                }
                
                if check_values(user_data):
                    return insert_user(conn, user_data)
        
        # Registro de usuario normal (autoregistro)
        user_data = {
            **common_data,
            'password': data.get('password'),  # Contraseña proporcionada por el usuario
            'registration_date': datetime.now()
        }
        
        # Validar contraseña para usuarios normales
        if len(user_data['password']) < 8:
            return jsonify({
                'message': 'Error, la contraseña debe tener como mínimo 8 caracteres.'
            }), 400
            
        return insert_user(conn, user_data)

def insert_employee(conn, employee_data):
    # Verificar unicidad del email en ambas tablas
    stmt = select(employees.c.email).where(employees.c.email == employee_data['email'])
    if conn.execute(stmt).fetchone():
        return jsonify({'message': 'El email ya está registrado como empleado'}), 400
    
    stmt = select(users.c.email).where(users.c.email == employee_data['email'])
    if conn.execute(stmt).fetchone():
        return jsonify({'message': 'El email ya está registrado como usuario'}), 400
    
    # Insertar empleado
    ins = insert(employees).values(employee_data)
    conn.execute(ins)
    conn.commit()
    
    return jsonify({
        'message': 'Empleado registrado con éxito',
        'password': employee_data['password']
    }), 200

def insert_user(conn, user_data):
    # Verificar unicidad del email en ambas tablas
    stmt = select(users.c.email).where(users.c.email == user_data['email'])
    if conn.execute(stmt).fetchone():
        return jsonify({'message': 'El email ya está registrado como usuario'}), 400
    
    stmt = select(employees.c.email).where(employees.c.email == user_data['email'])
    if conn.execute(stmt).fetchone():
        return jsonify({'message': 'El email ya está registrado como empleado'}), 400
    
    # Insertar usuario
    ins = insert(users).values(user_data)
    conn.execute(ins)
    conn.commit()
    
    return jsonify({
        'message': 'Usuario registrado con éxito',
        'password': user_data['password']
    }), 200