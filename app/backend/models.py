from django.db import models
from django.contrib.auth.models import AbstractUser


class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)


class User(AbstractUser):
    username = models.TextField(unique=True, null=True)
    password = models.TextField(unique=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    is_2fa_enabled = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=64, blank=True, null=True)  # OTP secret
    last_online = models.DateTimeField(auto_now=True)
    language_preference = models.CharField(max_length=2, default='en')
    #profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return self.username

# class Game(models.Model):
#     j1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='j1')
#     j2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='j1')
#     game = models.BinaryField()
#     winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner')

# class FriendListLine(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend')

# for custom jwt blacklist
class BlackListedToken(models.Model):
    token = models.TextField(unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token


class FriendShip(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_friend')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_friend')

    def __str__(self):
        return self.user1.username + ' and ' + self.user2.username

class FriendRequest(models.Model):
    userSender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userSender_friend')
    userReceiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userReceiver_friend')

    def __str__(self):
        return self.userSender.username + ' to ' + self.userReceiver.username

class Tournament(models.Model):
    userHost = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userHost')
    userGuest0 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest0')
    userGuest1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest1')
    userGuest2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest2')
    userGuest3 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest3')
    userGuest4 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest4')
    userGuest5 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest5')
    userGuest6 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userGuest6')

    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner_tournament')
    status = models.CharField(max_length=30)


class TournamentInvite(models.Model):
    userSender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userSender_tournament')
    userReceiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userReceiver_tournament')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

    def __str__(self):
        return self.userSender.username + ' to ' + self.userReceiver.username + ' for ' + self.tournament.id

class MatchResult(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_match')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_match')
    user1_score = models.IntegerField()
    user2_score = models.IntegerField()
    date = models.DateTimeField(auto_now=True)
    game_type = models.CharField(max_length=30)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner_match')

    def __str__(self):
        return self.user1.username + ' vs ' + self.user2.username
