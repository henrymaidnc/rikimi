from rest_framework import serializers

from .models import Chapter, Vocabulary, GrammarPattern, GrammarUsage, GrammarExample, Note


class VocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vocabulary
        fields = ['id', 'chapter', 'word', 'meaning', 'example', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GrammarExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrammarExample
        fields = ['id', 'sentence', 'translation', 'order']
        read_only_fields = ['id']


class GrammarUsageSerializer(serializers.ModelSerializer):
    examples = GrammarExampleSerializer(many=True, read_only=True)

    class Meta:
        model = GrammarUsage
        fields = ['id', 'explanation', 'examples', 'order']
        read_only_fields = ['id']


class GrammarPatternSerializer(serializers.ModelSerializer):
    usages = GrammarUsageSerializer(many=True, read_only=True)

    class Meta:
        model = GrammarPattern
        fields = ['id', 'chapter', 'pattern', 'description', 'usages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChapterSerializer(serializers.ModelSerializer):
    vocabularies = VocabularySerializer(many=True, read_only=True)
    grammar_patterns = GrammarPatternSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = [
            'id', 'level', 'book_name', 'chapter_number',
            'vocabularies', 'grammar_patterns', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 