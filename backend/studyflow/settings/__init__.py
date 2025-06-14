import os

# Set the default settings module based on the environment
if os.environ.get('DJANGO_ENV') == 'production':
    from .production import *
else:
    from .development import *
