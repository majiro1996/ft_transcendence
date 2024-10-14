# urls.py
from django.urls import path
from . import views
from django.contrib import admin
from .views import RegisterView, LoginView, LogoutView, ProtectedView, Login2fView, TwoFactorVerifyView
from rest_framework_simplejwt.views import TokenRefreshView


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
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', LoginView.as_view(), name='login'),
    path('login-2fa/', Login2fView.as_view(), name='login-2fa'),
	path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
	path('logout/', LogoutView.as_view(), name='logout'),
	path('token-refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('protected-endpoint/', ProtectedView.as_view(), name='protected'),
    
]
