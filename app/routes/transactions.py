from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Merchant, Transaction

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    merchant_id = get_jwt_identity()
    merchant = Merchant.query.get(int(merchant_id))

    if not merchant:
        return jsonify({'message': 'Merchant not found'}), 404

    transactions = Transaction.query.filter_by(
        merchant_id=merchant.id
    ).order_by(Transaction.created_at.desc()).all()

    return jsonify({
        'transactions': [
            {
                'id': tx.id,
                'sender_name': tx.sender_name,
                'sender_bank': tx.sender_bank,
                'amount': float(tx.amount),
                'reference': tx.reference,
                'narration': tx.narration,
                'status': tx.status,
                'created_at': tx.created_at.isoformat(),
            }
            for tx in transactions
        ]
    }), 200
