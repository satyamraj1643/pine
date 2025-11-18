from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from diary.models import Collection, User, Chapter, Entry, SocialLink, Mood
from django.utils.text import slugify

User = get_user_model()


class UserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = (
            "id",
            "email",
            "name",
            "profile_picture",
            "phone",
            "password",
            "re_password",
        )
        # is_active, is_staff, date_joined are handled automatically


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ("id", "name", "slug", "color", "created_at", "last_used")
        read_only_fields = ("id", "slug", "created_at", "last_used")

        
        


class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ("id", "color", "emoji", "name", "created_at")
        read_only_fields = ("id", "created_at")


class ChapterSerializer(serializers.ModelSerializer):

    collection = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Collection.objects.all()
    )

    class Meta:
        model = Chapter
        fields = (
            "id",
            "color",
            "title",
            "description",
            "is_archived",
            "is_favourite",
            "slug",
            "created_at",
            "updated_at",
            "collection",
        )
        read_only_fields = ("slug", "created_at", "updated_at")

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "user": instance.user.id,
            "color": instance.color,
            "title": instance.title,
            "description": instance.description,
            "is_archived": instance.is_archived,
            "is_favourite": instance.is_favourite,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "slug": instance.slug,
            "collection": [
                {"id": c.id, "name": c.name, "slug": c.slug, "color": c.color}
                for c in instance.collection.all()
            ],
            "entries": [
                {
                    "id": e.id,
                    "title": e.title,
                    "content": e.content,
                    "slug": e.slug,
                    "is_archived": e.is_archived,
                    "is_favourite": e.is_favourite,
                    "created_at": e.created_at,
                    "updated_at": e.updated_at,
                    "collection": [
                        {
                            "id": t.id,
                            "name": t.name,
                            "slug": t.slug,
                            "color": t.color,
                        }
                        for t in e.collection.all()
                    ],
                }
                for e in instance.entries.all()
            ],
        }

    def create(self, validated_data):
        collections = validated_data.pop("collection", [])

        user = self.context["request"].user

        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data.get("title", ""))

        chapter = Chapter.objects.create(user=user, **validated_data)
        chapter.collection.set(collections)

        return chapter


class EntrySerializer(serializers.ModelSerializer):
    collection = serializers.PrimaryKeyRelatedField(
        queryset=Collection.objects.all(), required=False, many=True
    )
    mood = serializers.PrimaryKeyRelatedField(queryset=Mood.objects.all())
    chapter = serializers.PrimaryKeyRelatedField(queryset=Chapter.objects.all())

    class Meta:
        model = Entry
        fields = (
            "id",
            "title",
            "content",
            "slug",
            "is_archived",
            "is_favourite",
            "collection",
            "mood",
            "created_at",
            "updated_at",
            "chapter",
        )
        read_only_fields = ("slug", "created_at", "updated_at")

    def to_representation(self, instance):

        return {
            "id": instance.id,
            "title": instance.title,
            "content": instance.content,
            "is_archived": instance.is_archived,
            "is_favourite": instance.is_favourite,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "collection": [
                {
                    "id": t.id,
                    "name": t.name,
                    "slug": t.slug,
                    "color": t.color,
                }
                for t in instance.collection.all()
            ],
            "mood": (
                {
                    "id": instance.mood.id,
                    "color": instance.mood.color,
                    "emoji": instance.mood.emoji,
                    "name": instance.mood.name,
                }
                if instance.mood
                else None
            ),
            "chapter": (
                {
                    "id": instance.chapter.id,
                    "title": instance.chapter.title,
                    "slug": instance.chapter.slug,
                    "color": instance.chapter.color,
                    "is_favourite" : instance.chapter.color,
                }
                if instance.chapter
                else None
            ),
        }

    def create(self, validated_data):
        user = self.context["request"].user
        title = validated_data.pop("title")
        collection = validated_data.pop("collection", [])
        mood = validated_data.pop("mood", None)
        slug = slugify(title)
        entry = Entry.objects.create(
            user=user, mood=mood, title=title, slug=slug, **validated_data
        )
        entry.collection.set(collection)
        return entry


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ("id", "user", "name", "link", "created_at")
