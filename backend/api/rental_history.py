from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

rental_history_bp = Blueprint('rental_history_bp',__name__)

rentals = Table('rentals',metadata,autoload_with=engine)
reservations = Table('reservations',metadata,autoload_with=engine)
user_id = session['user_id']

@rental_history_bp.route('/user_rentals', methods=['GET'])
def user_rentals(): 
    stmt = select(rentals).where(rentals.c.user_id == user_id)
    with engine.connect() as conn:
        result = conn.execute(stmt)
    # Mapea las rows en una lista de diccionarios
    user_rentals = [dict(fila._mapping) for fila in result]
    return jsonify(user_rentals)



@rental_history_bp.route('/user_reservations', methods=['GET'])
def user_reservations(): 
    stmt = select(reservations).where(reservations.c.user_id == user_id)
    with engine.connect() as conn:
        result = conn.execute(stmt)
    user_reservations = [dict(fila._mapping) for fila in result]
    return jsonify(user_reservations)