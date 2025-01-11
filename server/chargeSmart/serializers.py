# from rest_framework import serializers
# from .models import CustomUser

# class UserRegistrationSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)

#     class Meta:
#         model = CustomUser
#         fields = ('id', 'email', 'username', 'password', 'is_owner', 
#                  'ev_model', 'preferred_charging_type')
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         user = CustomUser.objects.create_user(
#             email=validated_data['email'],
#             username=validated_data['username'],
#             password=validated_data['password'],
#             is_owner=validated_data.get('is_owner', False),
#             ev_model=validated_data.get('ev_model', ''),
#             preferred_charging_type=validated_data.get('preferred_charging_type', 'TYPE2')
#         )
#         return user