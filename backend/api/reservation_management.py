from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, delete, update, and_, not_, exists, func
from app.db import engine, metadata
from datetime import datetime, date

reservation_management_bp = Blueprint('reservation_management', __name__)

users = Table('users', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)
rentals = Table('rentals', metadata, autoload_with=engine)


@reservation_management_bp.route('/cancel_reservation', methods=['DELETE'])
def cancel_reservation():
    reservation = request.get_json()

    if not isinstance(reservation, dict):
        return {'message': 'Datos inválidos'}, 400

    reservation_id = reservation.get('reservation_id')
    cost = reservation.get('cost')
    cancelation_policy_id = reservation.get('cancelation_policy_id')

    if not all([reservation_id, cost, cancelation_policy_id]):
        return {'message': 'Faltan datos para procesar la cancelación'}, 400

    # Cálculo de reembolso según política
    if cancelation_policy_id == 1:
        refund = cost
    elif cancelation_policy_id == 2:
        refund = cost * 0.2
    else:
        refund = 0

    stmt = update(reservations).where(reservations.c.reservation_id == reservation_id).values(
        is_rented=2,
        cost=refund
    )

    with engine.connect() as conn:
        conn.execute(stmt)
        conn.commit()

    user_role = session.get('user_role')
    if user_role == 'employee':
        msg = f'Reserva cancelada. Se reembolsaron ${refund:.2f} a la cuenta del cliente.'
    else:
        msg = f'Reserva cancelada. Se reembolsaron ${refund:.2f} a su cuenta.'

    return {'message': msg}, 200


@reservation_management_bp.route('/reserve', methods=['POST'])
def reserve():  
    data = request.get_json()
    user_id = session.get('user_id')
    role = session.get('user_role')

    with engine.connect() as conn:
        try:
            pickup_datetime = datetime.strptime(data.get('pickup_datetime'), '%Y-%m-%d').date()
            return_datetime = datetime.strptime(data.get('return_datetime'), '%Y-%m-%d').date()
            days = (return_datetime - pickup_datetime).days

            # Obtener costo
            stmt = select((categories.c.price_per_day * days).label('cost')).where(categories.c.category_id == data.get('category'))
            cost_row = conn.execute(stmt).fetchone()
            if cost_row is None:
                return jsonify({'error': 'Categoría inválida'}), 400
            cost = cost_row[0]

            # Obtener branch_id
            stmt = select(branches.c.branch_id).where(branches.c.name == data.get('pickup_branch'))
            pickup_branch_row = conn.execute(stmt).fetchone()
            if pickup_branch_row is None:
                return jsonify({'error': 'Sucursal no encontrada'}), 400
            pickup_branch_id = pickup_branch_row[0]

            stmt = select(branches.c.branch_id).where(branches.c.name == data.get('return_branch'))
            return_branch_row = conn.execute(stmt).fetchone()
            if return_branch_row is None:
                return jsonify({'error': 'Sucursal no encontrada'}), 400
            return_branch_id = return_branch_row[0]

            reserve_info = {
                'cost': cost,
                'branch_id_pickup': pickup_branch_id,
                'branch_id_return' : return_branch_id,
                'pickup_datetime': data.get('pickup_datetime'),
                'return_datetime': data.get('return_datetime'),
                'category_id': data.get('category'),
                'is_rented': 0
            }

            if role == 'user':
                reserve_info['user_id'] = user_id
            else:
                stmt = select(users).where(users.c.email == data.get('email'))
                user_row = conn.execute(stmt).fetchone()
                if user_row is None:
                    return jsonify({'error': 'Usuario no encontrado'}), 400
                reserve_info['user_id'] = user_row.user_id

            stmt = insert(reservations).values(reserve_info)
            conn.execute(stmt)
            conn.commit()

            return jsonify({'message': 'Se registró su reserva'}), 200

        except Exception as e:
            print("Error al reservar:", e)
            return jsonify({'error': 'Error interno del servidor'}), 500

@reservation_management_bp.route('/annul_reservation', methods=['POST'])
def annul_reservation():
    data = request.get_json()
    reserve_id = data.get('reservation_id')

    stmt = select(reservations).where(reservations.c.reservation_id == reserve_id)

    with engine.begin() as conn:
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'message': 'La reserva no existe'}), 404

        category_id = result.category_id
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

        # Si hay disponibles en la categoría original
        if available_vehicles:
            return jsonify({'message': 'Hay vehículos disponibles para dar de alta esta reserva'}), 400

        # Si no hay disponibles, buscar en categorías de mayor prioridad
        stmt = select(categories.c.priority).where(categories.c.category_id == category_id)
        current_priority_row = conn.execute(stmt).fetchone()

        if not current_priority_row:
            return jsonify({'message': 'Error al obtener prioridad de categoría'}), 500

        current_priority = current_priority_row.priority

        stmt = select(categories.c.category_id).where(
            categories.c.priority < current_priority
        ).order_by(categories.c.priority.asc())
        higher_categories = conn.execute(stmt).fetchall()

        # Buscar en las categorías superiores
        for cat in higher_categories:
            stmt = select(vehicles).where(
                and_(
                    vehicles.c.category_id == cat.category_id,
                    vehicles.c.branch_id == branch_id_pickup,
                    vehicles.c.condition_id == 1,
                    not_(vehicles.c.vehicle_id.in_(reserved_vehicles_subq))
                )
            )
            vehicles_in_higher = conn.execute(stmt).fetchall()
            if vehicles_in_higher:
                return jsonify({'message': 'Hay vehículos disponibles en categorías superiores para dar de alta esta reserva'}), 400

        # Si llegamos aquí, no hay vehículos disponibles en ninguna categoría
        conn.execute(
            update(reservations)
            .where(reservations.c.reservation_id == reserve_id)
            .values(is_rented=2)
        )
        
        return jsonify({'message': 'La reserva fue anulada por falta de disponibilidad', 'refund': cost}), 200


@reservation_management_bp.route('/check_email', methods=['POST'])
def check_email():
    data = request.get_json()
    email = data.get('email')

    with engine.connect() as conn:
        stmt = select(func.count()).select_from(users).where(users.c.email == email)
        result = conn.execute(stmt).scalar()

        if result > 0:
            return jsonify({'message': 'El email de usuario existe'}), 200
        return jsonify({'message': 'El email de usuario no existe'}), 400