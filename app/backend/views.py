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
