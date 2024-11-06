# Generated by Django 5.1.1 on 2024-11-06 08:10

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_alter_user_otp_secret'),
    ]

    operations = [
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userReceiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userReceiver_friend', to=settings.AUTH_USER_MODEL)),
                ('userSender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userSender_friend', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FriendShip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user1_friend', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user2_friend', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MatchResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user1_score', models.IntegerField()),
                ('user2_score', models.IntegerField()),
                ('date', models.DateTimeField(auto_now=True)),
                ('game_type', models.CharField(max_length=30)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user1_match', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user2_match', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='winner_match', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=30)),
                ('userGuest0', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest0', to=settings.AUTH_USER_MODEL)),
                ('userGuest1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest1', to=settings.AUTH_USER_MODEL)),
                ('userGuest2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest2', to=settings.AUTH_USER_MODEL)),
                ('userGuest3', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest3', to=settings.AUTH_USER_MODEL)),
                ('userGuest4', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest4', to=settings.AUTH_USER_MODEL)),
                ('userGuest5', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest5', to=settings.AUTH_USER_MODEL)),
                ('userGuest6', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userGuest6', to=settings.AUTH_USER_MODEL)),
                ('userHost', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userHost', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='winner_tournament', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentInvite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.tournament')),
                ('userReceiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userReceiver_tournament', to=settings.AUTH_USER_MODEL)),
                ('userSender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userSender_tournament', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]