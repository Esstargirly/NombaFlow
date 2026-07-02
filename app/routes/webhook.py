from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import VirtualAccount, Transaction
from app.utils.webhook_verify import verify_signature

webhook_bp = Blueprint('webhook', __name__)

@webhook_bp.route('/nomba', methods=['POST'])
def nomba_webhook():
    payload = request.get_json()

    # Verify signature
    signature = request.headers.get('nomba-signature')
    if not verify_signature(request, signature):
        return jsonify({'message': 'Invalid signature'}), 401

    event = payload.get('event')
    data = payload.get('data', {})

    if event == 'payment_success' and data.get('type') == 'vact_transfer':
        account_ref = data.get('aliasAccountReference')
        virtual_account = VirtualAccount.query.filter_by(account_ref=account_ref).first()

        if not virtual_account:
            return jsonify({'message': 'Virtual account not found'}), 404

        # Avoid duplicate transactions
        reference = data.get('transactionId') or data.get('requestId')
        existing = Transaction.query.filter_by(reference=reference).first()
        if existing:
            return jsonify({'message': 'Transaction already recorded'}), 200

        transaction = Transaction(
            merchant_id=virtual_account.merchant_id,
            virtual_account_id=virtual_account.id,
            sender_name=data.get('senderName'),
            sender_bank=data.get('senderBank'),
            amount=data.get('amount', 0),
            reference=reference,
            narration=data.get('narration'),
            status='paid'
        )
        db.session.add(transaction)
        db.session.commit()

    return jsonify({'message': 'Webhook received'}), 200
