# views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse, FileResponse
from wsgiref.util import FileWrapper
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

#####
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken # remove
from rest_framework_simplejwt.views import TokenObtainPairView # remove
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate
import pyotp
import logging

# for custom jwt
from django.contrib.auth import authenticate
from .jwt_utils import create_token, verify, decode_payload
from .models import BlackListedToken
from django.contrib.auth.hashers import make_password # remove
import time

# 
from .models import FriendShip, FriendRequest, Tournament, TournamentInvite, MatchResult



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

### API views

# Registration api view
# class RegisterView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get('username')
#         email = request.data.get('email')
#         password = request.data.get('password')

#         if User.objects.filter(username=username).exists():
#             return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
#         if User.objects.filter(email=email).exists():
#             return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
#         user = User.objects.create_user(username=username, email=email, password=password)
#         user.save()
#         return Response({'success': 'User created successfully'}, status=status.HTTP_201_CREATED)

# # Login using JWT
# class LoginView(TokenObtainPairView):
#     permission_classes = [AllowAny]



# # Login api view that checks credentials, if they are correct sends 2fa code to mail
# class Login2fView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         logger.debug(f'username: {username}, password: {password}') #remove ############################

#         user = authenticate(username=username, password=password)
#         if user is None:
#             return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
#         if not user.otp_secret:
#             user.otp_secret = pyotp.random_base32()
#             user.save()

#         totp = pyotp.TOTP(user.otp_secret, interval=300)
#         token = totp.now()
#         subject = 'Login 2fa code'
#         message = f'Your 2fa code is {token}'
#         from_email = settings.EMAIL_HOST_USER
#         send_mail(subject, message, from_email, [user.email])

#         return Response({'success': '2fa code sent to your email'}, status=status.HTTP_200_OK)



# # Verify 2fa code api view, if code is correct returns JWT tokens
# class TwoFactorVerifyView(APIView):
#     permission_classes = [AllowAny]
#     # throttle_classes = [UserRateThrottle] # add later

#     def post(self, request):
#         username = request.data.get('username')
#         otp = request.data.get('otp')

#         try:
#             user = User.objects.get(username=username)
#         except User.DoesNotExist:
#             return Response({'error': 'Invalid username'}, status=status.HTTP_400_BAD_REQUEST)
        
#         totp = pyotp.TOTP(user.otp_secret, interval=300)

#         if not totp.verify(otp, valid_window=2):
#             return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

#         # If OTP is valid, generate JWT tokens
#         refresh = RefreshToken.for_user(user)
#         access_token = str(refresh.access_token)
#         refresh_token = str(refresh)

#         logger.info(f'User {user.username} logged in successfully') #remove ############################

#         return Response({
#             'access_token': access_token,
#             'refresh_token': refresh_token
#         }, status=status.HTTP_200_OK)

    

# # Refresh token api view
# class TokenRefreshView(TokenObtainPairView):
#     permission_classes = [AllowAny]



# # Logout api view
# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             refresh_token = request.data.get('refresh_token')
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response({'success': 'User logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
#         except Exception as e:
#             return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        

# # Get protected data test api view
# class ProtectedView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         return Response({'success': 'You are accessing protected data'})
        
        

#--------------------------------------------#
#custom jwt api views

class SignUpAPIViewJWT(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password # create_user auto hashes the password
        )
        user.save()

        access_token = create_token(user.id, 'access')
        refresh_token = create_token(user.id, 'refresh')

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_201_CREATED)

class LoginAPIViewJWT(APIView):
     permission_classes = [AllowAny]

     def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_2fa_enabled:
                user.otp_secret = pyotp.random_base32()
                user.save()
                totp = pyotp.TOTP(user.otp_secret, interval=300)
                token = totp.now()
                subject = 'Login 2fa code'
                message = f'Your 2fa code is {token}'
                from_email = settings.EMAIL_HOST_USER
                send_mail(subject, message, from_email, [user.email])
                return Response({'success': '2fa required'}, status=status.HTTP_200_OK)
            else:
                access_token = create_token(user.id, 'access')
                refresh_token = create_token(user.id, 'refresh')
                return Response({
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class Login2fViewJWT(APIView):
    permission_classes = [AllowAny]

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

        access_token = create_token(user.id, 'access')
        refresh_token = create_token(user.id, 'refresh')

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_200_OK)
     

class RefreshTokenAPIViewJWT(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh_token')

        if not refresh_token or not verify(refresh_token):
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        
        payload = decode_payload(refresh_token)
        if payload.get('type') != 'refresh':
            return Response({'error': 'Invalid token type'}, status=status.HTTP_400_BAD_REQUEST)
        
        if BlackListedToken.objects.filter(token=refresh_token).exists():
            return Response({'error': 'Token blacklisted'}, status=status.HTTP_400_BAD_REQUEST)

        if payload.get('exp') < time.time():
            return Response({'error': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = payload.get('user_id')
        token = create_token(user_id, 'access')

        return Response({'token': token}, status=status.HTTP_200_OK)


class LogoutAPIViewJWT(APIView):
     def post(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        refresh_token = request.data.get('refresh_token')

        if BlackListedToken.objects.filter(token=token).exists():
            return Response({'error': 'Token already blacklisted'}, status=status.HTTP_400_BAD_REQUEST)

        if refresh_token:
            if BlackListedToken.objects.filter(token=refresh_token).exists():
                return Response({'error': 'Token already blacklisted'}, status=status.HTTP_400_BAD_REQUEST)
            BlackListedToken.objects.create(token=refresh_token)

        BlackListedToken.objects.create(token=token)
        return Response({'success': 'Successfully logged out'}, status=status.HTTP_200_OK)



# Get protected data test api view with JWT
class ProtectedDataAPIViewJWT(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'You are accessing protected data with JWT'}, status=status.HTTP_200_OK)


# Profile settings api view
class ProfileSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            '2fa_enabled': user.is_2fa_enabled,
            'language_preference': user.language_preference
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        #check if new name or email already exists
        if User.objects.filter(username=request.data.get('username')).exclude(id=user.id).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=request.data.get('email')).exclude(id=user.id).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = request.data.get('username')
        user.email = request.data.get('email')
        user.is_2fa_enabled = request.data.get('2fa_enabled')
        user.language_preference = request.data.get('language_preference')
        user.save()

        # create new tokens for the user
        access_token = create_token(user.id, 'access')
        refresh_token = create_token(user.id, 'refresh')

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_200_OK)
    

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_sender = request.user
        user_receiver = request.data.get('user_receiver')

        if user_sender == user_receiver:
            return Response({'error': 'You cannot send request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

        if FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).exists():
            return Response({'error': 'Request already sent'}, status=status.HTTP_400_BAD_REQUEST)
        
        if FriendShip.objects.filter(user1=user_sender, user2=user_receiver).exists():
            return Response({'error': 'You are already friends'}, status=status.HTTP_400_BAD_REQUEST)

        FriendRequest.objects.create(userSender=user_sender, userReceiver=user_receiver)
        return Response({'success': 'Friend request sent'}, status=status.HTTP_201_CREATED)


    
class FriendRequestAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_sender = request.data.get('user_sender')
        user_receiver = request.user
        action = request.data.get('action')

        if not FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).exists():
            return Response({'error': 'Request does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'reject':
            FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()
            return Response({'success': 'Friend request rejected'}, status=status.HTTP_200_OK)

        FriendShip.objects.create(user1=user_sender, user2=user_receiver)
        FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()

        return Response({'success': 'Friend request accepted'}, status=status.HTTP_200_OK)

class FriendRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friend_requests = FriendRequest.objects.filter(userReceiver=user)
        return Response({
            'friend_requests': [f.userSender.username for f in friend_requests]
        }, status=status.HTTP_200_OK)

class CreateTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tournament_name = request.data.get('tournament_name')
        user_host = request.user
        user_guest0 = request.data.get('user_guest0')
        user_guest1 = request.data.get('user_guest1')
        user_guest2 = request.data.get('user_guest2')
        user_guest3 = request.data.get('user_guest3')
        user_guest4 = request.data.get('user_guest4')
        user_guest5 = request.data.get('user_guest5')
        user_guest6 = request.data.get('user_guest6')

        if Tournament.objects.filter(userHost=user_host).exists():
            return Response({'error': 'You already have a tournament'}, status=status.HTTP_400_BAD_REQUEST)

        # check if any of the users are the same or does not exist
        users = [user_guest0, user_guest1, user_guest2, user_guest3, user_guest4, user_guest5, user_guest6]
        for user in users:
            if user == user_host:
                return Response({'error': 'You cannot add yourself to the tournament'}, status=status.HTTP_400_BAD_REQUEST)
            if not User.objects.filter(username=user).exists():
                return Response({'error': f'User {user} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        Tournament.objects.create(
            tournamet_name=tournament_name,
            userHost=user_host,
            userGuest0=user_guest0,
            userGuest1=user_guest1,
            userGuest2=user_guest2,
            userGuest3=user_guest3,
            userGuest4=user_guest4,
            userGuest5=user_guest5,
            userGuest6=user_guest6
        )

        return Response({'success': 'Tournament created'}, status=status.HTTP_201_CREATED)


class TournamentGetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tournaments = Tournament.objects.filter(userHost=user)
        return Response({
            'tournaments': [t.userGuest0.username for t in tournaments]
        }, status=status.HTTP_200_OK)


class SetMatchResultView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1 = request.data.get('user1')
        user2 = request.data.get('user2')
        winner = request.data.get('winner')
        game_type = request.data.get('game_type')
        user1_score = request.data.get('user1_score')
        user2_score = request.data.get('user2_score')

        if not User.objects.filter(username=user1).exists():
            return Response({'error': f'User {user1} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(username=user2).exists():
            return Response({'error': f'User {user2} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(username=winner).exists():
            return Response({'error': f'User {winner} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        MatchResult.objects.create(
            user1=user1,
            user2=user2,
            winner=winner,
            game_type=game_type,
            user1_score=user1_score,
            user2_score=user2_score
        )

        return Response({'success': 'Match result recorded'}, status=status.HTTP_201_CREATED)


class GetMatchResultsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        match_results = MatchResult.objects.all()
        return Response({
            'match_results': [
                {
                    'user1': m.user1.username,
                    'user2': m.user2.username,
                    'winner': m.winner.username,
                    'game_type': m.game_type,
                    'user1_score': m.user1_score,
                    'user2_score': m.user2_score,
                    'date': m.date
                } for m in match_results
            ]
        }, status=status.HTTP_200_OK)
        

class GetGameStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.data.get('user')
        game_type = request.data.get('game_type')
        match_results = MatchResult.objects.filter(game_type=game_type, user1=user)
        match_results2 = MatchResult.objects.filter(game_type=game_type, user2=user)
        match_results = match_results.union(match_results2)
        wins = 0
        losses = 0
        for m in match_results:
            if m.winner == user:
                wins += 1
            else:
                losses += 1
        return Response({
            'wins': wins,
            'losses': losses
        }, status=status.HTTP_200_OK)

