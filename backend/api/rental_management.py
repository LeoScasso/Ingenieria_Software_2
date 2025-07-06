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

        return check_available_vehicles(conn, available_vehicles, cost, reserve_id, category_id, branch_id_pickup, reserved_vehicles_subq)

def check_available_vehicles(conn, available_vehicles, cost, reserve_id, category_id, branch_id_pickup, reserved_vehicles_subq):
    if not available_vehicles:
        # Obtener prioridad actual
        stmt = select(categories.c.priority).where(categories.c.category_id == category_id)
        current_priority_row = conn.execute(stmt).fetchone()

        if not current_priority_row:
            return jsonify({'message': 'Error al obtener prioridad de categoría'}), 500

        current_priority = current_priority_row.priority

        # Buscar categoría con mayor prioridad (número menor = mayor prioridad)
        stmt = select(categories.c.category_id).where(
            categories.c.priority < current_priority
        ).order_by(categories.c.priority.asc()).limit(1)

        higher_category = conn.execute(stmt).fetchone()

        if not higher_category:
            return jsonify({'message': 'No hay categorías superiores disponibles'}), 200

        new_category_id = higher_category.category_id

        # Buscar vehículos disponibles de esa nueva categoría
        stmt = select(vehicles).where(
            and_(
                vehicles.c.category_id == new_category_id,
                vehicles.c.branch_id == branch_id_pickup,
                vehicles.c.condition_id == 1,
                not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq))
            )
        )
        available_vehicles = conn.execute(stmt).fetchall()

        if not available_vehicles:
            return jsonify({'message': 'No hay vehículos disponibles'}), 200

    # Seleccionar vehículo al azar
    selected_vehicle = random.choice(available_vehicles)

    # Obtener nombre de categoría para mensaje
    stmt = select(categories.c.name).where(categories.c.category_id == selected_vehicle.category_id)
    category_name = conn.execute(stmt).fetchone()[0]
    message = f'Se dio de alta su alquiler, la categoría es {category_name}'

    # Crear alquiler
    new_rental = {
        'final_cost': cost,
        'vehicle_id': selected_vehicle.vehicle_id,
        'reservation_id': reserve_id
    }

    conn.execute(update(reservations).where(reservations.c.reservation_id == reserve_id).values(is_rented=1))
    conn.execute(insert(rentals).values(new_rental))
    conn.execute(update(vehicles).where(vehicles.c.vehicle_id == selected_vehicle.vehicle_id).values(condition_id=2))

    return jsonify({'message': message, 'number_plate': selected_vehicle.number_plate}), 200