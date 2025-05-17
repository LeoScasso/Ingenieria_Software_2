from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

profile_bp = Blueprint('profile', __name__)

users = metadata.tables.get('users')
employees = metadata.tables.get('employees')
admins = metadata.tables.get('admins')

@profile_bp.route('/my_profile', methods=['GET'])
def profile():

    user_id = session.get('user_id')
    role = session.get('role')

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
                'mail' : result.mail,
                'phone_number' : result.phone_number
            }
        elif role == 'employee':
            branches = metadata.tables.get('branches')
            stmt = select(branches).where(branches.c.branch_id == result.branch_id )
            branch = conn.execute(stmt).fetchone()
            data = {
                'name' : result.name,
                'last_name' : result.last_name,
                'dni' : result.dni,
                'mail' : result.mail,
                'phone_number' : result.phone_number,
                'branch_name' : branch.name
            }
        else:
            data = {
                'name' : result.name,
                'mail' : result.mail
            }
        return jsonify(data)

