from rest_framework.permissions import BasePermission
from .jwt_utils import verify, decode_payload
from .models import BlackListedToken
import time

class IsAuthenticatedWithJWT(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return False
        
        token = auth_header.split(' ')[1]

        if BlackListedToken.objects.filter(token=token).exists():
            return False
        
        if not verify(token):
            return False
        
        payload = decode_payload(token)
        if not payload:
            return False
        
        if payload.get('exp') < time.time():
            return False
        
        request.user_id = payload.get('user_id')
        return True
