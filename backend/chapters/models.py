from common.models import BaseModel
from django.db import models
from common import constant


class Chapter(BaseModel):
    level = models.CharField(max_length=2, choices=constant.LEVEL_CHOICES)
    book_name = models.CharField(max_length=200)
    chapter_number = models.IntegerField(default=0)

    class Meta:
        ordering = ['level', 'chapter_number']
        unique_together = ('book_name', 'chapter_number')

    def __str__(self):
        return f"{self.book_name} - ({self.level})"


class Vocabulary(BaseModel):
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name='vocabularies'
    )

    # Word: could be single kanji or a compound word
    word = models.CharField(max_length=100)

    # Meaning (Vietnamese, English, etc.)
    meaning = models.TextField()

    # Optional example sentence and translation
    example = models.TextField(blank=True)
    example_translation = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_kanji(self):
        return len(self.word) == 1 and '\u4e00' <= self.word <= '\u9faf'

    def __str__(self):
        return self.word


class KanjiInfo(BaseModel):
    vocabulary = models.OneToOneField(
        Vocabulary,
        on_delete=models.CASCADE,
        related_name='kanji_info'
    )

    # Radical (部首 / Bộ thủ)
    radical = models.CharField(max_length=10, blank=True)

    # ON and KUN readings
    on_yomi = models.CharField(max_length=100, blank=True)
    kun_yomi = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"KanjiInfo for {self.vocabulary.word}"


class GrammarPattern(models.Model):
    chapter = models.ForeignKey(
        'Chapter',
        on_delete=models.CASCADE,
        related_name='grammar_patterns'
    )
    pattern = models.CharField(max_length=200)  # e.g., ～ている
    description = models.TextField(blank=True)  # Optional general note
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.pattern


class GrammarUsage(BaseModel):
    pattern = models.ForeignKey(
        GrammarPattern,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    explanation = models.TextField()  # e.g., Expresses ongoing action
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Usage for {self.pattern.pattern} [{self.order}]"


class GrammarExample(BaseModel):
    usage = models.ForeignKey(
        GrammarUsage,
        on_delete=models.CASCADE,
        related_name='examples'
    )
    sentence = models.TextField()  # 日本語の例文
    translation = models.TextField()  # English/Vietnamese/etc.

    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.sentence


class Note(BaseModel):
    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()

    def __str__(self):
        return self.title if self.title else self.content[:30]
