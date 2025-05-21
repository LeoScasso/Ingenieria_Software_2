from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

registration_bp = Blueprint('registration',__name__)

users = Table('users', metadata, autoload_with=engine)



@registration_bp.route('/registration', methods=['POST'])
def registration():
    data = request.get_json()
    new_user = {
        'email': data.get('email'),
        'password': data.get('password'),
        'name': data.get('name'),
        'lastname': data.get('lastname'),
        'dni': data.get('dni'),
        'phone_number':  data.get('phone_number')
        }
    if any(value is None for value in new_user.values()):
        return jsonify({
            'message':'Error, faltan campos que completar'
        })
    
    # Busca si el email ya se encuentra registrado
    with engine.connect() as conn:
        stmt = select(users).where(users.c.email == new_user['email'])
        result = conn.execute(stmt).fetchone()

        if result:
            return jsonify({
                'message':'Error, el email ya se encuentra registrado!'
            })
        elif # Verificar contraseña?


