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
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate
import pyotp
import logging
import json
import datetime

# for custom jwt
from django.contrib.auth import authenticate
from .jwt_utils import create_token, verify, decode_payload
from .models import BlackListedToken
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
            'refreshusers_token': refresh_token
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
        user_sender = User.objects.get(username=request.data.get('user'))
        user_receiver = User.objects.get(username=request.data.get('user_receiver'))

        if user_sender != request.user:
            return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

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
        user_sender = User.objects.get(username=request.data.get('user_sender'))
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

## Tournament views

# creates a tournament, sends invites to all user guests
class CreateTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        tournament_name = request.data.get('tournament_name')
        user_guests = request.data.get('user_guests')

        if Tournament.objects.filter(tournamet_name=tournament_name).exists():
            return Response({'error': 'Tournament name already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if len(user_guests) != 7:
            return Response({'error': 'There must be 7 guests'}, status=status.HTTP_400_BAD_REQUEST)

        if user in user_guests:
            return Response({'error': 'You cannot invite yourself'}, status=status.HTTP_400_BAD_REQUEST)
        #guest must be unique and valid users
        for u in user_guests:
            if not User.objects.filter(username=u).exists():
                return Response({'error': f'User {u} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            if user_guests.count(u) > 1:
                return Response({'error': f'User {u} is duplicated'}, status=status.HTTP_400_BAD_REQUEST)

        tournament = Tournament.objects.create(
            tournamet_name=tournament_name,
            userHost=user,
            userGuest0=user_guests[0],
            userGuest1=user_guests[1],
            userGuest2=user_guests[2],
            userGuest3=user_guests[3],
            userGuest4=user_guests[4],
            userGuest5=user_guests[5],
            userGuest6=user_guests[6]
        )

        for u in user_guests:
            TournamentInvite.objects.create(
                userSender=user,
                userReceiver=u,
                tournament=tournament
            )

        return Response({'success': 'Tournament created'}, status=status.HTTP_201_CREATED)
        
class tournamentInviteAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_sender = request.data.get('user_sender')
        user_receiver = request.user
        action = request.data.get('action')

        if not TournamentInvite.objects.filter(userSender=user_sender, userReceiver=user_receiver).exists():
            return Response({'error': 'Request does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'reject':
            TournamentInvite.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()
            return Response({'success': 'Tournament invite rejected'}, status=status.HTTP_200_OK)
        
        tournament = TournamentInvite.objects.get(userSender=user_sender, userReceiver=user_receiver).tournament
        tournament.accepted_invites += 1
        tournament.save()
        TournamentInvite.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()

        return Response({'success': 'Tournament invite accepted'}, status=status.HTTP_200_OK)

class TournamentInviteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tournament_invites = TournamentInvite.objects.filter(userReceiver=user)
        return Response({
            'tournament_invites': [t.userSender.username for t in tournament_invites]
        }, status=status.HTTP_200_OK)

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
        user = request.data.get('user')
        game_type = request.data.get('game_type')
        match_results = MatchResult.objects.filter(game_type=game_type, user1=user)
        match_results2 = MatchResult.objects.filter(game_type=game_type, user2=user)
        match_results = match_results.union(match_results2)
        return Response({
            'match_results': [f'{m.user1.username} vs {m.user2.username} - {m.winner.username} won at {m.date}' for m in match_results]
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
        if wins + losses > 0:
            win_rate = wins / (wins + losses)
            bar_px = int(win_rate * 600)
        else:
            win_rate = 0
            bar_px = 0
        return Response({
            'wins': wins,
            'losses': losses,
            'win_rate': win_rate,
            'bar_size': bar_px
        }, status=status.HTTP_200_OK)

class UsersListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.GET.get('user')
        if user:
            user = User.objects.get(username=user)
            user_json = {
                'user': user.username,
                'profile_pic': user.profile_picture,
                'friends': [f.user2.username for f in FriendShip.objects.filter(user1=user)],
                'last_online': user.last_online,
                'time_since_online': int(round((datetime.datetime.now(tz=datetime.timezone.utc) - user.last_online).total_seconds(), 0)),
                'online': (datetime.datetime.now(tz=datetime.timezone.utc) - user.last_online).total_seconds() < 60
            }
            user_json['friends'].extend([f.user1.username for f in FriendShip.objects.filter(user2=user)])
            return Response({
                'user': user_json
            }, status=status.HTTP_200_OK)
        users = User.objects.all()
        user_json_base = {
            'user': '',
            'friends': [],
            'last_online': '',
            'online': False,
            'time_since_online': ''
        }
        user_jsons = []
        for u in users:
            user_json = user_json_base.copy()
            user_json['user'] = u.username
            user_json['friends'] = [f.user2.username for f in FriendShip.objects.filter(user1=u)]
            user_json['friends'].extend([f.user1.username for f in FriendShip.objects.filter(user2=u)])
            user_json['last_online'] = u.last_online
            time_since_online = datetime.datetime.now(tz=datetime.timezone.utc) - u.last_online
            user_json['online'] = time_since_online.total_seconds() < 60
            user_json['time_since_online'] = time_since_online
            user_jsons.append(user_json)
        return Response({
            'users': user_jsons 
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = User.objects.get(username=request.data.get('user'))
        user.last_online = datetime.datetime.now(tz=datetime.timezone.utc)
        user.save()
        return Response({'success': 'User online status updated'}, status=status.HTTP_200_OK)

