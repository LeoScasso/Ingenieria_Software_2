from flask import Blueprint, jsonify, session
from sqlalchemy import Table, select, join, and_
from app.db import engine, metadata

rental_history_bp = Blueprint('rental_history_bp',__name__)

rentals = Table('rentals', metadata, autoload_with=engine)
reservations = Table('reservations', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
cancelation_policies = Table('cancelation_policies', metadata, autoload_with=engine)

@rental_history_bp.route('/user_rentals', methods=['GET'])
def user_rentals():
    user_id = session['user_id']
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401    
    stmt = select(
        rentals,
        reservations,
        vehicle_models.c.name.label("model_name"),
        vehicle_models.c.year.label("model_year"),
        vehicle_brands.c.name.label("brand_name"),
        vehicle_categories.c.name.label("category_name"),
        cancelation_policies.c.name.label("cancelation_policy_name")
    ).select_from(
        rentals.join(vehicles,rentals.c.vehicle_id == vehicles.c.vehicle_id)
        .join(vehicle_models, vehicle_models.c.model_id == vehicles.c.model_id)
        .join(vehicle_brands, vehicle_brands.c.brand_id == vehicle_models.c.brand_id)
        .join(vehicle_categories, vehicle_categories.c.category_id == vehicles.c.category_id)
        .join(cancelation_policies, cancelation_policies.c.policy_id == vehicles.c.cancelation_policy_id)
        .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
    ).where(reservations.c.user_id == user_id)

    with engine.connect() as conn:
        result = conn.execute(stmt)
    # Mapea las rows en una lista de diccionarios
    user_rentals = [dict(fila._mapping) for fila in result]

    return jsonify(user_rentals)

@rental_history_bp.route('/user_reservations', methods=['GET'])
def user_reservations():
    user_id = session['user_id']
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401    
    stmt = select(
        reservations.c.reservation_id,
        reservations.c.user_id,
        reservations.c.pickup_datetime,
        reservations.c.cost,
        reservations.c.is_rented,
        vehicle_categories.c.name.label('vehicle_category')
        ).select_from(
            reservations.join(vehicle_categories,reservations.c.category_id == vehicle_categories.c.category_id)
        ).where((reservations.c.user_id == user_id)&(reservations.c.is_rented == 0))
    with engine.connect() as conn:
        result = conn.execute(stmt)
        user_reservations = [dict(fila._mapping) for fila in result]
    
    return jsonify(user_reservations)