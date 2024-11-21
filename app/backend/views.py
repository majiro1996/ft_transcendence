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
from django.contrib.postgres.fields import ArrayField 
from django.db.models import Q
import pyotp
import logging
import json
import datetime
import base64
from PIL import Image
import io

# for custom jwt
from django.contrib.auth import authenticate
from .jwt_utils import create_token, verify, decode_payload
from .models import BlackListedToken
import time
import random

# 
from .models import FriendShip, FriendRequest, Tournament, TournamentInvite, MatchResult

ONLINE_THRESHOLD = 60

User = get_user_model()
logger = logging.getLogger(__name__)

def update_last_online(user: User):
    user.last_online = datetime.datetime.now(tz=datetime.timezone.utc)
    user.save()

#--------------------------------------------#
#custom jwt api views

class SignUpAPIViewJWT(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        #checks if the username is a combination of anon and a number
        if username[:4] == 'anon' and username[4:].isdigit():
            return Response({'error': 'invalid-username'}, status=status.HTTP_400_BAD_REQUEST)

        #checks if username is longer than 16 characters
        if len(username) > 16:
            return Response({'error': 'username-too-long'}, status=status.HTTP_400_BAD_REQUEST)
        
        #checks if password is shorter than 8 characters, doesn't have a number, a capital letter and a special character
        if len(password) < 8 or not any(char.isdigit() for char in password) or not any(char.isupper() for char in password) or not any(not char.isalnum() for char in password) or not any(char.islower() for char in password):
            return Response({'error': 'invalid-password'}, status=status.HTTP_400_BAD_REQUEST)
        
        #checks if email is valid
        if not '@' in email or not '.' in email:
            return Response({'error': 'invalid-email'}, status=status.HTTP_400_BAD_REQUEST)
    
        if User.objects.filter(username=username).exists():
            return Response({'error': 'user-exists-alert'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'email-exists-alert'}, status=status.HTTP_400_BAD_REQUEST)
        
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
            if user.deleted:
                return Response({'error': 'deleted-account'}, status=status.HTTP_400_BAD_REQUEST)

            if user.is_2fa_enabled:
                user.otp_secret = pyotp.random_base32()
                user.save()
                totp = pyotp.TOTP(user.otp_secret, interval=300)
                token = totp.now()
                subject = 'Login 2fa code'
                message = f'Your 2fa code is {token}'
                from_email = settings.EMAIL_HOST_USER
                send_mail(subject, message, from_email, [user.email])
                return Response({'success': '2fa-required'}, status=status.HTTP_200_OK)
            else:
                access_token = create_token(user.id, 'access')
                refresh_token = create_token(user.id, 'refresh')
                update_last_online(user)
                return Response({
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'invalid-credentials-alert'}, status=status.HTTP_400_BAD_REQUEST)


class Login2fViewJWT(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'Invalid-username'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.otp_secret:
            return Response({'error': 'OTP-not-set'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.otp_secret, interval=300)
        is_valid = totp.verify(otp, valid_window=2)

        if not is_valid:
            return Response({'error': 'Invalid-OTP'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = create_token(user.id, 'access')
        refresh_token = create_token(user.id, 'refresh')

        update_last_online(user)
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

        try:
            update_last_online(User.objects.get(id=user_id))
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'token': token}, status=status.HTTP_200_OK)


class LogoutAPIViewJWT(APIView):
     def post(self, request):
        permission_classes = [IsAuthenticated]
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        refresh_token = request.data.get('refresh_token')

        if BlackListedToken.objects.filter(token=token).exists():
            return Response({'error': 'Already-logged-out'}, status=status.HTTP_400_BAD_REQUEST)

        if refresh_token:
            if BlackListedToken.objects.filter(token=refresh_token).exists():
                return Response({'error': 'Already-logged-out'}, status=status.HTTP_400_BAD_REQUEST)
            BlackListedToken.objects.create(token=refresh_token)

        BlackListedToken.objects.create(token=token)
        return Response({'success': 'Successfully-logged-out'}, status=status.HTTP_200_OK)



# Get protected data test api view with JWT
class ProtectedDataAPIViewJWT(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not User.objects.filter(username=user.username).exists():
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'You are accessing protected data with JWT'}, status=status.HTTP_200_OK)


# Profile settings api view
class ProfileSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        update_last_online(user)
        return Response({
            'username': user.username,
            'email': user.email,
            '2fa_enabled': user.is_2fa_enabled,
            'language_preference': user.language_preference
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        data = request.data

        if 'delete_account' in data:
            user.deleted = True
            user.save()
            return Response({'success': 'Account-deleted-succes'}, status=status.HTTP_200_OK)
        if 'anonymize_account' in data:
            user.deleted = True
            user.username = 'anon'+str(user.id)
            user.email = 'anon'+str(user.id)+'@anon.com'
            user.profile_picture = None
            user.save()
            return Response({'success': 'Account-anonymized-succes'}, status=status.HTTP_200_OK)
        # Check if new username or email already exists
        if 'username' in data and User.objects.filter(username=data['username']).exclude(id=user.id).exists():
            return Response({'error': 'user-exists-alert'}, status=status.HTTP_400_BAD_REQUEST)
        if 'email' in data and User.objects.filter(email=data['email']).exclude(id=user.id).exists():
            return Response({'error': 'email-exists-alert'}, status=status.HTTP_400_BAD_REQUEST)
        if 'language_preference' in data and data['language_preference'] not in ['en', 'es', 'fr']:
            return Response({'error': 'Invalid-language-preference'}, status=status.HTTP_400_BAD_REQUEST)

        if 'username' in data and data['username'][:4] == 'anon' and data['username'][4:].isdigit():
            return Response({'error': 'invalid-username'}, status=status.HTTP_400_BAD_REQUEST)
        if 'username' in data and len(data['username']) > 16:
            return Response({'error': 'username-too-long'}, status=status.HTTP_400_BAD_REQUEST)
        if 'password' in data and (len(data['password']) < 8 or not any(char.isdigit() for char in data['password']) or not any(char.isupper() for char in data['password']) or not any(not char.isalnum() for char in data['password']) or not any(char.islower() for char in data['password'])):
            return Response({'error': 'invalid-password'}, status=status.HTTP_400_BAD_REQUEST)
        if 'email' in data and (not '@' in data['email'] or not '.' in data['email']):
            return Response({'error': 'invalid-email'}, status=status.HTTP_400_BAD_REQUEST)

        # Update user fields if they are provided in the request
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if '2fa_enabled' in data:
            user.is_2fa_enabled = data['2fa_enabled']
        if 'language_preference' in data:
            user.language_preference = data['language_preference']
        if 'password' in data:
            user.set_password(data['password'])

        user.save()

        # Create new tokens for the user
        access_token = create_token(user.id, 'access')
        refresh_token = create_token(user.id, 'refresh')

        update_last_online(user)

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'success': 'Profile-updated'
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        if (request.user.is_authenticated and request.data.get('profile-picture')):
            picture = base64.b64encode(request.data.get('profile-picture').read())
            pil_image = Image.open(io.BytesIO(base64.b64decode(picture)))
            width, height = pil_image.size
            if len(picture) > 8000000:
                return Response({'error': 'file-size'}, status=status.HTTP_400_BAD_REQUEST)
            if pil_image.format not in ['JPEG', 'PNG']:
                return Response({'error': 'file-type'}, status=status.HTTP_400_BAD_REQUEST)
            if width > 500 or height > 500:
                return Response({'error': 'file-dimensions'}, status=status.HTTP_400_BAD_REQUEST)
            user = request.user
            user.profile_picture = picture.decode('utf-8')
            user.save()
            update_last_online(user)
            return Response({'success': 'pic-updated'}, status=status.HTTP_200_OK)
        if not request.data.get('profile-picture'):
            user = request.user
            user.profile_picture = None
            user.save()
            update_last_online(user)
            return Response({'success': 'pic-removed'}, status=status.HTTP_200_OK)
        update_last_online(user)
        return Response({'error': 'Invalid-request'}, status=status.HTTP_400_BAD_REQUEST)

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_sender = request.user
            user_receiver = User.objects.get(username=request.data.get('user_receiver'))
        except User.DoesNotExist:
            return Response({'error': 'Invalid-user'}, status=status.HTTP_400_BAD_REQUEST)

        update_last_online(user_sender)
        if user_sender != request.user:
            return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

        if user_sender == user_receiver:
            return Response({'error': 'self-request'}, status=status.HTTP_400_BAD_REQUEST)

        if FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).exists():
            return Response({'error': 'request-sent'}, status=status.HTTP_400_BAD_REQUEST)

        if FriendShip.objects.filter(user1=user_sender, user2=user_receiver).exists():
            return Response({'error': 'alredy-friends'}, status=status.HTTP_400_BAD_REQUEST)

        FriendRequest.objects.create(userSender=user_sender, userReceiver=user_receiver)
        return Response({'success': 'request-sent-ok'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        user = request.user
        try:
            friend = User.objects.get(username=request.data.get('user'))
        except User.DoesNotExist:
            return Response({'error': 'Invalid-user'}, status=status.HTTP_400_BAD_REQUEST)
        if FriendShip.objects.filter(user1=user, user2=friend).exists():
            FriendShip.objects.filter(user1=user, user2=friend).delete()
            return Response({'success': 'Friendship-deleted'}, status=status.HTTP_200_OK)
        elif FriendShip.objects.filter(user2=user, user1=friend).exists():
            FriendShip.objects.filter(user2=user, user1=friend).delete()
            return Response({'success': 'Friendship-deleted'}, status=status.HTTP_200_OK)
        return Response({'error': 'Friendship-does-not-exist'}, status=status.HTTP_400_BAD_REQUEST)



    
class FriendRequestAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_sender = User.objects.get(username=request.data.get('user_sender'))
        except User.DoesNotExist:
            return Response({'error': 'Invalid-user'}, status=status.HTTP_400_BAD_REQUEST)
        update_last_online(user_sender)
        user_receiver = request.user
        action = request.data.get('action')

        if not FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).exists():
            return Response({'error': 'Request-does-not-exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'reject':
            FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()
            return Response({'success': 'Friend-request-rejected'}, status=status.HTTP_200_OK)

        FriendShip.objects.create(user1=user_sender, user2=user_receiver)
        FriendRequest.objects.filter(userSender=user_sender, userReceiver=user_receiver).delete()

        return Response({'success': 'Friend-request-accepted'}, status=status.HTTP_200_OK)

class FriendRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friend_requests = FriendRequest.objects.filter(userReceiver=user)
        update_last_online(user)
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
        game_type = request.data.get('game_type')

        update_last_online(user)

        if not tournament_name.isalnum() or len(tournament_name) < 1:
            return Response({'error': 'invalid-tournament-name'}, status=status.HTTP_400_BAD_REQUEST)

        if game_type not in ['pong', 'tic-tac-toe']:
            return Response({'error': 'invalid-game-type'}, status=status.HTTP_400_BAD_REQUEST)

        if Tournament.objects.filter(tournament_name=tournament_name).exists():
            return Response({'error': 'tournament-name-taken'}, status=status.HTTP_400_BAD_REQUEST)

        #if there is a tournament of this host witout a winner, return error
        if Tournament.objects.filter(userHost=user, status=1).exists():
            return Response({'error': 'tournament-already-open'}, status=status.HTTP_400_BAD_REQUEST)

        if len(user_guests) != 7 or "" in user_guests or None in user_guests:
            return Response({'error': 'not-enough-players'}, status=status.HTTP_400_BAD_REQUEST)

        if user.username in user_guests:
            return Response({'error': 'self-request'}, status=status.HTTP_400_BAD_REQUEST)
        
        #guest must be unique and valid users
        for u in user_guests:
            if user_guests.count(u) > 1:
                return Response({'error': 'duplicated-user', 'user': u}, status=status.HTTP_400_BAD_REQUEST)

        valid_user_guests = []
        for u in user_guests:
            try:
                valid_user = User.objects.get(username=u)
                valid_user_guests.append(valid_user)
            except User.DoesNotExist:
                return Response({'error': 'user-not-exists', 'user': u}, status=status.HTTP_400_BAD_REQUEST)

        tournament = Tournament.objects.create(
            tournament_name=tournament_name,
            userHost=user,
            game_type=game_type,
            # guests=user_guests
        )
        tournament.guests.set(valid_user_guests)

        for guest in valid_user_guests:
            TournamentInvite.objects.create(userSender=user, userReceiver=guest, tournament=tournament)

        return Response({'success': 'Tournament created'}, status=status.HTTP_201_CREATED)

class GetTournamenReadyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tournament = Tournament.objects.filter(userHost=user, accepted_invites=7, status=0)
        update_last_online(user)
        if not tournament.exists():
            tournament = Tournament.objects.filter(userHost=user, status=0).filter(Q(accepted_invites__lt=7))
        if not tournament.exists():
            return Response({'error': 'no-tournament'}, status=status.HTTP_400_BAD_REQUEST)

        tournament_instance = tournament.first()
        guests_usernames = [guest.username for guest in tournament_instance.guests.all()]
        
        return Response({
            'tournament': tournament_instance.tournament_name,
            'game_type': tournament_instance.game_type,
            'guests': guests_usernames,
            'status': tournament_instance.status,
            'accepted_invites': tournament_instance.accepted_invites
        }, status=status.HTTP_200_OK)

        

        
class tournamentInviteAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tournament_name = request.data.get('tournament_name')
        # user_sender = request.data.get('user_sender')
        user_receiver = request.user
        update_last_online(user_receiver)
        action = request.data.get('action')

        try:
            tournamentObj = Tournament.objects.get(tournament_name=tournament_name)
        except Tournament.DoesNotExist:
            return Response({'error': 'Invalid-tournament'}, status=status.HTTP_400_BAD_REQUEST)

        if not TournamentInvite.objects.filter(tournament=tournamentObj, userReceiver=user_receiver).exists():
            return Response({'error': 'no-invite'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'reject':
            TournamentInvite.objects.filter(tournament=tournamentObj, userReceiver=user_receiver).delete()
            return Response({'success': 'Tournament invite rejected'}, status=status.HTTP_200_OK)

        tournamentObj.save()
        try:
            invite = TournamentInvite.objects.get(tournament=tournamentObj, userReceiver=user_receiver)
            invite.accepted = True
            invite.save()
            return Response({'success': 'Tournament invite accepted'}, status=status.HTTP_200_OK)
        except TournamentInvite.DoesNotExist:
            return Response({'error': 'no-invite'}, status=status.HTTP_400_BAD_REQUEST)

class GetTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        update_last_online(user)
        tournament_invites = TournamentInvite.objects.filter(userReceiver=user, accepted=False)
        tournaments = Tournament.objects.filter(Q(userHost=user) | Q(guests=user), status__in=[0, 1])

        if Tournament.objects.filter(userHost=user, status  = 0).exists():
            return Response({'success': 'ready-tournament'}, status=status.HTTP_200_OK)
        if Tournament.objects.filter(userHost=user, status  = 1).exists():
            return Response({'success': 'ongoing-tournament'}, status=status.HTTP_200_OK)

        invites_data = []
        for invite in tournament_invites:
            if invite.accepted:
                continue
            invites_data.append({
                'host': invite.userSender.username,
                'tournament_name': invite.tournament.tournament_name,
                'profile_pic': invite.userSender.profile_picture
            })

        tournaments_data = []
        for tournament in tournaments:
            if tournament in [invite.tournament for invite in tournament_invites]:
                continue
            tournaments_data.append({
                'host': tournament.userHost.username,
                'tournament_name': tournament.tournament_name,
                'profile_pic': tournament.userHost.profile_picture
            })

        return Response({
            'user': {
                'invites': invites_data,
                'tournaments': tournaments_data
            }
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
        update_last_online(User.objects.get(username=user1))
        update_last_online(User.objects.get(username=user2))
        return Response({'success': 'Match result recorded'}, status=status.HTTP_201_CREATED)


class GetMatchResultsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.data.get('user')
        game_type = request.data.get('game_type')
        match_results = MatchResult.objects.filter(game_type=game_type, user1=user)
        match_results2 = MatchResult.objects.filter(game_type=game_type, user2=user)
        match_results = match_results.union(match_results2)
        update_last_online(User.objects.get(username=user))
        return Response({
            'match_results': [f'{m.user1.username} vs {m.user2.username} - {m.winner.username} won at {m.date}' for m in match_results]
        }, status=status.HTTP_200_OK)
        

class GameStatsView(APIView):
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
        update_last_online(User.objects.get(username=user))
        return Response({
            'wins': wins,
            'losses': losses,
            'win_rate': win_rate,
            'bar_size': bar_px
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        try:
            user1 = User.objects.get(username=request.data.get('user1'))
            user2 = User.objects.get(username=request.data.get('user2'))
            tournament = Tournament.objects.get(tournament_name=request.data.get('tournament_name'))
            if request.data.get("winner") == "tie" and request.data.get("game_type") == "tic-tac-toe":
                winner = None
            else:
                winner = User.objects.get(username=request.data.get('winner'))
            if winner is not None and winner not in [user1, user2]:
                return Response({'error': 'Invalid winner'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': f'Invalid user {request.data.get("user1")} - {request.data.get("user2")}'}, status=status.HTTP_400_BAD_REQUEST)
        except Tournament.DoesNotExist:
            return Response({'error': f'Invalid tournament {request.data.get("tournament_name")}'}, status=status.HTTP_400_BAD_REQUEST)
        match = MatchResult.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1), tournament=tournament, pending=True)[0]
        match.winner = winner
        match.pending = False
        match.user1_score = request.data.get('user1_score')
        match.user2_score = request.data.get('user2_score')
        match.save()
        match = MatchResult.objects.filter(Q(user1=None) | Q(user2=None), tournament=tournament, pending=True).order_by('creation_date')[0]
        if match.user1 is None:
            match.user1 = winner
        else:
            match.user2 = winner
        match.save()
        last_match = MatchResult.objects.filter(tournament=tournament, pending=True).count()
        if last_match == 0:
            tournament.status = 2
            tournament.save()
        update_last_online(User.objects.get(username=user1))
        update_last_online(User.objects.get(username=user2))
        return Response({'success': 'Match result recorded'}, status=status.HTTP_201_CREATED)
    
    def put(self, request):
        try:
            tournament = Tournament.objects.get(tournament_name=request.data.get('tournament_name'))
            matches = MatchResult.objects.filter(tournament=tournament).order_by('creation_date')
        except Tournament.DoesNotExist:
            return Response({'error': f'Invalid tournament {request.data.get("tournament_name")}'}, status=status.HTTP_400_BAD_REQUEST)
        except MatchResult.DoesNotExist:
            return Response({'error': 'No matches found'}, status=status.HTTP_400_BAD_REQUEST)
        matches_json = []
        for match in matches:
            match_obj = {
                'user1': None if match.user1 is None else match.user1.username,
                'user2': None if match.user2 is None else match.user2.username,
                'winner': None if match.winner is None else match.winner.username,
                'game_type': match.game_type,
                'pending': match.pending,
                'user1_score': match.user1_score,
                'user2_score': match.user2_score,
                'creation_date': match.creation_date
            }
            matches_json.append(match_obj)
        return Response({
            'matches': matches_json
        }, status=status.HTTP_200_OK)


class UsersListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.GET.get('user')
        if not user and not request.user.is_authenticated:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        elif not user:
            user = request.user

        try:
            User.objects.get(username=user)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        if user:
            user = User.objects.get(username=user)
            user_json = {
                'user': user.username,
                'profile_pic': user.profile_picture,
                'friends': [{"user": f.user2.username, "profile_pic": f.user2.profile_picture, "online": (datetime.datetime.now(tz=datetime.timezone.utc) - f.user2.last_online).total_seconds() < ONLINE_THRESHOLD} for f in FriendShip.objects.filter(user1=user)],
                'requests': [],
                'last_online': user.last_online,
                'time_since_online': int(round((datetime.datetime.now(tz=datetime.timezone.utc) - user.last_online).total_seconds(), 0)),
                'online': (datetime.datetime.now(tz=datetime.timezone.utc) - user.last_online).total_seconds() < ONLINE_THRESHOLD,
                'deleted': user.deleted,
                'history': [],
                'game_stats': {
                    'pong': {
                        'wins': 0,
                        'losses': 0,
                        'win_rate': 0,
                        'bar_size': 0
                    },
                    'tic-tac-toe': {
                        'wins': 0,
                        'losses': 0,
                        'win_rate': 0,
                        'bar_size': 0
                    }
                }
            }
            user_json['friends'].extend([{"user": f.user1.username, "profile_pic": f.user1.profile_picture, "online": (datetime.datetime.now(tz=datetime.timezone.utc) - f.user1.last_online).total_seconds() < ONLINE_THRESHOLD} for f in FriendShip.objects.filter(user2=user)])
            if user == request.user and request.user.is_authenticated:
                user_json['requests'] = [{"user": f.userSender.username, "profile_pic": f.userSender.profile_picture, "online": (datetime.datetime.now(tz=datetime.timezone.utc) - f.userSender.last_online).total_seconds() < ONLINE_THRESHOLD} for f in FriendRequest.objects.filter(userReceiver=user)]
            match_results = []
            for match in MatchResult.objects.filter(Q(user1=user) | Q(user2=user)):
                if match.winner is None:
                    continue
                else:
                    match_results.append({
                        'user1': match.user1.username,
                        'user2': match.user2.username,
                        'winner': match.winner.username,
                        'game': match.game_type.capitalize()
                    })
            user_json['history'] = match_results
            user_json['history'] = user_json['history'][-5:]
            user_json['history'] = user_json['history'][::-1]
            total_pong = MatchResult.objects.filter(Q(user1=user) | Q(user2=user), game_type='pong').count()
            wins_pong = MatchResult.objects.filter(game_type='pong', winner=user).count()
            losses_pong = total_pong - wins_pong
            user_json['game_stats']['pong'] = {
                'wins': wins_pong,
                'losses': losses_pong,
                'win_rate': round((wins_pong / total_pong * 100), 2) if total_pong > 0 else 0,
                'bar_size': int((wins_pong / total_pong) * 600) if total_pong > 0 else 0
            }
            total_ttt = MatchResult.objects.filter(Q(user1=user) | Q(user2=user), game_type='tic-tac-toe').count()
            wins_ttt = MatchResult.objects.filter(game_type='tic-tac-toe', winner=user).count()
            losses_ttt = MatchResult.objects.filter(Q(user1=user) | Q(user2=user), game_type='tic-tac-toe').exclude(Q(winner=user) | Q(winner=None)).count()
            ties_ttt = MatchResult.objects.filter(Q(user1=user) | Q(user2=user), game_type='tic-tac-toe', winner=None).count()
            user_json['game_stats']['tic-tac-toe'] = {
                'wins': wins_ttt,
                'losses': losses_ttt,
                'ties': ties_ttt,
                'win_rate': round(wins_ttt / total_ttt * 100, 2) if total_ttt > 0 else 0,
                'bar_size': int((wins_ttt / total_ttt) * 600) if total_ttt > 0 else 0
            }
            return Response({
                'user': user_json
            }, status=status.HTTP_200_OK)
        return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all()
        user_data = []
        for user in users:
            total_wins = MatchResult.objects.filter(winner=user).count()
            user_data.append({
                'rank': 0,
                'user': user.username,
                'wins': total_wins,
            })
        user_data = sorted(user_data, key=lambda x: x['wins'], reverse=True)
        for i, user in enumerate(user_data):
            user['rank'] = i + 1
        return Response({
            'leaderboard': user_data
        }, status=status.HTTP_200_OK)


class TournamentOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        update_last_online(user)
        tournaments = Tournament.objects.filter(userHost=user, status=0)
        if not tournaments.exists():
            return Response({'error': 'No-tournaments'}, status=status.HTTP_400_BAD_REQUEST)
        
        tournament = tournaments.first()
        players = []
        accepted_invites = TournamentInvite.objects.filter(tournament=tournament, accepted=True).values_list('userReceiver', flat=True)
        accepted_guests = User.objects.filter(id__in=accepted_invites)
        for i, guest in enumerate(tournament.guests.all()):
            players.append({
                'username': guest.username,
                'profile_pic': guest.profile_picture,
                'status': 'confirmed' if guest in accepted_guests else 'pending'
            })

        return Response({
            'tournament_name': tournament.tournament_name,
            'game_type': tournament.game_type,
            'players': players
        }, status=status.HTTP_200_OK)


class DeleteTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        update_last_online(user)
        tournament_name = request.data.get('tournament_name')
        try:
            tournament = Tournament.objects.get(tournament_name=tournament_name)
        except Tournament.DoesNotExist:
            return Response({'error': 'Invalid-tournament'}, status=status.HTTP_400_BAD_REQUEST)
        if tournament.userHost != user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        TournamentInvite.objects.filter(tournament=tournament).delete()   
        tournament.delete()
        return Response({'success': 'Tournament-deleted'}, status=status.HTTP_200_OK)

class StartTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        update_last_online(user)
        tournaments = Tournament.objects.filter(userHost=user, status__in=[0, 1])
        if not tournaments.exists():
            return Response({'error': 'No-tournaments'}, status=status.HTTP_400_BAD_REQUEST)
        tournament = tournaments.first()

        players = []
        for guest in tournament.guests.all():
            players.append(guest)
        players.append(user)

        if tournament.status == 0:
            # create the first 4 matches with random opponents
            random.shuffle(players)
            for i in range(0, 4):
                MatchResult.objects.create(
                    user1=players[i],
                    user2=players[i+4],
                    game_type=tournament.game_type,
                    winner=None,
                    user1_score=0,
                    user2_score=0,
                    pending=True,
                    tournament=tournament
                )
            for i in range(4, 7):
                MatchResult.objects.create(
                    user1=None,
                    user2=None,
                    game_type=tournament.game_type,
                    winner=None,
                    user1_score=0,
                    user2_score=0,
                    pending=True,
                    tournament=tournament,
                    later=True
                )
            tournament.status = 1
            tournament.save()

        players_json = []
        for match in MatchResult.objects.filter(tournament=tournament).order_by('creation_date'):
            if match is not None and match.user1:
                players_json.append(match.user1.username)
            if match is not None and match.user2:
                players_json.append(match.user2.username)

        pending_matches = MatchResult.objects.filter(later=True, tournament=tournament).order_by('creation_date')
        semifinals = []
        final = []
        null_players = 0
        for match in pending_matches:
            if match.user1 is None:
                null_players += 1
            if match.user2 is None:
                null_players += 1
        
        if null_players == 6:
            semifinals = [None, None, None, None]
            final = [None, None]
        elif null_players == 5:
            semifinals = [pending_matches[0].user1.username, None, None, None]
            final = [None, None]
        elif null_players == 4:
            semifinals = [pending_matches[0].user1.username, pending_matches[0].user2.username, None, None]
            final = [None, None]
        elif null_players == 3:
            semifinals = [pending_matches[0].user1.username, pending_matches[0].user2.username, pending_matches[1].user1.username, None]
            final = [None, None]
        elif null_players == 2:
            semifinals = [pending_matches[0].user1.username, pending_matches[0].user2.username, pending_matches[1].user1.username, pending_matches[1].user2.username]
            final = [None, None]
        elif null_players == 1:
            semifinals = [pending_matches[0].user1.username, pending_matches[0].user2.username, pending_matches[1].user1.username, pending_matches[1].user2.username]
            final = [pending_matches[2].user1.username, None]
        elif null_players == 0:
            semifinals = [pending_matches[0].user1.username, pending_matches[0].user2.username, pending_matches[1].user1.username, pending_matches[1].user2.username]
            final = [pending_matches[2].user1.username, pending_matches[2].user2.username]
        
        all_matches = MatchResult.objects.filter(tournament=tournament).order_by('creation_date')
        matches = []
        for match in all_matches:
            matches.append({
                'user1': match.user1.username if match.user1 else None,
                'user2': match.user2.username if match.user2 else None,
                'winner': match.winner.username if match.winner else None,
            })

        return Response({
            'tournament_name': tournament.tournament_name,
            'game_type': tournament.game_type,
            'players': players_json,
            'semifinals': semifinals,
            'final': final,
            'success': 'Tournament-started',
            'matches': matches,
            'tournament_status': tournament.status
        }, status=status.HTTP_200_OK)


# create test users api view #remove
class TestUsersAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if(User.objects.filter(username='user1').exists()):
            return Response({'error': 'Test users already created'}, status=status.HTTP_400_BAD_REQUEST)

        for i in range(1, 11):
            user = User.objects.create_user(
                username=f'user{i}',
                password=f'pass{i}',
                email=f'user{i}@test.42'
            )
            user.save()
        return Response({'success': 'Test users created'}, status=status.HTTP_201_CREATED)

class TournamentGame(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tournament_name = request.data.get('tournament_name')
        
        try:
            tournament = Tournament.objects.get(tournament_name=tournament_name, userHost=request.user, status=1)
        except Tournament.DoesNotExist:
            return Response({'error': 'bunkont'}, status=status.HTTP_400_BAD_REQUEST)
        
        next_match = MatchResult.objects.filter(tournament=tournament, pending=True).first()

        if next_match is None:
            return Response({'error': 'something-went-wrong'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'user1': next_match.user1.username,
            'user2': next_match.user2.username
        }, status=status.HTTP_200_OK)

class TournamentEndView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tournament_name = request.data.get('tournament_name')
        winner = tournament
        try:
            tournament = Tournament.objects.get(tournament_name=tournament_name, userHost=request.user, status=1)
        except Tournament.DoesNotExist:
            return Response({'error': 'bunkont'}, status=status.HTTP_400_BAD_REQUEST)
        
        tournament.status = 2
        tournament.save()

        return Response({'success': 'Tournament-ended'}, status=status.HTTP_200_OK)
