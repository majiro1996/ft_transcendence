# views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Person
from .forms import MyModelForm

def index(request):
    if request.method == "POST":
        form = MyModelForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
    else:
        form = MyModelForm()

    data = Person.objects.all()
    return render(request, 'index.html', {'form': form, 'data': data})
def delete(request, id):
	data = Person.objects.get(id=id)
	data.delete()
	return redirect('index')




from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import SignUpSerializer, JWTSerializer, TwoFactorSetupSerializer, TwoFactorVerifySerializer

class SignUpView(generics.CreateAPIView):
    serializer_class = SignUpSerializer

class LoginView(generics.GenericAPIView):
    serializer_class = JWTSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class TwoFactorSetupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorSetupSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class TwoFactorVerifyView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
