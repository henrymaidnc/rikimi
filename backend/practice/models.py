from django.db import models
from django.contrib.auth.models import User
from chapters.models import Chapter, Vocabulary


class PracticeActivity(models.Model):
    ACTIVITY_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('typing', 'Typing'),
        ('matching', 'Matching'),
        ('listening', 'Listening'),
        ('speaking', 'Speaking'),
        ('writing', 'Writing'),
    ]

    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Practice Activities"
        ordering = ['chapter', 'activity_type']

    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.chapter.title}"


class InputTestQuestion(models.Model):
    QUESTION_TYPES = [
        ('vocabulary', 'Vocabulary'),
        ('grammar', 'Grammar'),
        ('kanji', 'Kanji'),
    ]

    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='input_test_questions')
    book_name = models.CharField(max_length=200, db_index=True, null=True, blank=True)
    chapter_number = models.IntegerField(db_index=True, null=True, blank=True)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    question_text = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=200)
    hint = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Input Test Questions"
        ordering = ['chapter', 'question_type', 'created_at']

    def __str__(self):
        return f"{self.get_question_type_display()} - {self.question_text[:50]}"


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    activity = models.ForeignKey(PracticeActivity, on_delete=models.CASCADE, related_name='progress')
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_attempt = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User Progress"
        unique_together = ['user', 'activity']

    def __str__(self):
        return f"{self.user.username} - {self.activity.title}"


class InputTestAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='input_test_attempts', null=True, blank=True)
    question = models.ForeignKey(InputTestQuestion, on_delete=models.CASCADE, related_name='attempts')
    user_answer = models.CharField(max_length=200)
    is_correct = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Input Test Attempts"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.question.question_text[:50]}"


class PracticeQuestion(models.Model):
    activity = models.ForeignKey(PracticeActivity, on_delete=models.CASCADE, related_name='questions')
    vocabulary = models.ForeignKey(Vocabulary, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    correct_answer = models.TextField()
    options = models.JSONField(default=list)  # For multiple choice questions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['activity', 'created_at']

    def __str__(self):
        return f"{self.activity.title} - {self.vocabulary.word}" 