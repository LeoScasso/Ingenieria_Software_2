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

    with engine.connect() as conn:
        result = conn.execute(stmt).fetchone()
        category_id = result.category_id
        cost = result.cost
        pickup_date = result.pickup_datetime
        return_date = result.return_datetime
        branch_id_pickup = result.branch_id_pickup

        # Buscar vehículos que están siendo utilizados en alquileres activos durante el período
        reserved_vehicles_subq = select(rentals.c.vehicle_id).select_from(
            rentals.join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
        ).where(
            and_(
                reservations.c.pickup_datetime <= return_date,
                reservations.c.return_datetime >= pickup_date
            )
        ).subquery()

        # Buscar vehículos disponibles de la misma categoría y sucursal
        stmt = select(vehicles).where(
            and_(
                vehicles.c.category_id == category_id,
                vehicles.c.branch_id == branch_id_pickup,
                vehicles.c.condition_id == 1,  # Vehículos en buen estado
                not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq))
            )
        )
        available_vehicles = conn.execute(stmt).fetchall()

        if not available_vehicles:
            return jsonify({'message': 'No hay vehículos disponibles'}), 400

        selected_vehicle = random.choice(available_vehicles)

        new_rental = {
            'final_cost' : cost,
            'vehicle_id' : selected_vehicle.vehicle_id,
            'reservation_id' : reserve_id
        }

        stmt = update(reservations).where(reservations.c.reservation_id == reserve_id).values(is_rented=1)
        conn.execute(stmt)

        stmt = insert(rentals).values(new_rental)
        conn.execute(stmt)
        conn.commit()

        return jsonify({'message': f'Se dio de alta su alquiler, el vehiculo es: {selected_vehicle.number_plate}'}), 200

