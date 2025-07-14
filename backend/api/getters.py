from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_, distinct
from app.db import engine, metadata

getters_bp = Blueprint('getters', __name__)

vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)
categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_conditions = Table('vehicle_conditions', metadata, autoload_with=engine)
employees = Table('employees', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
reservations = Table('reservations', metadata, autoload_with=engine)
users = Table('users', metadata, autoload_replace=engine)

@getters_bp.route('get_models', methods=['GET'])
def get_models():
    with engine.connect() as conn:
        stmt = select(vehicle_models.c.name).distinct().order_by(vehicle_models.c.name)
        result = conn.execute(stmt).fetchall
        models = [row.result for row in result]
        return jsonify(models), 200

@getters_bp.route('/get_models_by_brand')
def get_models_by_brand():
    brand_name = request.args.get('brand')

    if not brand_name:
        return jsonify({'error': 'No se proporcionó la marca'}), 400

    with engine.connect() as conn:
        # Obtener el brand_id de vehicle_brands
        stmt = select(vehicle_brands.c.brand_id).where(vehicle_brands.c.name == brand_name)
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'error': 'Marca no encontrada'}), 404

        brand_id = result[0]

        # Obtener los modelos asociados a ese brand_id
        stmt = select(vehicle_models.c.name).where(vehicle_models.c.brand_id == brand_id).distinct()
        result = conn.execute(stmt)

        models = [row[0] for row in result]

    return jsonify(models)

@getters_bp.route('/get_brands', methods=['GET'])
def get_brands():
    with engine.connect() as conn:
        stmt = select(distinct(vehicle_brands.c.name)).order_by(vehicle_brands.c.name)
        result = conn.execute(stmt).fetchall()
        brands = [row[0] for row in result]  # row[0] es el nombre de la marca
        return jsonify(brands), 200
    
@getters_bp.route('/get_branches', methods=['GET'])
def get_branches():
    with engine.connect() as conn:
        # Obtener información básica de sucursales
        stmt = select(branches.c.branch_id, branches.c.name, branches.c.address, branches.c.locality).order_by(branches.c.name)
        result = conn.execute(stmt).fetchall()
        
        branches_list = []
        for row in result:
            # Contar empleados por sucursal
            employees_stmt = select(employees.c.employee_id).where(employees.c.branch_id == row.branch_id)
            employees_result = conn.execute(employees_stmt).fetchall()
            employee_count = len(employees_result)
            
            # Contar vehículos por sucursal
            vehicles_stmt = select(vehicles.c.vehicle_id).where(vehicles.c.branch_id == row.branch_id)
            vehicles_result = conn.execute(vehicles_stmt).fetchall()
            fleet_size = len(vehicles_result)
            
            branch_info = {
                'branch_id': row.branch_id,
                'branch_status': row.status,
                'name': row.name,
                'address': row.address,
                'locality': row.locality,
                'employee_count': employee_count,
                'fleet_size': fleet_size
            }
            branches_list.append(branch_info)
        
        return jsonify(branches_list), 200

@getters_bp.route('/get_categories', methods=['GET'])
def get_categories():
    with engine.connect() as conn:
        stmt = select(categories.c.category_id, categories.c.name, categories.c.price_per_day, categories.c.minimum_rental_days, categories.c.cancelation_policy_id).order_by(categories.c.name)
        result = conn.execute(stmt).fetchall()
        categories_list = [
            {
                "category_id": row.category_id,
                "name": row.name,
                "price_per_day": row.price_per_day,
                "minimum_rental_days": row.minimum_rental_days,
                "cancelation_policy_id": row.cancelation_policy_id
            }
            for row in result
        ]
    return jsonify(categories_list), 200

@getters_bp.route('/get_employees', methods=['GET'])
def get_employees():
    stmt = select(employees,branches.c.name).select_from(employees.join(branches, employees.c.branch_id == branches.c.branch_id))
    with engine.begin() as conn:
        result = conn.execute(stmt).fetchall()
        if not result:
            return jsonify({'message': 'No hay empleados'}),400
        
        return jsonify([dict(row._mapping) for row in result]),200


@getters_bp.route('/employee_detail', methods=['POST'])
def employee_detail():
    data = request.get_json()
    employee_id = data.get('employee_id')

    stmt = select(employees,branches.c.name.label('branch_name')
                        ).select_from(employees.join(branches, employees.c.branch_id == branches.c.branch_id)
                                    ).where(employees.c.employee_id == employee_id)
    
    with engine.begin() as conn:
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'message':'empleado no encontrado'})

        return jsonify(dict(result._mapping)),200
    
@getters_bp.route('/get_all_reserves', methods=['GET'])
def get_all_reserves():
    employee_id = session['user_id']
    stmt = select(employees.c.branch_id).where(employees.c.employee_id == employee_id)

    with engine.begin() as conn:
        result = conn.execute(stmt).fetchone()

        stmt = select(reservations,
                      users.c.name.label('user_name'),
                      users.c.last_name,
                      users.c.email,
                      users.c.dni,
                      categories.c.name.label('category_name')
                      ).select_from(reservations
                                    .join(users, reservations.c.user_id == users.c.user_id)
                                    .join(categories, reservations.c.category_id == categories.c.category_id)
                                    ).where(and_(reservations.c.branch_id_pickup == result.branch_id,
                                                reservations.c.is_rented == 0))

        result = conn.execute(stmt).fetchall()
        if not result:
            return jsonify({'message': 'No hay reservas activas'})
        
        return jsonify([dict(row._mapping) for row in result])

@getters_bp.route('/get_branch_detail/<int:branch_id>', methods=['GET'])
def get_branch_detail(branch_id):
    # Verificar que el usuario sea administrador
    if session.get('user_role') != 'admin':
        return jsonify({'error': 'Acceso denegado. Solo administradores pueden acceder a este endpoint'}), 403
    
    with engine.connect() as conn:
        # Obtener información básica de la sucursal
        stmt = select(branches).where(branches.c.branch_id == branch_id)
        branch_result = conn.execute(stmt).fetchone()
        
        if not branch_result:
            return jsonify({'error': 'Sucursal no encontrada'}), 404
        
        # Obtener empleados de la sucursal (información limitada)
        employees_stmt = select(
            employees.c.employee_id,
            employees.c.name,
            employees.c.last_name,
            employees.c.email,
            employees.c.phone_number
        ).where(employees.c.branch_id == branch_id).order_by(employees.c.name)
        
        employees_result = conn.execute(employees_stmt).fetchall()
        employees_list = [
            {
                'employee_id': row.employee_id,
                'name': row.name,
                'last_name': row.last_name,
                'email': row.email,
                'phone_number': row.phone_number
            }
            for row in employees_result
        ]
        
        # Obtener vehículos de la sucursal (patente, categoría y condición)
        vehicles_stmt = select(
            vehicles.c.number_plate,
            categories.c.name.label('category_name'),
            vehicle_conditions.c.name.label('condition_name')
        ).select_from(
            vehicles.join(categories, vehicles.c.category_id == categories.c.category_id)
            .join(vehicle_conditions, vehicles.c.condition_id == vehicle_conditions.c.condition_id)
        ).where(vehicles.c.branch_id == branch_id).order_by(vehicles.c.number_plate)
        
        vehicles_result = conn.execute(vehicles_stmt).fetchall()
        vehicles_list = [
            {
                'number_plate': row.number_plate,
                'category_name': row.category_name,
                'condition_name': row.condition_name
            }
            for row in vehicles_result
        ]
        
        # Contar estadísticas
        employee_count = len(employees_list)
        fleet_size = len(vehicles_list)
        
        branch_detail = {
            'branch_id': branch_result.branch_id,
            'name': branch_result.name,
            'address': branch_result.address,
            'locality': branch_result.locality,
            'employee_count': employee_count,
            'fleet_size': fleet_size,
            'employees': employees_list,
            'vehicles': vehicles_list
        }
        
        return jsonify(branch_detail), 200
        