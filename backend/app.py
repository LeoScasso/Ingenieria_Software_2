from flask import Flask
from flask_cors import CORS

# Import Blueprints
from api.registration import registration_bp
from api.authentication import authentication_bp
from api.rental_history import rental_history_bp
from api.fleet import fleet_bp
from api.profile import profile_bp
from api.getters import getters_bp

app = Flask(__name__)
app.secret_key = 'grupo57'

# Configuración de la sesión
app.config['SESSION_COOKIE_SECURE'] = False  # En desarrollo, en producción debería ser True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Cambiado de 'None' a 'Lax'

CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:3000"])

# Register Blueprints
app.register_blueprint(registration_bp, url_prefix='/api')
app.register_blueprint(authentication_bp, url_prefix='/api')
app.register_blueprint(rental_history_bp, url_prefix='/api')
app.register_blueprint(fleet_bp, url_prefix='/api')
app.register_blueprint(profile_bp, url_prefix='/api')
app.register_blueprint(getters_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, port=5000)

