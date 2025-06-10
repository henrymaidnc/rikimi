from django.contrib import admin

from .models import Chapter, Vocabulary, GrammarPattern

admin.site.register(Chapter)
admin.site.register(Vocabulary)
admin.site.register(GrammarPattern)
