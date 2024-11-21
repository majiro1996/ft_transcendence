from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


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
    profile_picture = models.TextField(null=True, blank=True)
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.username

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
    tournament_name = models.CharField(max_length=30, unique=True, null=True)
    userHost = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userHost')
    guests = models.ManyToManyField(User, related_name='guests')

    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner_tournament', null=True, blank=True)
    
    STATUS_CHOICES = [
        (0, 'Not Started'),
        (1, 'Ongoing'),
        (2, 'Finished'),
    ]

    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    game_type = models.CharField(max_length=30, default='pong')


class TournamentInvite(models.Model):
    userSender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userSender_tournament')
    userReceiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userReceiver_tournament')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=True)

    def __str__(self):
        return self.userSender.username + ' to ' + self.userReceiver.username + ' for ' + self.tournament.id

class MatchResult(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_match', null=True, blank=True)
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_match', null=True, blank=True)
    user1_score = models.IntegerField()
    user2_score = models.IntegerField()
    date = models.DateTimeField(auto_now=True)
    game_type = models.CharField(max_length=30)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner_match', null=True, blank=True)
    pending = models.BooleanField(default=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True, blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    later = models.BooleanField(default=False)

    def __str__(self):
        return self.user1.username + ' vs ' + self.user2.username
