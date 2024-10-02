import pyotp
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

User = get_user_model()

class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class JWTSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = User.objects.filter(username=data['username']).first()
        if user and user.check_password(data['password']):
            if user.is_2fa_enabled:
                return {
                    'message': '2FA required',
                    '2fa_required': True
                }
            refresh = RefreshToken.for_user(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        raise serializers.ValidationError('Invalid credentials')

class TwoFactorSetupSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get('email')
        user = User.objects.get(email=email)
        if user.is_2fa_enabled:
            raise serializers.ValidationError("2FA is already enabled.")
        if not user.otp_secret:
            user.otp_secret = pyotp.random_base32()  # Generate OTP secret
            user.save()

        # Generate OTP and send via email
        totp = pyotp.TOTP(user.otp_secret)
        otp_code = totp.now()
        send_mail(
            'Your OTP Code',
            f'Your OTP code is {otp_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False
        )
        return {'message': 'OTP sent to your email'}

class TwoFactorVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')

        user = User.objects.get(email=email)
        totp = pyotp.TOTP(user.otp_secret)

        if not totp.verify(otp):
            raise serializers.ValidationError("Invalid OTP")
        
        user.is_2fa_enabled = True
        user.save()
        return {'message': '2FA enabled successfully'}
