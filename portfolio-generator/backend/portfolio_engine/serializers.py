from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Portfolio, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'target_role', 'bio', 'skills']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    target_role = serializers.CharField(required=False, allow_blank=True, default="")
    bio = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'target_role', 'bio']

    def create(self, validated_data):
        target_role = validated_data.pop('target_role', '')
        bio = validated_data.pop('bio', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password
        )
        UserProfile.objects.create(
            user=user,
            target_role=target_role,
            bio=bio
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials provided.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        data['user'] = user
        return data


class PortfolioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            'id',
            'username',
            'title',
            'slug',
            'theme',
            'sections_data',
            'is_published',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'username', 'slug', 'created_at', 'updated_at']

    def validate_sections_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("sections_data must be a valid JSON object.")
        import json
        try:
            serialized = json.dumps(value)
            if len(serialized) > 1024 * 1024:  # 1MB limit
                raise serializers.ValidationError("sections_data payload exceeds 1MB limit.")
        except (TypeError, ValueError):
            raise serializers.ValidationError("sections_data contains non-serializable JSON data.")
        return value


class PublicPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = [
            'title',
            'slug',
            'theme',
            'sections_data',
            'created_at',
            'updated_at',
        ]


class AIEnhanceRequestSerializer(serializers.Serializer):
    raw_text = serializers.CharField(required=True, allow_blank=False)
    target_role = serializers.CharField(required=False, allow_blank=True, default="Software Engineer")


class AIResumeParseRequestSerializer(serializers.Serializer):
    resume_text = serializers.CharField(required=True, allow_blank=False)

