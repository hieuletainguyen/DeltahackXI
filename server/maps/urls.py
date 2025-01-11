#create a url route in maps app to point to this view

from django.urls import path
from . import views

urlpatterns = [
    path('', views.ev_map_page, name='ev_map_page'),
    path('api/ev-charging-stations/', views.ev_charging_stations, name='ev_charging_stations'),
]

