from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, delete, update, and_, not_
from app.db import engine, metadata
from datetime import datetime
import random

rental_management_bp = Blueprint("rental_management", __name__)

users = Table('users', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)
rentals = Table('rentals', metadata, autoload_with=engine)

@rental_management_bp.route('/rental', methods=['POST'])
def rental():
    data = request.get_json()
    reserve_id = data.get('id')

    stmt = select(reservations).where(reservations.c.reservation_id == reserve_id)

    with engine.begin() as conn:
        result = conn.execute(stmt).fetchone()
        category_id = result.category_id
        cost = result.cost
        pickup_date = result.pickup_datetime
        return_date = result.return_datetime

        reserved_vehicles_subq = select(reservations.c.vehicle_id).where(
        and_(
            reservations.c.pickup_datetime <= return_date,
            reservations.c.return_datetime >= pickup_date,
            reservations.c.reservation_id != reserve_id  
        )).subquery()

        stmt = select(vehicles).where(
            not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq)),
            vehicles.c.category_id == category_id
        )
        available_vehicles = conn.execute(stmt).fetchall()

        return check_available_vehicles(conn, available_vehicles, cost, reserve_id, category_id, reserved_vehicles_subq)

def check_available_vehicles(conn, available_vehicles, cost, reserve_id, category_id, reserved_vehicles_subq):
    
    if not available_vehicles:
        if category_id < 1:
            stmt = select(vehicles).where(
            not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq)),
            vehicles.c.category_id > category_id)
        else:
            stmt = select(vehicles).where(
            not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq)),
            vehicles.c.category_id < category_id)
        
        available_vehicles = conn.execute(stmt).fetchall()
        if not available_vehicles:
            return jsonify({'message': 'No hay vehiculos disponibles'})
        
    selected_vehicle = random.choice(available_vehicles)
    
    stmt = select(categories.c.name).where(categories.c.category_id == selected_vehicle.category_id)
    category_name = conn.execute(stmt).fetchone()[0]
    message = f'Se dio de alta su alquiler en categoría {category_name}'

    new_rental = {
        'final_cost' : cost,
        'vehicle_id' : selected_vehicle.vehicle_id,
        'reservation_id' : reserve_id
    }

    stmt = update(reservations).where(reservations.c.reservation_id == reserve_id).values(is_rented=1)
    conn.execute(stmt)

    stmt = insert(rentals).values(new_rental)
    conn.execute(stmt)

    return jsonify({'message': message ,
                    'number_plate': selected_vehicle.number_plate}), 200