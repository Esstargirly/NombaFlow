from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Merchant

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
