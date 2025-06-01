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
    user_id = session['user_id']
    role = session['user_role']
    with engine.connect() as conn:

        pickup_datetime = datetime.strptime(data.get('pickup_datetime'), '%Y-%m-%d').date()
        return_datetime = datetime.strptime(data.get('return_datetime'), '%Y-%m-%d').date()
        days =  (return_datetime - pickup_datetime).days

        stmt = select((categories.c.price_per_day * days).label('cost'))
        cost = conn.execute(stmt).fetchone()

        stmt = select((branches.c.branch_id)).where(branches.c.name == data.get('branch'))
        branch_id = conn.execute(stmt).fetchone()

        stmt = select(categories.c.category_id).where(categories.c.name == data.get('category'))
        category_id = conn.execute(stmt).fetchone()

        reserve_info = {
            'cost' : cost,
            'branch_id' : branch_id,
            'pickup_datetime' : data.get('pickup_datetime'),
            'return_datetime' : data.get('return_datetime'),
            'category_id' : category_id,
            'is_rented' : 0
        }

        if role == 'user':
            reserve_info.update({
                'user_id' : user_id
            })
        else:
            stmt = select(users).where(users.c.email == data.get('email'))
            result = conn.execute(stmt).fetchone()
            reserve_info.update({
                'user_id' : result.user_id
            })
        
        stmt = insert(reservations).values(reserve_info)
        conn.execute(stmt)
        conn.commit()

    return jsonify({ 'message' : 'se registro su reserva' }), 200

            
