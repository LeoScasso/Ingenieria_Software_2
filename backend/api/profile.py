from flask import Blueprint, request, jsonify, session
from sqlalchemy import select, update, delete
from app.db import engine, metadata
from .functions import check_values

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
        current_password = data.get('password')
        
        if role == 'user':
            stmt = select(users).where(users.c.user_id == user_id)
            current_user = conn.execute(stmt).fetchone()
            if current_user.password != current_password:
                return jsonify({'error': 'Contraseña actual incorrecta'}), 403
                
            data_user = {
                'name' : data.get('name'),
                'last_name' : data.get('last_name'),
                'dni' : data.get('dni'),
                'email' : data.get('email'),
                'phone_number' : data.get('phone_number'),
                'password' : current_password,  # Mantener la contraseña actual por defecto
            }

            # Solo actualizar la contraseña si se proporciona una nueva
            if data.get('new_password'):
                data_user['password'] = data.get('new_password')

            stmt = update(users).where(users.c.user_id == user_id).values(data_user)
            conn.execute(stmt)

        elif role == 'employee':
            stmt = select(employees).where(employees.c.employee_id == user_id)
            current_employee = conn.execute(stmt).fetchone()
            if not current_employee or current_employee.password != current_password:
                return jsonify({'error': 'Contraseña actual incorrecta'}), 403
            
            stmt = select(branches).where(branches.c.name == data.get('branch'))
            result = conn.execute(stmt).fetchone()

            data_employee = {
                'name' : data.get('name'),
                'last_name' : data.get('last_name'),
                'dni' : data.get('dni'),
                'email' : data.get('email'),
                'phone_number' : data.get('phone_number'),
                'password' : current_password,  # Mantener la contraseña actual por defecto
                'branch_id' : result.branch_id
            }
            
            # Solo actualizar la contraseña si se proporciona una nueva
            if data.get('new_password'):
                data_employee['password'] = data.get('new_password')
                
            stmt = update(employees).where(employees.c.employee_id == user_id ).values(data_employee)
            conn.execute(stmt)
            
        else:  # admin
            stmt = select(admins).where(admins.c.admin_id == user_id)
            current_admin = conn.execute(stmt).fetchone()
            if not current_admin or current_admin.password != current_password:
                return jsonify({'error': 'Contraseña actual incorrecta'}), 403
                
            data_admin = {
                'name' : data.get('name'),
                'email' : data.get('email'),
                'password' : current_password  # Mantener la contraseña actual por defecto
            }
            
            # Solo actualizar la contraseña si se proporciona una nueva
            if data.get('new_password'):
                data_admin['password'] = data.get('new_password')
                
            stmt = update(admins).where(admins.c.admin_id == user_id).values(data_admin)
            conn.execute(stmt)
            
        conn.commit()
        
        return jsonify({'message': 'Perfil actualizado correctamente'}), 200


@profile_bp.route('/delete_employee', methods=['DELETE'])
def delete_employee():
    employee = request.get_json()
    stmt = delete(employees).where(employees.c.employee_id == employee['employee_id'])
    with engine.connect() as conn:
        conn.execute(stmt)
        conn.commit()
        return jsonify({'message':'Empleado eliminado con exito'}),200
    

@profile_bp.route('/edit_employee', methods=['PUT'])
def edit_employee():
    data = request.get_json()
    
    # Verificar que el employee_id está presente
    if not data.get('employee_id'):
        return jsonify({'message': 'ID de empleado no proporcionado'}), 400

    with engine.connect() as conn:
        # Verificar sucursal
        stmt = select(branches).where(branches.c.name == data.get('branch'))
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'message': 'Sucursal no encontrada'}), 404
        
        # Preparar datos
        data_employee = {
            'name': data.get('name'),
            'last_name': data.get('last_name'),
            'dni': data.get('dni'),
            'email': data.get('email'),
            'phone_number': data.get('phone_number'),
            'password': data.get('password'),
            'branch_id': result.branch_id,
        }

        if not check_values(data_employee):
            return jsonify({'message': 'Debe ingresar todos los campos'}), 400

        # Verificar si el empleado existe
        stmt_check = select(employees).where(employees.c.employee_id == data.get('employee_id'))
        if not conn.execute(stmt_check).fetchone():
            return jsonify({'message': 'Empleado no encontrado'}), 404

        # Actualizar
        stmt_update = (
            update(employees)
            .where(employees.c.employee_id == data.get('employee_id'))
            .values(data_employee)
        )
        result = conn.execute(stmt_update)
        conn.commit()  # ¡Importante hacer commit!
        
        if result.rowcount == 0:
            return jsonify({'message': 'No se realizaron cambios'}), 400
            
        return jsonify({'message': 'Empleado editado con éxito'}), 200
