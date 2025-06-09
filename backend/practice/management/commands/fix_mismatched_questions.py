from django.core.management.base import BaseCommand
from practice.models import InputTestQuestion
from chapters.models import Chapter


class Command(BaseCommand):
    help = (
        'Fixes mismatched questions by updating their chapter FK and '
        'question_type'
    )

    def handle(self, *args, **options):
        book_name = 'aaa'
        chapter_number = 33
        question_type = 'vocabulary'

        # Get or create the correct chapter
        chapter, created = Chapter.objects.get_or_create(
            book_name=book_name,
            chapter_number=chapter_number,
            defaults={
                'title': f'Chapter {chapter_number}',
                'level': 'N5'  # Default level
            }
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created chapter: {chapter}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Found chapter: {chapter}')
            )

        # Find questions with matching book_name and chapter_number
        questions = InputTestQuestion.objects.filter(
            book_name=book_name, chapter_number=chapter_number
        )
        count = questions.count()
        self.stdout.write(
            f'Found {count} questions with book_name={book_name} and '
            f'chapter_number={chapter_number}'
        )

        # Update each question to point to the correct chapter and set question_type
        updated = 0
        for q in questions:
            q.chapter = chapter
            q.question_type = question_type
            q.save()
            updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Updated {updated} questions to chapter {chapter.id} with '
                f'question_type={question_type}'
            )
        ) 