from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, join
from app.db import engine, metadata

fleet_bp = Blueprint('fleet', __name__)

vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_conditions = Table('vehicle_conditions', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
cancelations_policies = Table('cancelations_policies', metadata, autoload_with=engine)


@fleet_bp.route('/vehicle_registration', methods=['POST'])
def vehicle_registration():
    data = request.get_json()

    vehicle = {
        'number_plate' : data.get('number_plate'),
        'capacity' : data.get('capacity'),
        'price_per_day' : data.get('price_per_day'),
        'minimum_rental_days' : data.get('minimum_rental_days')
    }

    with engine.connect() as conn:

        stmt = select(vehicle_models).where(
            and_(
                vehicle_models.c.name == data.get('model'),
                vehicle_models.c.year == data.get('year')
            )
        )
        model = conn.execute(stmt).fetchone()

        stmt = select(vehicle_categories).where(vehicle_categories.c.name == data.get('category'))
        category = conn.execute(stmt).fetchone()

        stmt = select(vehicle_conditions).where(vehicle_conditions.c.name == data.get('condition'))
        condition = conn.execute(stmt).fetchone()

        stmt = select(cancelations_policies).where(cancelations_policies.c.name == data.get('policy'))
        policy = conn.execute(stmt).fetchone()

        vehicle.update({
            'model_id' : model.model_id,
            'cancelation_policy_id' : policy.policy_id,
            'category_id' :category.category_id,
            'condition' : condition.condition_id
        })

        stmt = insert(vehicles).values(vehicle)
        conn.execute(stmt)
        conn.commit()


@fleet_bp.route('/categories', methods=['GET'])
def get_categories():
    with engine.connect() as conn:
        stmt = select(vehicle_categories.c.name)
        result = conn.execute(stmt).fetchall()

        categories = [row.name for row in result]

    return jsonify(categories)


@fleet_bp.route('/update_vehicle', methods=['PUT'])
def update_vehicle():
    data = request.get_json()
    number_plate = data.get('number_plate')

    with engine.connect() as conn:
        
        stmt = select(vehicle_models).where(
            and_(
                vehicle_models.c.name == data.get('model'),
                vehicle_models.c.year == data.get('year')
            )
        )
        model = conn.execute(stmt).fetchone()

        stmt = select(vehicle_categories).where(vehicle_categories.c.name == data.get('category'))
        category = conn.execute(stmt).fetchone()

        stmt = select(vehicle_conditions).where(vehicle_conditions.c.name == data.get('condition'))
        condition = conn.execute(stmt).fetchone()

        stmt = select(cancelations_policies).where(cancelations_policies.c.name == data.get('policy'))
        policy = conn.execute(stmt).fetchone()

        new_fields = {
            'number_plate' : data.get('number_plate'),
            'capacity' : data.get('capacity'),
            'price_per_day' : data.get('price_per_day'),
            'minimum_rental_days' : data.get('minimum_rental_days'),
            'model_id' : model.model_id,
            'cancellation_policy_id' : policy.policy_id,
            'category_id' :category.category_id,
            'condition' : condition.condition_id
        }

        stmt = update(vehicles).where(vehicles.c.number_plate == number_plate).values(new_fields)
        conn.execute(stmt)
        conn.commit()

@fleet_bp.route('/get_vehicles',methods=['GET'])
def get_vehicles():
    
    stmt = select(vehicles.c.number_plate,
            vehicles.c.capacity,
            vehicles.c.price_per_day,
            vehicles.c.minimum_rentat_days,
            vehicle_models.c.name.label('model'),
            vehicle_brands.c.name.label('brand'),
            vehicle_categories.c.name.label('category'),
            vehicle_conditions.c.name.label('condition'),
            cancelations_policies.c.name.label('policy'),
            vehicle_models.c.year
            ).select_from(
                vehicles
                .join(vehicle_models, vehicles.c.model_id == vehicle_models.c.model_id)
                .join(vehicle_categories, vehicles.c.category_id == vehicle_categories.c.category_id)
                .join(vehicle_conditions, vehicles.c.condition == vehicle_conditions.c.condition_id)
                .join(cancelations_policies, vehicles.c.cancelation_policy_id == cancelations_policies.c.policy_id)
                .join(vehicle_brands, vehicle_brands.c.brand_id == vehicle_models.c.brand_id)
            )
    with engine.connect() as conn:
        result = conn.execute(stmt).fetchall()
    vehicles_list = [dict(row) for row in result]
    return jsonify(vehicles_list)