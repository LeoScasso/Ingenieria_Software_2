from flask import Flask
from flask_cors import CORS

# Import Blueprints
from app.controllers.hello_controller import hello_bp
from app.controllers.auth_controller import auth_bp
# db_utils is used by controllers, not directly here anymore unless for app-level setup

<<<<<<< HEAD
app = Flask(__name__)
CORS(app) # This will allow all origins. For production, configure it more securely.

# Register Blueprints
app.register_blueprint(hello_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api') # All auth routes will be under /api
=======
app.secret_key = 'grupo57'
>>>>>>> 20541698fe78a50edbaf20d4356f49d980a6abb6

if __name__ == '__main__':
    # The init_db logic (if you had one) would ideally be a separate CLI command or script.
    # Example: Flask CLI command `flask init-db`
    app.run(debug=True, port=5000)

