from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chapters.views import ChapterViewSet, VocabularyViewSet, GrammarPatternViewSet, NoteViewSet
from practice.views import (
    PracticeActivityViewSet,
    PracticeQuestionViewSet,
    UserProgressViewSet,
    InputTestQuestionViewSet,
    InputTestAttemptViewSet,
    VocabularyInputTestQuestionViewSet
)
from .views import health_check

router = DefaultRouter()
router.register(r'chapters', ChapterViewSet)
router.register(r'vocabularies', VocabularyViewSet)
router.register(r'grammar_patterns', GrammarPatternViewSet)
router.register(r'practice-activities', PracticeActivityViewSet)
router.register(r'practice-questions', PracticeQuestionViewSet)
router.register(r'user-progress', UserProgressViewSet, basename='user-progress')
router.register(r'input-test-questions', InputTestQuestionViewSet)
router.register(r'input-test-attempts', InputTestAttemptViewSet, basename='input-test-attempt')
router.register(r'vocabulary-input-test-questions', VocabularyInputTestQuestionViewSet, basename='vocabulary-input-test-question')
router.register(r'notes', NoteViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('health/', health_check, name='health_check'),
] 