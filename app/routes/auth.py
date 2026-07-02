from flask import Blueprint, request, jsonify
from app.extensions import db, bcrypt
from app.models import Merchant, VirtualAccount
from app.services.nomba import get_access_token, create_virtual_account
from flask_jwt_extended import create_access_token
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    business_name = data.get('business_name')
    owner_name = data.get('owner_name')
    email = data.get('email')
    password = data.get('password')

    if not all([business_name, owner_name, email, password]):
        return jsonify({'message': 'All fields are required'}), 400

    if Merchant.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    # Hash password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create merchant
    merchant = Merchant(
        business_name=business_name,
        owner_name=owner_name,
        email=email,
        password_hash=password_hash
    )
    db.session.add(merchant)
    db.session.flush()

    # Get Nomba token and create virtual account
    token = get_access_token()
    if not token:
        db.session.rollback()
        return jsonify({'message': 'Failed to connect to Nomba API'}), 500

    account_ref = f"nombaflow-{uuid.uuid4().hex[:12]}"
    nomba_account = create_virtual_account(token, account_ref, business_name)

    if not nomba_account:
        db.session.rollback()
        return jsonify({'message': 'Failed to create virtual account'}), 500

    # Save virtual account
    virtual_account = VirtualAccount(
    merchant_id=merchant.id,
    account_ref=account_ref,
    account_number=nomba_account.get('bankAccountNumber'),
    bank_name=nomba_account.get('bankName'),
    account_name=nomba_account.get('bankAccountName'),
    status='active'
)
    db.session.add(virtual_account)
    db.session.commit()

    # Generate JWT
    access_token = create_access_token(identity=str(merchant.id))

    return jsonify({
    'token': access_token,
    'merchant': {
        'id': merchant.id,
        'business_name': merchant.business_name,
        'email': merchant.email
    },
    'virtual_account': {
        'account_number': virtual_account.account_number,
        'bank_name': virtual_account.bank_name,
        'account_name': virtual_account.account_name,
    }
}), 201



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400

    merchant = Merchant.query.filter_by(email=email).first()

    if not merchant or not bcrypt.check_password_hash(merchant.password_hash, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(merchant.id))

    return jsonify({'token': access_token}), 200
