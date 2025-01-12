from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.utils import process_pipeline
from pymongo import MongoClient
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from bcrypt import hashpw, gensalt
from bson.objectid import ObjectId

class ExecutePipelineView(APIView):
    def post(self, request):
        try:
            result = process_pipeline(request.data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 
class SignupView(APIView):
    def post(self, request):
        try:
            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            db = client.get_database('data')
            users_collection = db.user

            email = request.data.get('email')
            password = request.data.get('password')
            user_type = request.data.get('userType', 'customer')  # Default to customer if not specified

            hashed_password = hashpw(password.encode('utf-8'), gensalt())

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Insert user data into MongoDB with user type
            mongo_user = users_collection.insert_one({
                'email': email,
                'password': hashed_password,
                'userType': user_type,  # Add user type to the document
                'created_at': datetime.now()
            })

            print(email, str(mongo_user.inserted_id))
            return Response({
                'user': {
                    'email': email,
                    'id': str(mongo_user.inserted_id),
                    'userType': user_type  # Return user type in response
                }
            })

        except Exception as e:
            return Response({'error': f"Signup failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        try:
            # Get credentials from request
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Connect to MongoDB
            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            db = client.get_database('data')
            users_collection = db.user

            # Find user in MongoDB
            user_data = users_collection.find_one({'email': email})
            
            if not user_data:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            # Return user data
            
            # token = jwt.encode({'user_id': str(user_data['_id']), 'exp': datetime.utcnow() + timedelta(days=1)},
            #                    'your_secret_key', algorithm='HS256')

            return Response({
                'token': token,
                'user': {
                    'email': user_data['email'],
                    'id': str(user_data['_id']),
                    'password': user_data['password']
                }
            });

        except Exception as e:
            return Response({'error': f"Login failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
class NewProjectView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            project_name = request.data.get('project_name')
            collaborators = request.data.get('collaborators')
            is_public = request.data.get('is_public')

            if not user_id or not project_name:
                return Response({'error': 'User ID and project name are required'}, status=status.HTTP_400_BAD_REQUEST)

            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            db = client.get_database('projects')
            projects_collection = db.projects

            project_id = projects_collection.insert_one({
                'user_id': user_id,
                'project_name': project_name,
                'created_at': datetime.now(),
                'nodes': [],
                'connections': [],
                'collaborators': collaborators,
                'is_public': is_public
            })

            return Response({'project_id': str(project_id.inserted_id)}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f"New project failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class AllUsersView(APIView):
    def get(self, request):
        try:
            client = MongoClient(settings.MONGODB_URI)
            db = client.get_database('users')
            users_collection = db.users

            # Get all users but only return email and id
            users = users_collection.find(
                {},
                {'email': 1}  # Only return email field
            )

            users_list = [{'email': user['email'], 'id': str(user['_id'])} for user in users]
            return Response({'users': users_list})

        except Exception as e:
            return Response(
                {'error': f"Failed to fetch users: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
