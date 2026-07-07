from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import VirtualAccount, Transaction

webhook_bp = Blueprint('webhook', __name__)

@webhook_bp.route('/nomba', methods=['POST'])
def nomba_webhook():
    payload = request.get_json()
    print(f"Webhook received: {payload}")

    event_type = payload.get('event_type')
    data = payload.get('data', {})
    transaction_data = data.get('transaction', {})
    customer_data = data.get('customer', {})

    if event_type == 'payment_success' and transaction_data.get('type') == 'vact_transfer':
        account_ref = transaction_data.get('aliasAccountReference')
        virtual_account = VirtualAccount.query.filter_by(account_ref=account_ref).first()

        if not virtual_account:
            print(f"Virtual account not found for ref: {account_ref}")
            return jsonify({'message': 'Virtual account not found'}), 404

        reference = transaction_data.get('transactionId') or payload.get('requestId')
        existing = Transaction.query.filter_by(reference=reference).first()
        if existing:
            return jsonify({'message': 'Transaction already recorded'}), 200

        transaction = Transaction(
            merchant_id=virtual_account.merchant_id,
            virtual_account_id=virtual_account.id,
            sender_name=customer_data.get('senderName'),
            sender_bank=customer_data.get('bankName'),
            amount=transaction_data.get('transactionAmount', 0),
            reference=reference,
            narration=transaction_data.get('narration'),
            status='paid'
        )
        db.session.add(transaction)
        db.session.commit()
        print(f"Transaction saved!")

    return jsonify({'message': 'Webhook received'}), 200
