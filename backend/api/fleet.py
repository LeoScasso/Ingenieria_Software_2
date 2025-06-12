from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_
from sqlalchemy.exc import IntegrityError
from app.db import engine, metadata
from datetime import datetime

fleet_bp = Blueprint('fleet', __name__)

vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_conditions = Table('vehicle_conditions', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
cancelation_policies = Table('cancelation_policies', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)
reservations = Table('reservations', metadata, autoload_with=engine)

## Se borró la cancelation policy de los vehiculos

@fleet_bp.route('/vehicle_registration', methods=['POST'])
def vehicle_registration():
    data = request.get_json()
    

    data_check = {
            'number_plate' : data.get('number_plate'),
            'category' : data.get('category'),
            'condition' : data.get('condition'),
            'model' : data.get('model'),
            'year' : data.get('year'),
            'brand' : data.get('brand'),
            'branch' : data.get('branch')
        }

    if any(value is None for value in data_check.values()):
        return jsonify({
            'message':'Error, faltan campos que completar'
        })

    vehicle = {
        'number_plate' : data.get('number_plate'),
    }

    try:
        with engine.begin() as conn:

            stmt = select(vehicles).where(vehicles.c.number_plate == data.get('number_plate'))
            existing_vehicle = conn.execute(stmt).fetchone()
            if existing_vehicle:
                return jsonify({'message': 'La patente ingresada ya está registrada'}), 400

            stmt_model = select(vehicle_models).where(
                and_(
                    vehicle_models.c.name == data.get('model'),
                    vehicle_models.c.year == data.get('year')
                )
            )
            model = conn.execute(stmt_model).fetchone()

            if not model:
                stmt = select(vehicle_brands).where(vehicle_brands.c.name == data.get('brand'))
                brand = conn.execute(stmt).fetchone()
                if not brand:
                    new_brand = {
                        'name': data.get('brand')
                    }
                    ins = insert(vehicle_brands).values(new_brand).returning(vehicle_brands.c.brand_id)
                    brand_id = conn.execute(ins).scalar()
                else:
                    brand_id = brand.brand_id
                new_model = {
                    'name': data.get('model'),
                    'year': data.get('year'),
                    'brand_id': brand_id
                }
                ins = insert(vehicle_models).values(new_model).returning(vehicle_models.c.model_id)
                model_id = conn.execute(ins).scalar()
            else:
                model_id = model.model_id

            stmt = select(vehicle_categories).where(vehicle_categories.c.name == data.get('category'))
            category = conn.execute(stmt).fetchone()

            stmt = select(vehicle_conditions).where(vehicle_conditions.c.name == data.get('condition'))
            condition = conn.execute(stmt).fetchone()

            stmt = select(branches).where(branches.c.name == data.get('branch'))
            branch = conn.execute(stmt).fetchone()


            vehicle.update({
                'model_id' : model_id,
                'category_id' :category.category_id,
                'condition_id' : condition.condition_id,
                'branch_id' : branch.branch_id
            })

            stmt = insert(vehicles).values(vehicle)
            conn.execute(stmt)
            return jsonify({'message':'vehículo registrado con exito'}),200

    except IntegrityError:
        return jsonify({'message': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@fleet_bp.route('/categories', methods=['GET'])
def get_categories():
    with engine.connect() as conn:
        stmt = select(vehicle_categories.c.name)
        result = conn.execute(stmt).fetchall()

        categories = [row.name for row in result]

    return jsonify(categories)

## Se borró la cancelation policy de los vehiculos
@fleet_bp.route('/update_vehicle', methods=['PUT'])
def update_vehicle():
    data = request.get_json()
    old_number_plate = data.get('old_number_plate')
    new_number_plate = data.get('number_plate')

    try:
        with engine.begin() as conn:
            if new_number_plate != old_number_plate:
                stmt_check_plate = select(vehicles).where(vehicles.c.number_plate == new_number_plate)
                existing_vehicle = conn.execute(stmt_check_plate).fetchone()
                if existing_vehicle:
                    return jsonify({'message': 'La patente ingresada ya está registrada'}), 400
                
            stmt_model = select(vehicle_models).where(
                and_(
                    vehicle_models.c.name == data.get('model'),
                    vehicle_models.c.year == data.get('year')
                )
            )
            model = conn.execute(stmt_model).fetchone()
            if not model:
                stmt = select(vehicle_brands).where(vehicle_brands.c.name == data.get('brand'))
                brand = conn.execute(stmt).fetchone()
                if not brand:
                    new_brand = {
                        'name': data.get('brand')
                    }
                    ins = insert(vehicle_brands).values(new_brand).returning(vehicle_brands.c.brand_id)
                    brand_id = conn.execute(ins).scalar()
                else:
                    brand_id = brand.brand_id
                new_model = {
                    'name': data.get('model'),
                    'year': data.get('year'),
                    'brand_id': brand_id
                }
                ins = insert(vehicle_models).values(new_model).returning(vehicle_models.c.model_id)
                model_id = conn.execute(ins).scalar()
            else:
                model_id = model.model_id
            stmt = select(vehicle_categories).where(vehicle_categories.c.name == data.get('category'))
            category = conn.execute(stmt).fetchone()

            stmt = select(vehicle_conditions).where(vehicle_conditions.c.name == data.get('condition'))
            condition = conn.execute(stmt).fetchone()

            stmt = select(branches).where(branches.c.name == data.get('branch'))
            branch = conn.execute(stmt).fetchone()

            new_fields = {
                'number_plate': data.get('number_plate'),
                'model_id': model_id,
                'category_id': category.category_id,
                'condition_id': condition.condition_id,  # <== Acá el fix
                'branch_id' : branch.branch_id
            }

            stmt = update(vehicles).where(vehicles.c.number_plate == old_number_plate).values(new_fields)
            conn.execute(stmt)

            return jsonify({'message': 'Vehículo editado con éxito'}), 200

    except IntegrityError:
        return jsonify({'message': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500


## Se borró la cancelation policy de los vehiculos
@fleet_bp.route('/get_vehicles',methods=['GET'])
def get_vehicles():
    stmt = select(vehicles.c.number_plate,
            vehicle_categories.c.max_capacity,
            vehicle_categories.c.price_per_day,
            vehicle_categories.c.minimum_rental_days,
            cancelation_policies.c.name, ## Aca se encuentra la politica ahora
            vehicle_models.c.name.label('model'),
            vehicle_brands.c.name.label('brand'),
            vehicle_categories.c.name.label('category'),
            vehicle_conditions.c.name.label('condition'),
            vehicle_models.c.year,
            branches.c.name.label('Sucursal')
            ).select_from(
                vehicles
                .join(vehicle_models, vehicles.c.model_id == vehicle_models.c.model_id)
                .join(vehicle_categories, vehicles.c.category_id == vehicle_categories.c.category_id)
                .join(vehicle_conditions, vehicles.c.condition_id == vehicle_conditions.c.condition_id)
                .join(vehicle_brands, vehicle_brands.c.brand_id == vehicle_models.c.brand_id)
                .join(cancelation_policies, cancelation_policies.c.policy_id == vehicle_categories.c.cancelation_policy_id)
                .join(branches, branches.c.branch_id == vehicles.c.branch_id)
            )
    with engine.connect() as conn:
        result = conn.execute(stmt).fetchall()
    vehicles_list = [dict(row._mapping) for row in result]
    return jsonify(vehicles_list)

## Ahora faltan las politicas de cancelacion aca! agregar para segundo Sprint (si es necesario)

@fleet_bp.route('get_avaible_vehicles', methods=['GET'])
def get_avaible_vehicles():
    data = request.get_json()

    branch = data.get('branch')
    pickup_datetime = datetime.strptime(data.get('pickup_datetime'), '%Y-%m-%d').date()
    return_datetime = datetime.strptime(data.get('return_datetime'), '%Y-%m-%d').date()
    days =  (return_datetime - pickup_datetime).days
    category = data.get('category')

    with engine.begin() as conn:
        stmt = select(vehicle_categories).where(vehicle_categories.c.name == category)
        result = conn.execute(stmt).fetchone()
        category_id = result.category_id

        stmt = select(branches).where(branches.c.name == branch)
        result = conn.execute(stmt).fetchone()
        branch_id = result.branch_id

        reserved_vehicles_subq = select(reservations.c.vehicle_id).where(
            or_(
                and_(
                    reservations.c.pickup_datetime <= return_datetime,
                    reservations.c.return_datetime >= pickup_datetime
                )
            )
        ).subquery()
        
        stmt = select(
            vehicles.c.vehicle_id,
            vehicle_categories.c.capacity,
            vehicle_categories.c.cancelation_policy_id, ##
            vehicle_models.c.name.label('model'),
            vehicle_brands.c.name.label('brand'),
            vehicle_models.c.year,
            (vehicle_categories.c.price_per_day * days).label('cost')
        ).select_from(
            vehicles
                .join(vehicle_models, vehicle_models.c.model_id == vehicles.c.model_id)
                .join(vehicle_brands, vehicle_brands.c.brand_id == vehicle_models.c.brand_id)
                .join(vehicle_categories, vehicle_categories.c.category_id == vehicles.c.category_id)
        ).where((vehicles.c.branch_id == branch_id) & (vehicles.c.category_id == category_id) & (vehicles.c.conditon == 1) 
                & (vehicles.c.minimum_rantal_days <= days) & (~vehicles.c.vehicle_id.in_(reserved_vehicles_subq)))
        
        results = conn.execute(stmt).fetchall()

        vehicles_list = [dict(row._mapping) for row in results]
        return jsonify(vehicles_list)

