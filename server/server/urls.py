"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include 
from maps import views as map_views

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('account/', include("chargeSmart.urls")),
    path('', include('map.urls')),
    path('record_usage/', map_views.record_usage, name='record_usage'),
    path('ev_charging_stations/', map_views.ev_charging_stations, name='ev_charging_stations'),
    path('ev_map_page/', map_views.ev_map_page, name='ev_map_page'),
]
