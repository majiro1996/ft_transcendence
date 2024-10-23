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
)


urlpatterns = [
	path('admin/', admin.site.urls),
	path('', views.index, name='index'),
	path('styles/', views.base_styles, name='styles'),
	path('bootstrap/', views.bootstrap_styles, name='bootstrap'),
	path('bootstrapjs/', views.bootstrap_js, name='bootstrapjs'),
	path('styles/font/', views.font_base, name='font'),
	path('styles/font_bold/', views.font_bold, name='fontbold'),
	path('logo/', views.logo, name='logo'),
	path('bg_landing/', views.bg_video, name='bg_landing'),
    
    ### API ###
	# path('register/', RegisterView.as_view(), name='register'),
	# path('login/', LoginView.as_view(), name='login'),
    # path('login-2fa/', Login2fView.as_view(), name='login-2fa'),
	# path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
	# path('logout/', LogoutView.as_view(), name='logout'),
	# path('token-refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	# path('protected-endpoint/', ProtectedView.as_view(), name='protected'),
    
	### API jwt ###
    path('signup/', SignUpAPIViewJWT.as_view(), name='signup'),
    path('login/', LoginAPIViewJWT.as_view(), name='login'),
    path('login-2fa/', Login2fViewJWT.as_view(), name='login-2fa'),
    path('refresh/', RefreshTokenAPIViewJWT.as_view(), name='refresh'),
    path('logout/', LogoutAPIViewJWT.as_view(), name='logout'),
    path('protected/', ProtectedDataAPIViewJWT.as_view(), name='protected'),
    path('profile-settings/', ProfileSettingsView.as_view(), name='profile'),
    
]
