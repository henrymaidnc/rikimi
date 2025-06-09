from rest_framework import serializers
from .models import (
    PracticeActivity, UserProgress, PracticeQuestion,
    InputTestQuestion, InputTestAttempt
)
from chapters.serializers import VocabularySerializer


class PracticeQuestionSerializer(serializers.ModelSerializer):
    vocabulary = VocabularySerializer(read_only=True)

    class Meta:
        model = PracticeQuestion
        fields = [
            'id', 'activity', 'vocabulary', 'question_text',
            'correct_answer', 'options', 'created_at', 'updated_at'
        ]


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'activity', 'score',
            'completed', 'last_attempt', 'created_at'
        ]
        read_only_fields = ['user']


class InputTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InputTestQuestion
        fields = [
            'id', 'chapter', 'book_name', 'chapter_number', 'question_type', 'question_text',
            'correct_answer', 'hint', 'created_at', 'updated_at'
        ]


class InputTestAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = InputTestAttempt
        fields = [
            'id', 'user', 'question', 'user_answer',
            'is_correct', 'created_at'
        ]


class PracticeActivitySerializer(serializers.ModelSerializer):
    questions = PracticeQuestionSerializer(many=True, read_only=True)
    progress = UserProgressSerializer(many=True, read_only=True)

    class Meta:
        model = PracticeActivity
        fields = [
            'id', 'chapter', 'activity_type', 'title', 'description',
            'questions', 'progress', 'created_at', 'updated_at'
        ] 