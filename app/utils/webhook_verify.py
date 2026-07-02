import hmac
import hashlib
import os

WEBHOOK_SECRET = os.getenv('NOMBA_WEBHOOK_SECRET', 'NombaHackathon2026')

def verify_signature(request, signature):
    if not signature:
        return False
    try:
        payload = request.get_data(as_text=True)
        computed = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(computed, signature)
    except Exception as e:
        print(f"Webhook verification error: {e}")
        return False
