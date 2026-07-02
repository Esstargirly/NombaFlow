from flask import Flask, send_from_directory
from app.extensions import db, bcrypt, jwt, cors
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__, static_folder='../static')

    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.merchant import merchant_bp
    from app.routes.transactions import transactions_bp
    from app.routes.webhook import webhook_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(merchant_bp, url_prefix='/api/merchant')
    app.register_blueprint(transactions_bp, url_prefix='/api')
    app.register_blueprint(webhook_bp, url_prefix='/webhook')

    # Serve frontend
    @app.route('/')
    def index():
        return send_from_directory('../static', 'index.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        return send_from_directory('../static', filename)

    # Create tables
    with app.app_context():
        db.create_all()

    return app
