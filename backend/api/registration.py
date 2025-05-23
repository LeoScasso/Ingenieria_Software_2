from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert
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
        'last_name': data.get('last_name'),
        'dni': data.get('dni'),
        'phone_number':  data.get('phone_number')
        }
    if any(value is None for value in new_user.values()):
        return jsonify({
            'message':'Error, faltan campos que completar'
        })
    if len(new_user['password'])<8:
            return jsonify({
                'message':'Error, la contraseña debe tener como minimo 8 caracteres.'
            })
    
    # Busca si el email ya se encuentra registrado
    with engine.connect() as conn:
        stmt = select(users).where(users.c.email == new_user['email'])
        result = conn.execute(stmt).fetchone()
        if result:
            return jsonify({
                'message':'Error, el email ya se encuentra registrado!'
            })
        else:
            ins = insert(users).values(new_user)
            conn.execute(ins)
            conn.commit()
            return jsonify({'message':'usuario registrado con exito'}),200




