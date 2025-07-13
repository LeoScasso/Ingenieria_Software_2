from flask import Blueprint, request, jsonify, session
from sqlalchemy import Table, select, insert, and_, update, or_, distinct,func
from app.db import engine, metadata
from datetime import datetime

metrics_bp = Blueprint('metrics', __name__)

categories = Table('vehicle_categories', metadata, autoload_with=engine)
vehicles = Table('vehicles', metadata, autoload_with=engine)
rentals = Table('rentals', metadata, autoload_with=engine)
users = Table('users', metadata, autoload_with=engine)
reservations = Table('reservations',  metadata, autoload_with=engine)
policies = Table('cancelation_policies', metadata, autoload_with=engine)
models = Table('vehicle_models', metadata, autoload_with=engine)
brands = Table('vehicle_brands', metadata, autoload_with=engine)


@metrics_bp.route('/income', methods=['POST'])
def income():

    data = request.get_json()
    first_date = datetime.strptime(data.get('first_date'), '%Y-%m-%d').date()
    second_date = datetime.strptime(data.get('second_date'), '%Y-%m-%d').date()

    stmt = select(categories.c.name,
                  func.sum(rentals.c.final_cost).label('category_income')
                  ).select_from(
                    rentals
                    .join(vehicles, rentals.c.vehicle_id == vehicles.c.vehicle_id)
                    .join(categories, vehicles.c.category_id == categories.c.category_id)
                    .join(reservations, rentals.c.reservation_id == reservations.c.reservation_id)
                    ).where(and_(reservations.c.pickup_datetime >= first_date,
                                 reservations.c.return_datetime <= second_date)
                    ).group_by(categories.c.name)
    
    with engine.begin() as conn:

        result = conn.execute(stmt).fetchall()
        all_income = [dict(row._mapping) for row in result]

        stmt = select(policies.c.policy_id,
                      func.sum(reservations.c.cost).label('refund')
                        ).select_from(
                            reservations
                            .join(categories, reservations.c.category_id == categories.c.category_id)
                            .join(policies, categories.c.cancelation_policy_id == policies.c.policy_id)
                            ).where(and_(reservations.c.pickup_datetime >= first_date,
                                        reservations.c.return_datetime <= second_date,
                                        reservations.c.is_rented == 2)
                            ).group_by(policies.c.policy_id)
        
        result = conn.execute(stmt).fetchall()
        canceled_total = 0

        for row in result:
            policy_id = row.policy_id
            refund = row.refund

            if policy_id == 2:
                canceled_total += refund * 0.8
            elif policy_id == 3:
                canceled_total += refund

        if not all_income and canceled_total == 0:
            return jsonify({'message': 'No hubo ingresos entre las fechas especificadas'}), 200
                
        all_income.append({'name': 'Cancelados', 'category_income': round(canceled_total, 2)})
        return jsonify(all_income)

@metrics_bp.route('/registered', methods=['POST'])
def registered():

    data = request.get_json()
    first_date = datetime.strptime(data.get('first_date'), '%Y-%m-%d').date()
    second_date = datetime.strptime(data.get('second_date'), '%Y-%m-%d').date()

    stmt = select(users).where(and_(users.c.registration_date >= first_date,
                                    users.c.registration_date <=second_date))
    
    with engine.begin() as conn:
        result = conn.execute(stmt).fetchall()

        if not result:
            return jsonify({'message' : 'No hubieron registros entre las fechas solicitadas'}),200
        
        return jsonify([dict(row._mapping) for row in result])



@metrics_bp.route('/rented_vehicles', methods=['POST'])
def rented_vehicles():
    data = request.get_json()
    first_date = datetime.strptime(data.get('first_date'), '%Y-%m-%d').date()
    second_date = datetime.strptime(data.get('second_date'), '%Y-%m-%d').date()

    stmt = select(categories.c.name.label('categoria'),
                func.count().label('total')
                ).select_from(
                rentals
                .join(vehicles, rentals.c.vehicle_id == vehicles.c.vehicle_id)
                .join(categories, vehicles.c.category_id == categories.c.category_id)
                .join(reservations, reservations.c.reservation_id == rentals.c.reservation_id)
            .where(and_(reservations.c.pickup_datetime >= first_date,
                reservations.c.return_datetime <= second_date)
            ).group_by(categories.c.name)
            )
    
    with engine.connect() as conn:
        result = conn.execute(stmt).fetchall()
        data_to_send = [{'categoria': row.name, 'total': row.total} for row in result]
    return jsonify(data_to_send)