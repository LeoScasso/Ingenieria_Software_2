from flask import Blueprint, jsonify

hello_bp = Blueprint('hello_bp', __name__)

@hello_bp.route('/hello')
def hello():
    return jsonify(message='Hello world!') 