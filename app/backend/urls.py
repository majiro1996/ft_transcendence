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
	tournamentInviteAcceptView,
	TestUsersAPIView,
	TournamentOptionsView,
	DeleteTournamentView,
	TournamentEndView
)


urlpatterns = [
    
    path('signup/', SignUpAPIViewJWT.as_view(), name='signup'),
    path('login/', LoginAPIViewJWT.as_view(), name='login'),
    path('login-2fa/', Login2fViewJWT.as_view(), name='login-2fa'),
    path('refresh/', RefreshTokenAPIViewJWT.as_view(), name='refresh'),
    path('logout/', LogoutAPIViewJWT.as_view(), name='logout'),
    path('protected/', ProtectedDataAPIViewJWT.as_view(), name='protected'),
    path('profile-settings/', ProfileSettingsView.as_view(), name='profile-settings'),
	
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
    path('tournament-options/', TournamentOptionsView.as_view(), name='tournament-options'),
	path('delete-tournament/', DeleteTournamentView.as_view(), name='delete-tournament'),
	path('start-tournament/', views.StartTournamentView.as_view(), name='start-tournament'),
	path('start-match/', views.TournamentGame.as_view(), name='start-match'),
	path('end-tournament/', TournamentEndView.as_view(), name='end-tournament'),


	path('users/', views.UsersListView.as_view(), name='users'),
	path('user-details', views.UserDetailView.as_view(), name='user-detail'),
	path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),

]
