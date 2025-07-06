from flask import Blueprint, request, jsonify
from sqlalchemy import Table, select, insert, update, and_
from sqlalchemy.exc import IntegrityError
from app.db import engine, metadata

packages_bp = Blueprint('packages', __name__)

packages = Table('packages', metadata, autoload_with=engine)
rental_packages = Table('rental_packages', metadata, autoload_with=engine)
rentals = Table('rentals', metadata, autoload_with=engine)

@packages_bp.route('/get_packages', methods=['GET'])
def get_packages():
    """Obtiene todos los paquetes disponibles"""
    try:
        with engine.connect() as conn:
            stmt = select(packages.c.package_id, packages.c.name, packages.c.price)
            result = conn.execute(stmt).fetchall()
            
            packages_list = []
            for row in result:
                package_info = {
                    'package_id': row.package_id,
                    'name': row.name,
                    'price': row.price
                }
                packages_list.append(package_info)
            
            return jsonify(packages_list), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener paquetes: {str(e)}'}), 500

@packages_bp.route('/add_package_to_rental', methods=['POST'])
def add_package_to_rental():
    """Agrega un paquete a un alquiler con cantidad específica"""
    data = request.get_json()
    
    rental_id = data.get('rental_id')
    package_id = data.get('package_id')
    quantity = data.get('quantity', 1)  # Por defecto 1 si no se especifica
    
    if not all([rental_id, package_id]):
        return jsonify({'message': 'Error: faltan rental_id o package_id'}), 400
    
    try:
        with engine.begin() as conn:
            # Verificar que el alquiler existe
            stmt = select(rentals).where(rentals.c.rental_id == rental_id)
            rental = conn.execute(stmt).fetchone()
            if not rental:
                return jsonify({'message': 'El alquiler especificado no existe'}), 404
            
            # Verificar que el paquete existe
            stmt = select(packages).where(packages.c.package_id == package_id)
            package = conn.execute(stmt).fetchone()
            if not package:
                return jsonify({'message': 'El paquete especificado no existe'}), 404
            
            # Agregar el paquete al alquiler (puede haber múltiples registros para diferentes cantidades)
            for _ in range(quantity):
                stmt = insert(rental_packages).values({
                    'rental_id': rental_id,
                    'package_id': package_id
                })
                conn.execute(stmt)
            
            return jsonify({'message': f'Paquete agregado exitosamente al alquiler {rental_id}'}), 200
            
    except IntegrityError:
        return jsonify({'message': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        return jsonify({'message': f'Error al agregar paquete: {str(e)}'}), 500

@packages_bp.route('/get_rental_packages/<int:rental_id>', methods=['GET'])
def get_rental_packages(rental_id):
    """Obtiene los paquetes asociados a un alquiler específico"""
    try:
        with engine.connect() as conn:
            stmt = select(
                packages.c.package_id,
                packages.c.name,
                packages.c.price,
                rental_packages.c.rental_id
            ).select_from(
                rental_packages.join(packages, rental_packages.c.package_id == packages.c.package_id)
            ).where(rental_packages.c.rental_id == rental_id)
            
            result = conn.execute(stmt).fetchall()
            
            # Agrupar por paquete y contar cantidad
            package_counts = {}
            for row in result:
                package_id = row.package_id
                if package_id not in package_counts:
                    package_counts[package_id] = {
                        'package_id': package_id,
                        'name': row.name,
                        'price': row.price,
                        'quantity': 0,
                        'total_price': 0
                    }
                package_counts[package_id]['quantity'] += 1
                package_counts[package_id]['total_price'] += row.price
            
            packages_list = list(package_counts.values())
            return jsonify(packages_list), 200
            
    except Exception as e:
        return jsonify({'message': f'Error al obtener paquetes del alquiler: {str(e)}'}), 500 