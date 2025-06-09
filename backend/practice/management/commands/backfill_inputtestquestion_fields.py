from django.core.management.base import BaseCommand
from practice.models import InputTestQuestion

class Command(BaseCommand):
    help = 'Backfill book_name and chapter_number for InputTestQuestion records using their related chapter.'

    def handle(self, *args, **options):
        updated = 0
        for q in InputTestQuestion.objects.all():
            if not q.book_name or not q.chapter_number:
                if q.chapter:
                    q.book_name = q.chapter.book_name
                    q.chapter_number = q.chapter.chapter_number
                    q.save()
                    updated += 1
        self.stdout.write(self.style.SUCCESS(f'Backfilled {updated} InputTestQuestion records.')) 