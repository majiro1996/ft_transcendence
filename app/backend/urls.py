# urls.py
from django.urls import path
from . import views
from .views import SignUpView, LoginView, TwoFactorSetupView, TwoFactorVerifyView

from django.contrib import admin

urlpatterns = [
	path('delete/<int:id>/', views.delete, name='delete'),
	path('test/', views.index, name='test'),
	path('admin/', admin.site.urls),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
]
