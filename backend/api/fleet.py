from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_
from app.db import engine, metadata

fleet_bp = Blueprint('fleet', __name__)

vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_conditions = Table('vehicle_conditions', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
cancelations_policies = Table('cancelations_policies', metadata, autoload_with=engine)


@fleet_bp.route('/vehicle_registration', methods=['POST'])
def vehicle_registration():
    data = request.get_json()

    vehicle = {
        'number_plate' : data.get('number_plate'),
        'capacity' : data.get('capacity'),
        'price_per_day' : data.get('price_per_day'),
        'minimun_rental_days' : data.get('minimun_rental_days')
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
