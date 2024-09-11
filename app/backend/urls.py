# urls.py
from django.urls import path
from . import views

from django.contrib import admin

urlpatterns = [
	path('delete/<int:id>/', views.delete, name='delete'),
	path('test/', views.index, name='test'),
	path('admin/', admin.site.urls),
]
