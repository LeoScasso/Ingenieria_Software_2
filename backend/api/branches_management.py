from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, delete, update, exists, or_, and_
from app.db import engine, metadata


branches_management_bp = Blueprint('branches_management', __name__)

# Tablas
branches = Table('branches', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
employees = metadata.tables.get('employees')

def set_branch_status(new_status, branch_id):
    stmt = update(branches).where(branches.c.branch_id == branch_id).values(status=new_status)


@branches_management_bp.route('/logical_branch_deletion', methods=['DELETE'])
def logical_branch_deletion():
    branch = request.get_json()
    branch_id = branch.branch_id

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
                set_branch_status(1,branch_id)
                return jsonify({'message': 'La sucursal ahora esta en estado de eliminación'}),200
    
    # Si no se encuentra ninguna relación
    set_branch_status(2,branch_id)
    return jsonify({'message': 'Se eliminó la sucursal'}),200
