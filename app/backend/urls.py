# urls.py
from django.urls import path
from . import views

from django.contrib import admin


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
]
