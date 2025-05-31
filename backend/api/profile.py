from flask import Blueprint, request, jsonify, session
from sqlalchemy import select, update
from app.db import engine, metadata

profile_bp = Blueprint('profile', __name__)

users = metadata.tables.get('users')
employees = metadata.tables.get('employees')
admins = metadata.tables.get('admins')
branches = metadata.tables.get('branches')

@profile_bp.route('/my_profile', methods=['GET'])
def profile():
    user_id = session['user_id']
    role = session['user_role']

    if role == 'user':
        stmt = select(users).where(users.c.user_id == user_id)
    elif role == 'employee':
        stmt = select(employees).where(employees.c.employee_id == user_id)
    else:
        stmt = select(admins).where(admins.c.admin_id == user_id)

    with engine.connect() as conn:
        
        result = conn.execute(stmt).fetchone()

        if role == 'user':
            data = {
                'name' : result.name,
                'last_name' : result.last_name,
                'dni' : result.dni,
                'email' : result.email,
                'phone_number' : result.phone_number
            }
        elif role == 'employee':
            stmt = select(branches).where(branches.c.branch_id == result.branch_id )
            branch = conn.execute(stmt).fetchone()
            data = {
                'name' : result.name,
                'last_name' : result.last_name,
                'dni' : result.dni,
                'email' : result.email,
                'phone_number' : result.phone_number,
                'branch_name' : branch.name
            }
        elif role == 'admin':
            data = {
                'name' : result.name,
                'email' : result.email
            }
        else:
            return jsonify({'error': 'No se pudo obtener el perfil'}), 400
        return jsonify(data)

@profile_bp.route('/update_profile', methods=['PUT'])
def update_profile():
    
    user_id = session['user_id']
    role = session['user_role']
    data = request.get_json()

    with engine.connect() as conn:

        if role == 'user':
            data_user = {
                'name' : data.get('name'),
                'last_name' : data.get('last_name'),
                'dni' : data.get('dni'),
                'email' : data.get('email'),
                'phone_number' : data.get('phone_number'),
                'password' : data.get('password')
            }

            stmt = update(users).where(users.c.user_id == user_id).values(data_user)
            conn.execute(stmt)
        elif role == 'employee':
            
            stmt = select(branches).where(branches.c.name == data.get('branch'))
            result = conn.execute(stmt).fetchone()

            data_employee = {
                'name' : data.get('name'),
                'last_name' : data.get('last_name'),
                'dni' : data.get('dni'),
                'email' : data.get('email'),
                'phone_number' : data.get('phone_number'),
                'password' : data.get('password'),
                'branch_id' : result.branch_id
            }
            stmt = update(employees).where(employees.c.employee_id == user_id ).values(data_employee)
            conn.execute(stmt)
        else:
            data_admin = {
                'name' : data.get('name'),
                'email' : data.get('email'),
                'password' : data.get('password')
            }
            stmt = update(admins).where(admins.c.admin_id == user_id).values(data_admin)
            conn.execute(stmt)
        conn.commit()
