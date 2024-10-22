from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .jwt_utils import verify, decode_payload
from .models import BlackListedToken
from django.contrib.auth import get_user_model
import time

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None  # No authentication if header is missing or improperly formatted

        token = auth_header.split(' ')[1]

        # Check if the token is blacklisted
        if BlackListedToken.objects.filter(token=token).exists():
            raise AuthenticationFailed('Token has been blacklisted')

        # Verify and decode the JWT token
        if not verify(token):
            raise AuthenticationFailed('Invalid token')

        payload = decode_payload(token)

        # Check if the token is an access token and not expired
        if payload.get('type') != 'access':
            raise AuthenticationFailed('Invalid token type')

        if payload.get('exp', 0) < time.time():
            raise AuthenticationFailed('Token has expired')

        # At this point, the token is valid
        user_id = payload.get('user_id')

        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

        # Return the authenticated user and token
        return (user, token)

    def authenticate_header(self, request):
        return 'Bearer'