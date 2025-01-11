#view in maps to handle post requests with lat and long query google places api

import json, requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import render
import os
#booking confirmation view 
from django.shortcuts import render, redirect
from django.utils import timezone
from .models import Models
from datetime import datetime

@csrf_exempt
@require_POST

def ev_charging_stations(request):
    data = json.loads(request.body)
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    #verifying coordinates are provided
    if latitude is None or longitude is None:
        return JsonResponse({'error': 'Missing latitude or longitude'}, status=400)
    
    #consutrcting places API url and params
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'key': os.getenv('GOOGLE_MAPS_API_KEY'),
        'location': f"{latitude},{longitude}",
        'radius': 5000, #in meters
        'type': 'ev_charging_station'
    }
    
    #query google places api
    response = requests.get(url, params=params)
    places_data = response.json()
    
    #return results to client
    return JsonResponse(places_data)

def ev_map_page(request):
    return render(request, 'map/ev_map.html')


def confirm_booking(request):
    if request.method == 'POST':
        selected_time = request.POST.get('booking_time')
        booking_time = timezone.make_aware(datetime.strptime(selected_time, '%Y-%m-%d %H:%M'))
        booking_count, created = Models.objects.get_or_create(booking_time=booking_time)
        booking_count.count += 1
        booking_count.save()
        
        return redirect('booking_success')
    else:
        #get req handling if nec
        return render(request, 'confirm_booking.html')
    
