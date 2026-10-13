from rest_framework import serializers

from users.api.serializers import UserSerializer

class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class RegisterRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

class GoogleLoginRequestSerializer(serializers.Serializer):
    token = serializers.CharField()

class LoginResponseSerializer(serializers.Serializer):

    access = serializers.CharField()

    refresh = serializers.CharField()

    user = UserSerializer()

class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False)

class RefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class RefreshResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()

class ErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()