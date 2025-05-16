from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select
from app.db import engine, metadata

auth_bp = Blueprint('auth', __name__)

# Extrae la tabla users
users = Table('users', metadata, autoload_with=engine)

@auth_bp.route('/login',methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # statement buscando el user con el mail recibido
    stmt = select(users).where(users.c.email == email)
    with engine.connect() as conn:
        result = conn.execute(stmt).fetchone()

    if result:
        # Logea la sesion como usuario
        if result and result.password == password:
            session['user_id'] = result.user_id
            session['role'] = 'user'
    else:
        # Logea si es empleado
        employees = Table('employees',metadata, autoload_with=engine)
        stmt = select(employees).where(employees.c.email == email)
        with engine.connect() as conn:
            result = conn.execute(stmt).fetchone()
        if result and result.password == password:
            session['user_id'] = result.employee_id
            session['role'] = 'employee'
        else:
            # Logea si es admin
            admins = Table('admins',metadata,autoload_with=engine)
            stmt = select(admins).where(admins.c.email == email)
            with engine.connect() as conn:
                result = conn.execute(stmt).fetchone()

            ''' ¡¡¡¡¡¡¡¡¡¡¡¡¡¡ FALTA VERIFICACION !!!!!!!!!!!!!!!!!!!!!
                
            if result and result.password == password:
                session['user_id'] = result.admin_id
                session['role'] = 'admin' '''

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    # Retornamos mensajes (codigos)?


# hace falta el check_session? como lo implementarian?
@auth_bp.route('/check_session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({
            'logged_in':True,
            'user_id':session['user_id'],
            'role':session['role']
        })
    else:
        return jsonify({
            'logged_in': False,
        })