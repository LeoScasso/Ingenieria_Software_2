from flask import Blueprint, jsonify, session, request
from sqlalchemy import Table, select, join, and_
from app.db import engine, metadata
from datetime import datetime, timedelta

rental_history_bp = Blueprint('rental_history_bp', __name__)

users = Table('users', metadata, autoload_with=engine)
rentals = Table('rentals', metadata, autoload_with=engine)
reservations = Table('reservations', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
cancelation_policies = Table('cancelation_policies', metadata, autoload_with=engine)

def add_hours(dt_str, hours=3):
    if not dt_str:
        return None
    try:
        dt = datetime.fromisoformat(dt_str)
    except ValueError:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    return dt + timedelta(hours=hours)

@rental_history_bp.route('/user_rentals', methods=['GET'])
def user_rentals():
    user_id = session.get('user_id')
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
        rentals.join(vehicles, rentals.c.vehicle_id == vehicles.c.vehicle_id)
        .join(vehicle_models, vehicle_models.c.model_id == vehicles.c.model_id)
        .join(vehicle_brands, vehicle_brands.c.brand_id == vehicle_models.c.brand_id)
        .join(vehicle_categories, vehicle_categories.c.category_id == vehicles.c.category_id)
        .join(cancelation_policies, cancelation_policies.c.policy_id == vehicle_categories.c.cancelation_policy_id)
        .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
    ).where(reservations.c.user_id == user_id)

    with engine.connect() as conn:
        result = conn.execute(stmt)
        user_rentals = [dict(fila._mapping) for fila in result]

    # Ajustamos las fechas sumando horas y convirtiendo a string ISO
    for rental in user_rentals:
        if rental.get('pickup_datetime'):
            rental['pickup_datetime'] = add_hours(rental['pickup_datetime']).isoformat()
        if rental.get('return_datetime'):
            rental['return_datetime'] = add_hours(rental['return_datetime']).isoformat()

    return jsonify(user_rentals)


@rental_history_bp.route('/user_reservations_for_employee', methods=['POST'])
def user_reservations_for_employee():
    data = request.get_json()
    email = data.get('email')
    with engine.connect() as conn:
        stmt = select(users.c.user_id).where(users.c.email == email)
        user_id = conn.execute(stmt).fetchone()
        if user_id is None:
            return jsonify({'error': 'Usuario no encontrado'}), 400
    return return_user_reservations(user_id)



@rental_history_bp.route('/user_reservations', methods=['GET'])
def user_reservations():
    return return_user_reservations(session.get('user_id'))



def return_user_reservations(user_id):
    stmt = select(
        reservations.c.reservation_id,
        reservations.c.user_id,
        reservations.c.pickup_datetime,
        reservations.c.return_datetime,
        reservations.c.cost,
        reservations.c.is_rented,
        vehicle_categories.c.name.label('vehicle_category')
    ).select_from(
        reservations.join(vehicle_categories, reservations.c.category_id == vehicle_categories.c.category_id)
    ).where(
        (reservations.c.user_id == user_id) & (reservations.c.is_rented == 0)
    )

    with engine.connect() as conn:
        result = conn.execute(stmt)
        user_reservations = [dict(fila._mapping) for fila in result]

    # Ajustamos fechas acá también
    for reservation in user_reservations:
        if reservation.get('pickup_datetime'):
            reservation['pickup_datetime'] = add_hours(reservation['pickup_datetime']).isoformat()
        if reservation.get('return_datetime'):
            reservation['return_datetime'] = add_hours(reservation['return_datetime']).isoformat()

    return jsonify(user_reservations)
