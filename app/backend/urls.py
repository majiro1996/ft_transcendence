# urls.py
from django.urls import path
from . import views
from django.contrib import admin

from .views import (
	LoginAPIViewJWT,
    RefreshTokenAPIViewJWT,
    LogoutAPIViewJWT,
    ProtectedDataAPIViewJWT,
    SignUpAPIViewJWT,
    Login2fViewJWT,
    ProfileSettingsView,
	GameStatsView,
	GetMatchResultsView,
	SetMatchResultView,
	CreateTournamentView,
	FriendRequestView,
	FriendRequestAcceptView,
	GetTournamenReadyView,
	GetTournamentView,
	tournamentInviteAcceptView
)


urlpatterns = [
    
	### API jwt ###
    path('signup/', SignUpAPIViewJWT.as_view(), name='signup'),
    path('login/', LoginAPIViewJWT.as_view(), name='login'),
    path('login-2fa/', Login2fViewJWT.as_view(), name='login-2fa'),
    path('refresh/', RefreshTokenAPIViewJWT.as_view(), name='refresh'),
    path('logout/', LogoutAPIViewJWT.as_view(), name='logout'),
    path('protected/', ProtectedDataAPIViewJWT.as_view(), name='protected'),
    path('profile-settings/', ProfileSettingsView.as_view(), name='profile-settings'),
	# path('profile/', ProfileView.as_view(), name='profile'),
	
	path('friend-request/', FriendRequestView.as_view(), name='friend-request'),
	path('friend-request-accept/', FriendRequestAcceptView.as_view(), name='friend-request-accept'),
	path('friend-request-list/', views.FriendRequestListView.as_view(), name='friend-request-list'),
	path('game-stats/', GameStatsView.as_view(), name='game-stats'),
	path('match-results/', GetMatchResultsView.as_view(), name='match-results'),
	path('set-match-result/', SetMatchResultView.as_view(), name='set-match-result'),
	
	path('create-tournament/', CreateTournamentView.as_view(), name='create-tournament'),
	path('get-tournament-ready/', GetTournamenReadyView.as_view(), name='get-tournament-ready'),
	path('tournaments/', GetTournamentView.as_view(), name='tournaments'),
	path('tournament-invite-accept/', tournamentInviteAcceptView.as_view(), name='tournament-invite-accept'),
    
	path('users/', views.UsersListView.as_view(), name='users'),
]
