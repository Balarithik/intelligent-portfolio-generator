import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class UserProfile(models.Model):
    """
    Extended user profile for portfolio preferences and default professional info.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    target_role = models.CharField(max_length=255, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    skills = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


def default_sections_data():
    return {
        "profile": {
            "name": "",
            "target_role": "",
            "email": "",
            "phone": "",
            "location": "",
            "bio": "",
            "github": "",
            "linkedin": "",
            "website": "",
        },
        "experience": [],
        "projects": [],
        "skills": [],
    }


class Portfolio(models.Model):
    """
    Portfolio instance storing layout, sections JSON, publication status, and custom theme.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="portfolios")
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    theme = models.CharField(max_length=50, default="minimalist")
    sections_data = models.JSONField(default=default_sections_data, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or f"portfolio-{uuid.uuid4().hex[:6]}"
            slug = base_slug
            counter = 1
            while Portfolio.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.slug}) - {self.user.username}"

