from rest_framework import serializers
from .models import Chapter, Vocabulary, GrammarPattern, Note


class VocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vocabulary
        fields = ['id', 'chapter', 'word', 'meaning', 'example', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GrammarPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrammarPattern
        fields = ['id', 'chapter', 'pattern', 'explanation', 'examples', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChapterSerializer(serializers.ModelSerializer):
    vocabularies = VocabularySerializer(many=True, read_only=True)
    grammar_patterns = GrammarPatternSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'level', 'book_name', 'chapter_number',
            'vocabularies', 'grammar_patterns', 'created_at', 'updated_at'
        ]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at'] 