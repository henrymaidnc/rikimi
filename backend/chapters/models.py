from django.db import models


class Chapter(models.Model):
    LEVEL_CHOICES = [
        ('N5', 'N5'),
        ('N4', 'N4'),
        ('N3', 'N3'),
        ('N2', 'N2'),
        ('N1', 'N1'),
    ]

    title = models.CharField(max_length=200)
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    book_name = models.CharField(max_length=200)
    chapter_number = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level', 'chapter_number']
        unique_together = ('book_name', 'chapter_number')

    def __str__(self):
        return f"{self.book_name} - {self.title} ({self.level})"


class Vocabulary(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='vocabularies')
    word = models.CharField(max_length=200)
    meaning = models.TextField()
    example = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Vocabularies"
        ordering = ['word']

    def __str__(self):
        return f"{self.word} - {self.chapter.title}"


class GrammarPattern(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='grammar_patterns')
    pattern = models.CharField(max_length=200)
    explanation = models.TextField()
    examples = models.JSONField(default=list)  # Store examples as a list of strings
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['pattern']

    def __str__(self):
        return f"{self.pattern} - {self.chapter.title}"


class Note(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title if self.title else self.content[:30]
