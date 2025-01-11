# from django.db import models
# import uuid

# class UserAccount(models.Model):

#     email = models.EmailField(unique=True)
#     is_owner = models.BooleanField(default=False)
#     ev_model = models.CharField(max_length=100, blank=True)
#     password = models.CharField(max_length=100, blank=True)
#     USERNAME_FIELD = 'email'
#     PASSWORD_FIELD = 'password'
#     REQUIRED_FIELDS = ['username', 'password']

#     def __str__(self):
#         return self.email
    
