from django.db import models
from django.contrib.auth.models import AbstractUser


class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_2fa_enabled = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=16, blank=True, null=True)  # OTP secret

    def __str__(self):
        return self.username