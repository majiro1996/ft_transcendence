# views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse, FileResponse
from wsgiref.util import FileWrapper


def index(request):
	return render(request, 'html/index.html')

def base_styles(request):
	f = open('frontend/css/styles.css', 'r')
	return HttpResponse(f.read(), content_type='text/css')

def bootstrap_styles(request):
	f = open('frontend/bootstrap/css/bootstrap.min.css', 'r')
	return HttpResponse(f.read(), content_type='text/css')

def bootstrap_js(request):
	f = open('frontend/bootstrap/js/bootstrap.min.js', 'r')
	return HttpResponse(f.read(), content_type='text/javascript')


def font_base(request):
	f = open('frontend/media/fonts/JetBrainsMono-Regular.woff2', 'rb')
	return HttpResponse(f.read(), content_type='file/woff2')


def font_bold(request):
	f = open('frontend/media/fonts/JetBrainsMono-Bold.woff2', 'rb')
	return HttpResponse(f.read(), content_type='file/woff2')

def logo(request):
	f = open('frontend/media/logo.svg', 'r')
	return HttpResponse(f.read(), content_type='image/svg+xml')

def bg_video(request):
	f = open('frontend/media/LANDING_VIDEO.mp4', 'rb')
	return FileResponse(f, content_type='video/mp4')