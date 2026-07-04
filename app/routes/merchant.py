from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Merchant
from app.extensions import db, bcrypt

merchant_bp = Blueprint('merchant', __name__)

@merchant_bp.route('/me', methods=['GET'])
@jwt_required()
def get_merchant():
    merchant_id = get_jwt_identity()
    merchant = Merchant.query.get(int(merchant_id))

    if not merchant:
        return jsonify({'message': 'Merchant not found'}), 404

    account = merchant.virtual_account

    return jsonify({
        'id': merchant.id,
        'business_name': merchant.business_name,
        'owner_name': merchant.owner_name,
        'email': merchant.email,
        'virtual_account': {
            'account_number': account.account_number if account else None,
            'bank_name': account.bank_name if account else None,
            'account_name': account.account_name if account else None,
            'account_reference': account.account_ref if account else None,
        } if account else None
    }), 200


@merchant_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_merchant():
    merchant_id = get_jwt_identity()
    merchant = Merchant.query.get(int(merchant_id))

    if not merchant:
        return jsonify({'message': 'Merchant not found'}), 404

    data = request.get_json()
    business_name = data.get('business_name')
    owner_name = data.get('owner_name')

    if business_name:
        merchant.business_name = business_name
    if owner_name:
        merchant.owner_name = owner_name

    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200


@merchant_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    merchant_id = get_jwt_identity()
    merchant = Merchant.query.get(int(merchant_id))

    if not merchant:
        return jsonify({'message': 'Merchant not found'}), 404

    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not all([current_password, new_password]):
        return jsonify({'message': 'All fields are required'}), 400

    if not bcrypt.check_password_hash(merchant.password_hash, current_password):
        return jsonify({'message': 'Current password is incorrect'}), 401

    if len(new_password) < 8:
        return jsonify({'message': 'New password must be at least 8 characters'}), 400

    merchant.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200
