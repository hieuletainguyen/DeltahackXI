from django.db import models

class BookingCount(models.Model):
    booking_time = models.DateTimeField()
    count = models.IntegerField(default=0)
    
# Create your models here.
