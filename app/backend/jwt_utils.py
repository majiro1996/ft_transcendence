import base64
import json
import hashlib
import hmac
import time
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRY = 15 * 60  # 15 minutes
REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60  # 7 days

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def sign(header:dict, payload) -> str:
    header_encoded = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_encoded = base64url_encode(json.dumps(payload).encode('utf-8'))
    message = f'{header_encoded}.{payload_encoded}'

    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()

    signature_encoded = base64url_encode(signature)
    return f'{message}.{signature_encoded}'

def verify(token: str) -> bool:
    try:
        header_encoded, payload_encoded, signature_encoded = token.split('.')
        message = f'{header_encoded}.{payload_encoded}'
        signature = base64url_decode(signature_encoded)

        expected_signature = hmac.new(
            SECRET_KEY.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()

        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        return False
    
def decode_payload(token: str) -> dict:
    try:
        _, payload_encoded, _ = token.split('.')
        payload = base64url_decode(payload_encoded)
        return json.loads(payload.decode('utf-8'))
    except Exception as e:
        return {}

def create_token(user_id: int, token_type: str) -> str:
    header = {
        'alg': ALGORITHM,
        'typ': 'JWT'
    }

    if token_type == 'access':
        expiry = ACCESS_TOKEN_EXPIRY
    elif token_type == 'refresh':
        expiry = REFRESH_TOKEN_EXPIRY
    else:
        raise ValueError('Invalid token type')
    
    payload = {
        "user_id": user_id,
        "type": token_type,
        "exp": time.time() + expiry
    }

    return sign(header, payload)

    

