from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, delete
from app.db import engine, metadata
from datetime import datetime

reservation_management_bp = Blueprint('reservation_management', __name__)

users = Table('users', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)


@reservation_management_bp.route('/cancel_reservation', methods=['DELETE'])
def cancel_reservation():
    reservation = request.get_json()

    stmt = delete(reservations).where(reservations.c.reservation_id == reservation.get('reservation_id'))
    with engine.connect() as conn:
        conn.execute(stmt)
        conn.commit()



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
            stmt = select(branches.c.branch_id).where(branches.c.name == data.get('branch'))
            branch_row = conn.execute(stmt).fetchone()
            if branch_row is None:
                return jsonify({'error': 'Sucursal no encontrada'}), 400
            branch_id = branch_row[0]

            reserve_info = {
                'cost': cost,
                'branch_id': branch_id,
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
