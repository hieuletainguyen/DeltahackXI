from django.urls import path
from . import views
from django.shortcuts import render

urlpatterns = [
    path('', views.ev_map_page, name='ev_map_page'),
    path('api/ev-charging-stations/', views.ev_charging_stations, name='ev_charging_stations'),
    path('confirm_booking/', views.confirm_booking, name='confirm_booking'),
    path('booking_success/', views.booking_success, name='booking_success'),
]

# filepath: /server/map/views.py    
def booking_success(request):
    return render(request, 'map/booking_success.html')
