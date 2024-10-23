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