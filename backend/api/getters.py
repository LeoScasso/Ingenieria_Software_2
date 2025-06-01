from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_, distinct
from app.db import engine, metadata

getters_bp = Blueprint('getters', __name__)

vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)
categories = Table('vehicle_categories', metadata, autoload_with=engine)

@getters_bp.route('get_models', methods=['GET'])
def get_models():
    with engine.connect() as conn:
        stmt = select(vehicle_models.c.name).distinct().order_by(vehicle_models.c.name)
        result = conn.execute(stmt).fetchall
        models = [row.result for row in result]
        return jsonify(models), 200

@getters_bp.route('/get_models_by_brand')
def get_models_by_brand():
    brand_name = request.args.get('brand')

    if not brand_name:
        return jsonify({'error': 'No se proporcionó la marca'}), 400

    with engine.connect() as conn:
        # Obtener el brand_id de vehicle_brands
        stmt = select(vehicle_brands.c.brand_id).where(vehicle_brands.c.name == brand_name)
        result = conn.execute(stmt).fetchone()

        if not result:
            return jsonify({'error': 'Marca no encontrada'}), 404

        brand_id = result[0]

        # Obtener los modelos asociados a ese brand_id
        stmt = select(vehicle_models.c.name).where(vehicle_models.c.brand_id == brand_id).distinct()
        result = conn.execute(stmt)

        models = [row[0] for row in result]

    return jsonify(models)

@getters_bp.route('/get_brands', methods=['GET'])
def get_brands():
    with engine.connect() as conn:
        stmt = select(distinct(vehicle_brands.c.name)).order_by(vehicle_brands.c.name)
        result = conn.execute(stmt).fetchall()
        brands = [row[0] for row in result]  # row[0] es el nombre de la marca
        return jsonify(brands), 200
    
@getters_bp.route('/get_branches', methods=['GET'])
def get_branches():
    with engine.connect() as conn:
        stmt = select(branches.c.name, branches.c.address).distinct().order_by(branches.c.name)
        result = conn.execute(stmt).fetchall()  # ¡ojo, faltaban los paréntesis!
        branch = [{'name': row.name, 'address': row.address} for row in result]  # así extraés bien los campos
        return jsonify(branch), 200

@getters_bp.route('/get_categories', methods=['GET'])
def get_categories():
    with engine.connect() as conn:
        stmt = select(categories.c.category_id, categories.c.name, categories.c.price_per_day, categories.c.minimum_rental_days, categories.c.cancelation_policy_id).order_by(categories.c.name)
        result = conn.execute(stmt).fetchall()
        categories_list = [
            {
                "category_id": row.category_id,
                "name": row.name,
                "price_per_day": row.price_per_day,
                "minimum_rental_days": row.minimum_rental_days,
                "cancelation_policy_id": row.cancelation_policy_id
            }
            for row in result
        ]
    return jsonify(categories_list), 200
