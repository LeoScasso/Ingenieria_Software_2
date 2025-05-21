from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, join
from app.db import engine, metadata

rental_history_bp = Blueprint('rental_history_bp',__name__)

rentals = Table('rentals', metadata, autoload_with=engine)
reservations = Table('reservations', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
vehicle_categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
cancelation_policies = Table('cancelation_policies', metadata, autoload_with=engine)
user_id = session['user_id']

@rental_history_bp.route('/user_rentals', methods=['GET'])
def user_rentals():
    # Joins anidados
    join_vehicles = reservations.join(vehicles, reservations.c.vehicle_id == vehicles.c.id)
    join_models = join_vehicles.join(vehicle_models, vehicles.c.model_id == vehicle_models.c.id)
    join_brands = join_models.join(vehicle_brands, vehicle_models.c.brand_id == vehicle_brands.c.id)
    join_categories = join_brands.join(vehicle_categories, vehicles.c.category_id == vehicle_categories.c.id)
    
    join_policies = join_categories.join(cancelation_policies, vehicles.c.cancellation_policy_id == cancelation_policies.c.id)
    
    stmt = select(
        reservations, # tomar solo los datos necesarios !!
        vehicles, # tomar solo los datos necesarios !!
        vehicle_models.c.name.label("model_name"),
        vehicle_models.c.year.label("model_year"),
        vehicle_brands.c.name.label("brand_name"),
        vehicle_categories.c.name.label("category_name"),
        cancelation_policies.c.name.label("cancelation_policy_name")
    ).select_from(join_policies).where(reservations.c.user_id == user_id)

    with engine.connect() as conn:
        result = conn.execute(stmt)
    # Mapea las rows en una lista de diccionarios
    user_rentals = [dict(fila._mapping) for fila in result]
    
    return jsonify(user_rentals)



@rental_history_bp.route('/user_reservations', methods=['GET'])
def user_reservations(): 
    j = join(reservations, vehicle_categories, reservations.c.vehicle_category_id == vehicle_categories.c.category_id )
    stmt = select(
        reservations,
        vehicle_categories.c.name.label('vehicle_category')
        ).select_from(j).where(reservations.c.user_id == user_id)

    with engine.connect() as conn:
        result = conn.execute(stmt)
        user_reservations = [dict(fila._mapping) for fila in result]
    
    return jsonify(user_reservations)

print(user_rentals())