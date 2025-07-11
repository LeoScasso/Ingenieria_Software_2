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
employees = Table('employees', metadata, autoload_with=engine)
conditions = Table('vehicle_conditions', metadata, autoload_with=engine)

@rental_management_bp.route('/rental', methods=['POST'])
def rental():
    data = request.get_json()
    reserve_id = data.get('id')

    stmt = select(reservations).where(reservations.c.reservation_id == reserve_id)

    with engine.begin() as conn:
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'message': 'La reserva no existe'}), 404

        category_id = result.category_id
        original_category_id = category_id  
        cost = result.cost
        pickup_date = result.pickup_datetime
        return_date = result.return_datetime
        branch_id_pickup = result.branch_id_pickup

        # Vehículos ya reservados en ese período
        reserved_vehicles_subq = select(rentals.c.vehicle_id).select_from(
            rentals.join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
        ).where(
            and_(
                reservations.c.pickup_datetime <= return_date,
                reservations.c.return_datetime >= pickup_date
            )
        ).subquery()

        # Intentamos con la categoría original
        stmt = select(vehicles).where(
            and_(
                vehicles.c.category_id == category_id,
                vehicles.c.branch_id == branch_id_pickup,
                vehicles.c.condition_id == 1,
                not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq))
            )
        )
        available_vehicles = conn.execute(stmt).fetchall()

        # Si no hay, buscar categorías de mayor prioridad (menor número)
        if not available_vehicles:
            stmt = select(categories.c.priority).where(categories.c.category_id == category_id)
            current_priority_row = conn.execute(stmt).fetchone()

            if not current_priority_row:
                return jsonify({'message': 'Error al obtener prioridad de categoría'}), 500

            current_priority = current_priority_row.priority

            stmt = select(categories.c.category_id, categories.c.priority).where(
                categories.c.priority < current_priority
            ).order_by(categories.c.priority.asc())

            higher_categories = conn.execute(stmt).fetchall()

            for higher_cat in higher_categories:
                new_category_id = higher_cat.category_id

                stmt = select(vehicles).where(
                    and_(
                        vehicles.c.category_id == new_category_id,
                        vehicles.c.branch_id == branch_id_pickup,
                        vehicles.c.condition_id == 1,
                        not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq))
                    )
                )
                available_vehicles = conn.execute(stmt).fetchall()

                if available_vehicles:
                    category_id = new_category_id  # actualizar categoría usada
                    break

        # Si no se encontró ningún vehículo
        if not available_vehicles:
            return jsonify({'message': 'No hay vehículos disponibles'}), 200

        # Seleccionamos un vehículo aleatorio
        selected_vehicle = random.choice(available_vehicles)

        # Obtener nombre de categoría final
        stmt = select(categories.c.name).where(categories.c.category_id == selected_vehicle.category_id)
        category_name = conn.execute(stmt).fetchone()[0]

        # Crear alquiler
        new_rental = {
            'final_cost': cost,
            'vehicle_id': selected_vehicle.vehicle_id,
            'reservation_id': reserve_id
        }

        conn.execute(update(reservations).where(reservations.c.reservation_id == reserve_id).values(is_rented=1))
        result = conn.execute(insert(rentals).returning(rentals.c.rental_id), new_rental)
        rental_id = result.scalar()

        conn.execute(update(vehicles).where(vehicles.c.vehicle_id == selected_vehicle.vehicle_id).values(condition_id=2))

        response_data = {
            'message': f'Se dio de alta su alquiler, la categoría es {category_name}',
            'number_plate': selected_vehicle.number_plate,
            'rental_id': rental_id,
            'category_name': category_name,
            'category_changed': original_category_id != selected_vehicle.category_id
        }

        return jsonify(response_data), 200

@rental_management_bp.route('/rentals_for_pickup_branch', methods=['GET'])
def rentals_for_pickup_branch():

    employee_id = session.get('user_id')
    stmt = select(employees.c.branch_id).where(employees.c.employee_id == employee_id)

    with engine.begin() as conn:

        result = conn.execute(stmt).fetchone()
        branch_id = result.branch_id

        stmt = select(rentals.c.final_cost,
                    reservations.c.pickup_datetime,
                    reservations.c.return_datetime,
                    reservations.c.branch_id_return, 
                    vehicles.c.number_plate,
                    categories.c.name,
                    users.c.email,
                    users.c.phone_number
                    ).select_from(
                        rentals
                        .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
                        .join(vehicles, rentals.c.vehicle_id == vehicles.c.vehicle_id)
                        .join(categories, vehicles.c.category_id == categories.c.category_id)
                        .join(users, reservations.c.user_id == users.c.user_id)
                        ).where((reservations.c.branch_id_pickup == branch_id) & (vehicles.c.condition_id == 2)
                                ).order_by(reservations.c.pickup_datetime.desc())

        result = conn.execute(stmt).fetchall()
        if not result:
            return jsonify({'message': 'No hay alquileres registrados'})

        return jsonify([dict(row._mapping) for row in result])               

@rental_management_bp.route('/rentals_for_return_branch', methods=['GET'])
def rentals_for_return_branch():

    employee_id = session.get('user_id')
    stmt = select(employees.c.branch_id).where(employees.c.employee_id == employee_id)

    with engine.begin() as conn:

        result = conn.execute(stmt).fetchone()
        branch_id = result.branch_id

        stmt = select(rentals.c.final_cost,
                    reservations.c.pickup_datetime,
                    reservations.c.return_datetime,
                    vehicles.c.number_plate,
                    categories.c.name,
                    users.c.email,
                    users.c.phone_number
                    ).select_from(
                        rentals
                        .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
                        .join(vehicles, rentals.c.vehicle_id == vehicles.c.vehicle_id)
                        .join(categories, vehicles.c.category_id == categories.c.category_id)
                        .join(users, reservations.c.user_id == users.c.user_id)
                        ).where((reservations.c.branch_id_return == branch_id) & (vehicles.c.condition_id == 2)
                                ).order_by(reservations.c.return_datetime.desc())

        result = conn.execute(stmt).fetchall()
        if not result:
            return jsonify({'message': 'No hay alquileres registrados'})

        return jsonify([dict(row._mapping) for row in result])
    
@rental_management_bp.route('/register_return', methods=['POST'])
def register_return():
    data = request.get_json()
    rental_id = data.get('rental_id')

    stmt = select(vehicles.c.vehicle_id,
                  reservations.c.return_datetime,
                  reservations.c.reservation_id,
                  reservations.c.category_id,
                  rentals.c.final_cost
                  ).select_from(
                      vehicles
                      .join(rentals, vehicles.c.vehicle_id == rentals.c.vehicle_id)
                      .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
                  ).where(rentals.c.rental_id == rental_id)
    
    with engine.begin() as conn:

        result = conn.execute(stmt).fetchone()


        conn.execute(update(vehicles).where(vehicles.c.vehicle_id == result.vehicle_id).values(condition_id = 3))
        conn.execute(update(reservations).where(reservations.c.reservation_id == result.reservation_id).values(is_rented = 3))

        return_date = datetime.strptime(result.return_datetime, "%Y-%m-%d").date()
        today = datetime.now().date()
        days = (today - return_date).days
        
        if(days == 0):
            return jsonify({'message': 'Devolucion registrada exitosamente'}),200
        
        price = conn.execute(select(categories.c.price_per_day).where(categories.c.category_id == result.category_id)).fetchone()
        new_cost = result.final_cost + price.price_per_day * days * 1.5
        conn.execute(update(rentals).where(rentals.c.rental_id == rental_id
                                           ).values(final_cost = new_cost))
        
        return jsonify({'message':'El vehiculo se entrego tarde',
                        'days' : days,
                        'aditional' : price.price_per_day * days * 1.5}),200
