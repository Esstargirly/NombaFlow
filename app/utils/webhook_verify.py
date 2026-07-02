import hmac
import hashlib
import os

NOMBA_CLIENT_SECRET = os.getenv('NOMBA_CLIENT_SECRET')

def verify_signature(request, signature):
    if not signature:
        return False
    try:
        payload = request.get_data(as_text=True)
        computed = hmac.new(
            NOMBA_CLIENT_SECRET.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(computed, signature)
    except Exception as e:
        print(f"Webhook verification error: {e}")
        return False
