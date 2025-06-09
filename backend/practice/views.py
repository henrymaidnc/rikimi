from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    PracticeActivity, UserProgress, PracticeQuestion,
    InputTestQuestion, InputTestAttempt
)
from .serializers import (
    PracticeActivitySerializer, UserProgressSerializer,
    PracticeQuestionSerializer, InputTestQuestionSerializer,
    InputTestAttemptSerializer
)


class PracticeActivityViewSet(viewsets.ModelViewSet):
    queryset = PracticeActivity.objects.all()
    serializer_class = PracticeActivitySerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['chapter', 'activity_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at']

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        activity = self.get_object()
        question_id = request.data.get('question_id')
        user_answer = request.data.get('answer')

        try:
            question = PracticeQuestion.objects.get(
                id=question_id,
                activity=activity
            )
            is_correct = question.check_answer(user_answer)
            
            # Update user progress
            progress, created = UserProgress.objects.get_or_create(
                user=request.user,
                activity=activity,
                defaults={'score': 0}
            )
            
            if is_correct:
                progress.score += 1
                progress.save()
            
            return Response({
                'is_correct': is_correct,
                'correct_answer': question.correct_answer,
                'score': progress.score
            })
        except PracticeQuestion.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class InputTestQuestionViewSet(viewsets.ModelViewSet):
    queryset = InputTestQuestion.objects.all()
    serializer_class = InputTestQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['chapter', 'question_type']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['POST'])
    def import_questions(self, request):
        questions_data = request.data.get('questions', [])
        book_name = request.data.get('book_name')
        chapter_number = request.data.get('chapter_number')
        question_type = request.data.get('question_type')

        if not questions_data or not book_name or not chapter_number or not question_type:
            return Response(
                {
                    'error': (
                        'Missing required fields: questions, book_name, '
                        'chapter_number, or question_type'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get or create the chapter
            from chapters.models import Chapter
            chapter, created = Chapter.objects.get_or_create(
                book_name=book_name,
                chapter_number=chapter_number,
                defaults={
                    'title': f'Chapter {chapter_number}',
                    'level': 'N5'  # Default level
                }
            )

            created_questions = []
            errors = []

            for question_data in questions_data:
                try:
                    # Use question_type from question_data if present, else fallback
                    q_type = question_data.get('question_type', question_type)
                    question_data['chapter'] = chapter.id
                    question_data['question_type'] = q_type
                    question_data['book_name'] = book_name
                    question_data['chapter_number'] = chapter_number

                    serializer = self.get_serializer(data=question_data)
                    if not serializer.is_valid():
                        print('Validation error:', serializer.errors)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    created_questions.append(serializer.data)
                except Exception as e:
                    print('Exception:', str(e))
                    errors.append({
                        'question': question_data,
                        'error': str(e)
                    })

            return Response({
                'created': len(created_questions),
                'created_questions': created_questions,
                'errors': errors,
                'message': (
                    f'Successfully imported {len(created_questions)} questions '
                    f'to {book_name} Chapter {chapter_number}. '
                    f'{len(errors)} errors.'
                )
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to process import: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        question = self.get_object()
        user_answer = request.data.get('answer')

        if not user_answer:
            return Response({'error': 'No answer provided.'}, status=400)

        is_correct = question.correct_answer.lower() == user_answer.lower()
        user = request.user if request.user.is_authenticated else None
        # Record the attempt
        attempt = InputTestAttempt.objects.create(
            user=user,
            question=question,
            user_answer=user_answer,
            is_correct=is_correct
        )
        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'attempt_id': attempt.id
        })


class InputTestAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InputTestAttemptSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'question', 'is_correct']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return InputTestAttempt.objects.filter(user=self.request.user)


class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['activity', 'completed']
    ordering_fields = ['score', 'last_attempt']

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)


class PracticeQuestionViewSet(viewsets.ModelViewSet):
    queryset = PracticeQuestion.objects.all()
    serializer_class = PracticeQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['activity', 'vocabulary']
    ordering_fields = ['created_at']


class VocabularyInputTestQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InputTestQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['chapter', 'book_name', 'chapter_number']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return InputTestQuestion.objects.filter(question_type='vocabulary') 