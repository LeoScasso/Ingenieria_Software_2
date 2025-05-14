from flask import Blueprint, request, jsonify, Flask
import sqlite3
from app.utils.db_utils import get_db # Adjusted import path

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    mail = data.get('mail')
    password = data.get('password')

    if not mail or not password:
        return jsonify({"message": "mail and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE mail = ?", (mail))
        user = cursor.fetchone()

        if user is None:
            return jsonify({"message": "Invalid credentials (user not found)"}), 401
        
        if user['password'] != password: 
            return jsonify({"message": "Invalid credentials (password mismatch)"}), 401

        token = 'fake-flask-jwt-token-for-' + str(user['user_id'])

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {"id": user['user_id'], "name": user['name'], "mail": user['mail']}
        }), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"message": "An error occurred during login."}), 500
    finally:
        conn.close()

# Commented out example user creation route, moved from app.py
"""
@auth_bp.route('/create_user_example', methods=['POST'])
def create_user_example():
    data = request.get_json()
    mail = data.get('mail')
    password = data.get('password')
    name = data.get('name', 'Test User')

    if not mail or not password:
        return jsonify({"message": "mail and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (mail, password, name) VALUES (?, ?, ?)", (mail, password, name))
        conn.commit()
        user_id = cursor.lastrowid
        return jsonify({"message": "User created successfully", "user_id": user_id}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "mail already exists"}), 409
    except sqlite3.Error as e:
        print(f"Database error during user creation: {e}")
        return jsonify({"message": "Failed to create user"}), 500
    finally:
        conn.close()
""" 