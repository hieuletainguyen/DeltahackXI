#view in maps to handle post requests with lat and long query google places api

import json, requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import render
from django.utils.dateparse import parse_datetime
from datetime import datetime

# Dummy function to simulate historical multiplier logic
def get_hourly_multiplier(planned_time, station_id=None, threshold=50, surge_multiplier=1.1):
    """
    Dummy implementation for testing: always returns 1.0.
    """
    # In a real scenario, you'd compute based on historical data.
    return 1.0

def calculate_dynamic_price(watt, usage_count, planned_time, station_id=None, base_price_per_watt=0.20):
    """
    Calculate price for a given amount of wattage based on usage count and time.
    This uses dummy historical data for testing purposes.
    """
    # Threshold levels
    LESS_VISITED_THRESHOLD = 10
    MORE_VISITED_THRESHOLD = 50

    multiplier = 1.0

    if usage_count < LESS_VISITED_THRESHOLD:
        multiplier = 0.9
    elif usage_count < MORE_VISITED_THRESHOLD:
        multiplier = 1.0
    else:
        multiplier = 1.2

    # Use dummy hourly multiplier
    time_based_multiplier = get_hourly_multiplier(planned_time, station_id, threshold=50, surge_multiplier=1.1)
    multiplier *= time_based_multiplier

    price_per_watt = base_price_per_watt * multiplier
    total_price = watt * price_per_watt

    return total_price, price_per_watt, multiplier

@csrf_exempt
@require_POST
def record_usage(request):
    try:
        data = json.loads(request.body)
        station_id = data.get('station_id', 'dummy_station')
        planned_time_str = data.get('planned_time')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        watt = float(data.get('watt', 0))

        # Use current time as a dummy planned_time if none provided
        planned_time = parse_datetime(planned_time_str) if planned_time_str else datetime.now()

        # Check required fields
        if not all([station_id, planned_time, latitude, longitude, watt]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Instead of DB usage, simulate usage count
        dummy_usage_count = 15  # You can adjust this dummy value as needed

        # Calculate dynamic price using simulated usage count and historical data
        total_price, price_per_watt, multiplier = calculate_dynamic_price(
            watt=watt,
            usage_count=dummy_usage_count,
            planned_time=planned_time,
            station_id=station_id,
            base_price_per_watt=0.20
        )

        return JsonResponse({
            'success': True,
            'usage_id': 1,  # Dummy ID for testing
            'created': True,  # Simulated creation flag
            'current_count': dummy_usage_count,
            'total_price': total_price,
            'price_per_watt': price_per_watt,
            'multiplier': multiplier
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def ev_charging_stations(request):
    data = json.loads(request.body)
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if latitude is None or longitude is None:
        return JsonResponse({'error': 'Missing latitude or longitude'}, status=400)

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'key': settings.GOOGLE_MAPS_API_KEY,
        'location': f"{latitude},{longitude}",
        'radius': 5000,
        'type': ''
    }
    response = requests.get(url, params=params)
    places_data = response.json()
    return JsonResponse(places_data)

def ev_map_page(request):
    return render(request, 'maps/ev_map.html')




