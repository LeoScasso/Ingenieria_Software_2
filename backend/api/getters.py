from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_
from app.db import engine, metadata
from datetime import datetime

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
