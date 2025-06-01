from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_, distinct
from app.db import engine, metadata

getters_bp = Blueprint('getters', __name__)

vehicle_models = Table('vehicle_models', metadata, autoload_with=engine)
vehicle_brands = Table('vehicle_brands', metadata, autoload_with=engine)
branches = Table('branches', metadata, autoload_with=engine)

@getters_bp.route('get_models', methods=['GET'])
def get_models():
    with engine.connect() as conn:
        stmt = select(vehicle_models.c.name).distinct().order_by(vehicle_models.c.name)
        result = conn.execute(stmt).fetchall
        models = [row.result for row in result]
        return jsonify(models), 200

@getters_bp.route('get_models_by_brand', methods=['GET'])
def get_models_by_brand():
    brand_name = request.args.get('brand')
    if not brand_name:
        return jsonify({'message':'No se ha introducido una marca'})
    
    stmt = select(vehicle_brands.c.id).where(vehicle_brands.c.name == brand_name)
    brand_result = conn.execute(stmt).fetchone()

    with engine.connect() as conn:
        stmt = select(distinct(vehicle_models.c.name)).where(vehicle_models.c.brand_id == brand_result.brand_id).order_by(vehicle_models.c.name)
        result = conn.execute(stmt).fetchall()
        models = [row.result for row in result]
        return jsonify(models), 200


@getters_bp.route('get_brands', methods=['GET'])
def get_brands():
    with engine.connect() as conn:
        stmt = select(vehicle_brands.c.name).distinct().order_by(vehicle_brands.c.name)
        result = conn.execute(stmt).fetchall
        brands = [row.result for row in result]
        return jsonify(brands), 200
    
@getters_bp.route('get_branches', methods=['GET'])
def get_branches():
    with engine.connect() as conn:
        stmt = select(branches.c.name).distinct().order_by(branches.c.name)
        result = conn.execute(stmt).fetchall
        branch = [row.result for row in result]
        return jsonify(branch), 200
