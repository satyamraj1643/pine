from django.utils import timezone
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils.text import slugify


class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, profile_picture, phone, password=None):
        if not email:
            raise ValueError("User must have an email address.")
        email = self.normalize_email(email)
        user = self.model(
            email=email, name=name, phone=phone, profile_picture=profile_picture
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, profile_picture, phone, password=None):
        user = self.create_user(
            email=email,
            name=name,
            password=password,
            phone=phone,
            profile_picture=profile_picture,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255, default="")
    phone = models.CharField(max_length=14, blank=True, null=True)
    profile_picture = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    objects = UserAccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "profile_picture", "phone"]


class SocialLink(models.Model):
    class SocialChoices(models.TextChoices):
        INSTAGRAM = "Instagram", "Instagram"
        TWITTER = "Twitter", "Twitter"
        LINKEDIN = "LinkedIn", "LinkedIn"
        FACEBOOK = "Facebook", "Facebook"
        GITHUB = "GitHub", "GitHub"
        YOUTUBE = "YouTube", "YouTube"
        PERSONAL = "Personal", "Personal Website"
        OTHER = "Other", "Other"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="social_links"
    )
    name = models.CharField(
        max_length=255, choices=SocialChoices.choices, null=True, blank=True
    )
    link = models.URLField(max_length=511, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    class Meta:
        unique_together = ("user", "name")


class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collections")
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    color = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Mood(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="moods")
    color = models.CharField(max_length=100)
    emoji = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    created_at = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.emoji} ({self.color})"

class Chapter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chapters")
    color = models.CharField(max_length=50)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_archived = models.BooleanField(default=False)
    is_favourite = models.BooleanField(default=False)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    collection = models.ManyToManyField(Collection, related_name="chapters")

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

        # Update last_used for related collections
        for c in self.collection.all():
            c.last_used = timezone.now()
            c.save(update_fields=["last_used"])

    def __str__(self):
        return self.title or f"Chapters #{self.pk}"

    
    
class Entry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entries")
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    slug = models.SlugField(unique=True, blank=True)
    is_archived = models.BooleanField(default=False)
    is_favourite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    collection = models.ManyToManyField(Collection, related_name="entries")
    mood = models.ForeignKey(
        Mood, null=True, on_delete=models.SET_NULL, blank=True, related_name="entries"
    )
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='entries')

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

        # Update last_used for related collections
        for c in self.collection.all():
            c.last_used = timezone.now()
            c.save(update_fields=["last_used"])

    def __str__(self):
        return self.title or f"Entry #{self.pk}"




