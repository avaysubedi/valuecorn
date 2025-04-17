from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from auth.routes import auth_bp  # 👈 this is important
from valuation.routes import valuations_bp




app = Flask(__name__)
CORS(app) 
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # move to .env later

jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(valuations_bp)


if __name__ == '__main__':
    app.run(debug=True)
