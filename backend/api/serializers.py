from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        return token
    
    def validate(self, attrs):
        # Get the username field (could be 'username', 'email', etc. depending on User model)
        # TokenObtainPairSerializer uses self.username_field to get the field name
        username_field = self.username_field  # This is 'username' for Django's default User model
        password = attrs.get('password')
        username = attrs.get(username_field)
        
        # Debug: Print to see what we're receiving
        print(f"Login attempt - Username field: {username_field}, Username: {username}, Password provided: {bool(password)}")
        
        # Step 1: Check if user exists
        try:
            user = User.objects.get(**{username_field: username})
            print(f"User found: {user.username}")
        except User.DoesNotExist:
            # Username doesn't exist - return specific error
            print(f"User not found with {username_field}: {username}")
            raise ValidationError({'detail': 'User not found'}, code='user_not_found')
        
        # Step 2: User exists, now check password with authenticate
        authenticated_user = authenticate(username=username, password=password)
        
        if authenticated_user is None:
            # User exists but password is wrong
            print(f"Password incorrect for user: {username}")
            raise ValidationError({'detail': 'Password is incorrect'}, code='incorrect_password')
        
        # Both username and password are correct, proceed normally
        print(f"Authentication successful for user: {username}")
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):
        user=User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'author']
        extra_kwargs = {"author": {"read_only": True}}