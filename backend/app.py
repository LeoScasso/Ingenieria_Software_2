from flask import Flask
from flask_cors import CORS

# Import Blueprints
from api.registration import registration_bp
from api.authentication import authentication_bp
from api.rental_history import rental_history_bp
from api.fleet import fleet_bp
from api.profile import profile_bp
app = Flask(__name__)
app.secret_key = 'grupo57'
CORS(app)  # This will allow all origins. For production, configure it more securely.

# Register Blueprints
app.register_blueprint(registration_bp, url_prefix='/api')
app.register_blueprint(authentication_bp, url_prefix='/api') # All auth routes will be under /api
app.register_blueprint(rental_history_bp, url_prefix='/api')
app.register_blueprint(fleet_bp, url_prefix='/api')
app.register_blueprint(profile_bp,url_prefix='/api')
app.secret_key = 'grupo57'
CORS(app) # This will allow all origins. For production, configure it more securely.

if __name__ == '__main__':
    app.run(debug=True, port=5000)

