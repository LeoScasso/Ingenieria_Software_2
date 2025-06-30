from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert
from app.db import engine, metadata
from datetime import datetime
import random, string
from .functions import check_values

registration_bp = Blueprint('registration',__name__)

users = Table('users', metadata, autoload_with=engine)
employees = Table('employees', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)



@registration_bp.route('/registration', methods=['POST'])
def registration():
    data = request.get_json()
    new_user = {
        'email': data.get('email'),
        'name': data.get('name'),
        'last_name': data.get('last_name'),
        'dni': data.get('dni'),
        'phone_number':  data.get('phone_number'),
        'registration_date' : datetime.now()
        }
    with engine.connect() as conn:
        if session['user_role']:
            new_user.update({'password' : generar_contraseña()})
            if(session['user_role'] == 'admin'):
                stmt = select(branches.c.branch_id).where(branches.c.name == data.get('branch'))
                new_user.update({'branch_id': conn.execute(stmt).fetchone()})
                if(check_values(new_user)):
                    return insert_employee(conn,new_user)
        else:
            new_user.update({'password' : data.get('password')})
            if len(new_user['password'])<8:
                return jsonify({
                    'message':'Error, la contraseña debe tener como minimo 8 caracteres.'
                })
        return insert_user(conn,new_user)


def generar_contraseña(longitud=8):
    caracteres = string.ascii_letters + string.digits  # letras mayúsculas, minúsculas y números
    contraseña = ''.join(random.choices(caracteres, k=longitud))
    return contraseña

def insert_employee(conn,new_user):
    stmt = select(employees).where(employees.c.email == new_user['email'])
    result = conn.execute(stmt).fetchone()
    if result:
        return jsonify({'message': 'el email ya se encuentra registrado'}),400
    else:
        ins = insert(users).values(new_user)
        conn.execute(ins)
        conn.commit()
        return jsonify({'message': 'empleado registrado con exito', 'password': new_user['password']}),200

def insert_user(conn,new_user):
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
        return jsonify({'message':'usuario registrado con exito', 'password': new_user['password']} ),200