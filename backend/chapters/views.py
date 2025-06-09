from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Chapter, Vocabulary, GrammarPattern, Note
from .serializers import ChapterSerializer, VocabularySerializer, GrammarPatternSerializer, NoteSerializer


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'book_name']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at']


class VocabularyViewSet(viewsets.ModelViewSet):
    queryset = Vocabulary.objects.all()
    serializer_class = VocabularySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['chapter', 'chapter__level']
    search_fields = ['word', 'meaning']
    ordering_fields = ['word', 'created_at']


class GrammarPatternViewSet(viewsets.ModelViewSet):
    queryset = GrammarPattern.objects.all()
    serializer_class = GrammarPatternSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['chapter', 'chapter__level']
    search_fields = ['pattern', 'explanation']
    ordering_fields = ['pattern', 'created_at']

    def perform_create(self, serializer):
        chapter_id = self.request.data.get('chapter')
        if chapter_id:
            serializer.save(chapter_id=chapter_id)
        else:
            serializer.save()


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at'] 