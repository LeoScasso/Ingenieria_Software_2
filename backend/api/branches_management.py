from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, delete, update, exists, or_, and_
from sqlalchemy.exc import IntegrityError
from app.db import engine, metadata
from .functions import check_values

branches_management_bp = Blueprint('branches_management', __name__)

# Tablas
branches = Table('branches', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
employees = metadata.tables.get('employees')

# Funcion (no endpoint)
def set_branch_status(new_status, branch_id, conn):
    stmt = update(branches).where(branches.c.branch_id == branch_id).values(status=new_status)
    conn.execute(stmt)
    conn.commit()

@branches_management_bp.route('/logical_branch_deletion', methods=['DELETE'])
def logical_branch_deletion():
    # Verificar que el usuario esté autenticado y sea administrador
    if 'user_role' not in session:
        return jsonify({'message': 'Debe iniciar sesión para realizar esta acción'}), 401
    
    if session['user_role'] != 'admin':
        return jsonify({'message': 'Solo los administradores pueden eliminar sucursales'}), 403
    
    branch = request.get_json()
    branch_id = branch['branch_id']

    # Consultas para encontrar relaciones
    conditions = [
            select(exists().where(employees.c.branch_id == branch_id)),
            select(exists().where(vehicles.c.branch_id == branch_id)),
            select(
                exists().where(
                    and_(reservations.c.is_rented == 0,
                        or_(reservations.c.branch_id_pickup == branch_id,
                            reservations.c.branch_id_return == branch_id)
                        )
                    )
                )
    ]

    with engine.connect() as conn:
        for stmt in conditions:
            if conn.execute(stmt).scalar():
                set_branch_status(1,branch_id,conn)
                return jsonify({'message': 'La sucursal ahora esta en estado de eliminación'}),200
    
        # Si no se encuentra ninguna relación
        set_branch_status(2,branch_id,conn)
        return jsonify({'message': 'Se eliminó la sucursal'}),200


@branches_management_bp.route('/branch_edition', methods=['PUT'])
def branch_edition():
    # Verificar que el usuario esté autenticado y sea administrador
    if 'user_role' not in session:
        return jsonify({'message': 'Debe iniciar sesión para realizar esta acción'}), 401
    
    if session['user_role'] != 'admin':
        return jsonify({'message': 'Solo los administradores pueden editar sucursales'}), 403
    
    data = request.get_json()
    branch_id = data.get('branch_id')
    new_branch_name = data.get('name')

    try:
        with engine.connect() as conn:
            # Obtener el nombre actual de la sucursal
            stmt_current = select(branches.c.name).where(branches.c.branch_id == branch_id)
            current_branch = conn.execute(stmt_current).fetchone()
            
            if not current_branch:
                return jsonify({'message': 'Sucursal no encontrada'}), 404
            
            old_branch_name = current_branch[0]
            
            # Si se cambio el nombre, se verifica que no este cargado
            if new_branch_name != old_branch_name:
                stmt_check_name = select(branches).where(branches.c.name == new_branch_name)
                existing_name = conn.execute(stmt_check_name).fetchone()
                if existing_name:
                    return jsonify({'message' : 'El nombre ingresado ya se encuentra cargado'}),400
            
            branch_data = {
                'name' : data.get('name'),
                'address' : data.get('address'),
                'locality' : data.get('locality')
            }
            if check_values(branch_data):
                stmt = update(branches).where(branches.c.branch_id == branch_id).values(branch_data)
                conn.execute(stmt)
                conn.commit()
                return jsonify({'message': 'Sucursal editada con exito'}),200
            else:
                return jsonify({'message':'Debe ingresar todos los campos'}),400
    except IntegrityError:
        return jsonify({'message': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@branches_management_bp.route('/branch_registration', methods=['POST'])
def branch_registration():
    # Verificar que el usuario esté autenticado y sea administrador
    if 'user_role' not in session:
        return jsonify({'message': 'Debe iniciar sesión para realizar esta acción'}), 401
    
    if session['user_role'] != 'admin':
        return jsonify({'message': 'Solo los administradores pueden registrar sucursales'}), 403
    
    data = request.get_json();
    branch_data = {
        'name' : data.get('name'),
        'address' : data.get('address'),
        'locality' : data.get('locality'),
        'status' : 0
    }
    # Checkea si faltan campos
    if any (value is None for value in branch_data):
        return jsonify({'message' : 'Error faltan campos que completar'})
    
    try:
        with engine.connect() as conn:
            # Verificar que no exista una sucursal con el mismo nombre
            stmt = select(branches).where(branches.c.name == data.get('name'))
            result = conn.execute(stmt).fetchone()
            if result:
                return jsonify({'message' : 'Error el nombre ya se encuentra registrado'}),400
            else:
                stmt = insert(branches).values(branch_data)
                conn.execute(stmt)
                conn.commit()
                return jsonify({'message': 'Sucursal registrada con exito'}),200
            
    except IntegrityError:
        return jsonify({'message': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500