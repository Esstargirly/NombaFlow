import requests
import os

NOMBA_BASE_URL = os.getenv('NOMBA_BASE_URL')
NOMBA_CLIENT_ID = os.getenv('NOMBA_CLIENT_ID')
NOMBA_CLIENT_SECRET = os.getenv('NOMBA_CLIENT_SECRET')
NOMBA_ACCOUNT_ID = os.getenv('NOMBA_ACCOUNT_ID')


def get_access_token():
    try:
        response = requests.post(
            f"{NOMBA_BASE_URL}/v1/auth/token/issue",
            json={
                "grant_type": "client_credentials",
                "client_id": NOMBA_CLIENT_ID,
                "client_secret": NOMBA_CLIENT_SECRET
            },
            headers={
                "Content-Type": "application/json",
                "accountId": NOMBA_ACCOUNT_ID
            }
        )
        data = response.json()
        return data.get('data', {}).get('access_token')
    except Exception as e:
        print(f"Error getting Nomba token: {e}")
        return None

def create_virtual_account(token, account_ref, account_name):
    try:
        sub_account_id = os.getenv('NOMBA_SUB_ACCOUNT_ID')
        
        response = requests.post(
            f"{NOMBA_BASE_URL}/v1/accounts/virtual/{sub_account_id}",
            json={
                "accountRef": account_ref,
                "accountName": account_name,
                "currency": "NGN"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
                "accountId": NOMBA_ACCOUNT_ID
            }
        )
        data = response.json()
        print(f"FULL NOMBA RESPONSE: {data}")
        print(f"DATA KEYS: {list(data.get('data', {}).keys())}")
        return data.get('data')
    except Exception as e:
        print(f"Error creating virtual account: {e}")
        return None

