# views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse, FileResponse
from wsgiref.util import FileWrapper
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import SignUpSerializer, JWTSerializer, TwoFactorSetupSerializer, TwoFactorVerifySerializer

#####
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate
import pyotp
import logging


User = get_user_model()
logger = logging.getLogger(__name__)


def index(request):
	return render(request, 'html/index.html')

def base_styles(request):
	f = open('frontend/css/styles.css', 'r')
	return HttpResponse(f.read(), content_type='text/css')

def bootstrap_styles(request):
	f = open('frontend/bootstrap/css/bootstrap.min.css', 'r')
	return HttpResponse(f.read(), content_type='text/css')

def bootstrap_js(request):
	f = open('frontend/bootstrap/js/bootstrap.min.js', 'r')
	return HttpResponse(f.read(), content_type='text/javascript')


def font_base(request):
	f = open('frontend/media/fonts/JetBrainsMono-Regular.woff2', 'rb')
	return HttpResponse(f.read(), content_type='file/woff2')


def font_bold(request):
	f = open('frontend/media/fonts/JetBrainsMono-Bold.woff2', 'rb')
	return HttpResponse(f.read(), content_type='file/woff2')

def logo(request):
	f = open('frontend/media/logo.svg', 'r')
	return HttpResponse(f.read(), content_type='image/svg+xml')

def bg_video(request):
	f = open('frontend/media/LANDING_VIDEO.mp4', 'rb')
	return FileResponse(f, content_type='video/mp4')

#--------------------------------------------#

class SignUpView(generics.CreateAPIView):
    serializer_class = SignUpSerializer

class LoginView(generics.GenericAPIView):
    serializer_class = JWTSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class TwoFactorSetupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorSetupSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class TwoFactorVerifyView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
	

### API views

# Registration api view
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({'success': 'User created successfully'}, status=status.HTTP_201_CREATED)

# Login using JWT
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]



# Login api view that checks credentials, if they are correct sends 2fa code to mail
class Login2fView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        logger.debug(f'username: {username}, password: {password}') #remove ############################

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.otp_secret:
            user.otp_secret = pyotp.random_base32()
            user.save()

        totp = pyotp.TOTP(user.otp_secret, interval=300)
        token = totp.now()
        subject = 'Login 2fa code'
        message = f'Your 2fa code is {token}'
        from_email = settings.EMAIL_HOST_USER
        send_mail(subject, message, from_email, [user.email])

        return Response({'success': '2fa code sent to your email'}, status=status.HTTP_200_OK)



# Verify 2fa code api view, if code is correct returns JWT tokens
class TwoFactorVerifyView(APIView):
    permission_classes = [AllowAny]
    # throttle_classes = [UserRateThrottle] # add later

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'Invalid username'}, status=status.HTTP_400_BAD_REQUEST)
        
        totp = pyotp.TOTP(user.otp_secret, interval=300)

        if not totp.verify(otp, valid_window=2):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # If OTP is valid, generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        logger.info(f'User {user.username} logged in successfully') #remove ############################

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_200_OK)

    

# Refresh token api view
class TokenRefreshView(TokenObtainPairView):
    permission_classes = [AllowAny]



# Logout api view
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'success': 'User logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        

# Get protected data test api view
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'success': 'You are accessing protected data'})
        
        
