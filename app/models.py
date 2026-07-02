from app.extensions import db
from datetime import datetime

class Merchant(db.Model):
    __tablename__ = 'merchants'

    id = db.Column(db.Integer, primary_key=True)
    business_name = db.Column(db.String(255), nullable=False)
    owner_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    virtual_account = db.relationship('VirtualAccount', backref='merchant', uselist=False)
    transactions = db.relationship('Transaction', backref='merchant', lazy=True)


class VirtualAccount(db.Model):
    __tablename__ = 'virtual_accounts'

    id = db.Column(db.Integer, primary_key=True)
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
    account_ref = db.Column(db.String(255), unique=True, nullable=False)
    account_number = db.Column(db.String(20))
    bank_name = db.Column(db.String(255))
    account_name = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    transactions = db.relationship('Transaction', backref='virtual_account', lazy=True)


class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    merchant_id = db.Column(db.Integer, db.ForeignKey('merchants.id'), nullable=False)
    virtual_account_id = db.Column(db.Integer, db.ForeignKey('virtual_accounts.id'), nullable=False)
    sender_name = db.Column(db.String(255))
    sender_bank = db.Column(db.String(255))
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    reference = db.Column(db.String(255), unique=True)
    narration = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
