from rest_framework.generics import (
    RetrieveUpdateDestroyAPIView,
    CreateAPIView,
    ListAPIView,
    DestroyAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from diary.models import Entry, Collection, Mood, Chapter
from diary.serializers import (
    EntrySerializer,
    CollectionSerializer,
    MoodSerializer,
    ChapterSerializer,
)
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timedelta
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.middleware.csrf import get_token
from django.http import JsonResponse


def root_view(request):
    return JsonResponse({"status": "OK", "message": "Django server is running 🚀"})



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh") or request.META.get(
            "HTTP_X_REFRESH_TOKEN"
        )

        # Create response first
        response = Response(
            {"message": "Successfully logged out."}, status=status.HTTP_200_OK
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                print("✅ Token blacklisted successfully")
            except Exception as e:
                print(f"⚠️ Token already blacklisted or invalid: {str(e)}")
                # Don't return error - still clear cookies and logout

        # Clear the cookies regardless of token status
        response.delete_cookie("access")
        response.delete_cookie("refresh")

        # If you set cookies with specific domain/path, match them:
        # response.delete_cookie('access', domain='localhost', path='/')
        # response.delete_cookie('refresh', domain='localhost', path='/')

        return response


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        access = serializer.validated_data["access"]
        refresh = serializer.validated_data["refresh"]

        access_exp = settings.SIMPLE_JWT.get(
            "ACCESS_TOKEN_LIFETIME", timedelta(minutes=5)
        )
        refresh_exp = settings.SIMPLE_JWT.get(
            "REFRESH_TOKEN_LIFETIME", timedelta(days=1)
        )

        response = Response(
            {
                "access": access,
                "refresh": refresh,
            },
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            expires=access_exp.total_seconds(),
            samesite="None",
            secure=True,
        )
        response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            expires=refresh_exp.total_seconds(),
            samesite="None",
            secure=True,
        )
        response.set_cookie("csrftoken", get_token(request), httponly=False)

        # 🛡️ CSRF cookie will now be included too
        return response


class IsActivatedCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({"isActivated": user.is_active})


class AuthCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("in server", request.user)
        user = request.user
        return Response(
            {
                "userId": user.id,
                "email": user.email,
                "name": user.name,
                "isActivated": user.is_active,
            }
        )


class EntryCreateView(CreateAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    # def perform_create(self, serializer):
    #     serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        print("📦 Incoming Data:", request.data)
        response = super().create(request, *args, **kwargs)
        return Response(
            {"message": "Entry created successfully", "data": response.data},
            status=status.HTTP_201_CREATED,
        )


class EntryDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        print("in ", request.data)
        response = super().update(request, *args, **kwargs)
        return Response(
            {"message": "Entry updated successfully", "data": response.data},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response(
            {"message": "Entry deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response(
            {"message": "Entry fetched successfully", "data": response.data},
            status=status.HTTP_200_OK,
        )


class EntryListView(ListAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "message": "Entries fetched successfully",
                "count": len(serializer.data),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CollectionCreateView(CreateAPIView):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CollectionListView(ListAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        collections = Collection.objects.filter(user=self.request.user)
        serialized = []

        for collection in collections:
            data = CollectionSerializer(collection).data
            data["entries_count"] = collection.entries.count()
            data["chapters_count"] = collection.chapters.count()
            serialized.append(data)

        return Response(
            {
                "message": "Collections fetched successfully",
                "count": len(serialized),
                "data": serialized,
            },
            status=status.HTTP_200_OK,
        )


class CollectionDeleteView(DestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()  # 👈 Delete the object here

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        return Response({"message": "Collection deleted successfully."}, status=200)


class MoodCreateView(CreateAPIView):
    queryset = Mood
    serializer_class = MoodSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"message": "Mood Created Successfully"}, status=status.HTTP_201_CREATED
        )


class MoodListView(ListAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

    def list(self, request, *args, **kwargs):
        mood = self.get_queryset().filter(user=request.user)
        serialized = self.get_serializer(mood, many=True)

        return Response(
            {
                "message": "Moods fetched successfully.",
                "data": serialized.data,
                "count": len(serialized.data),
            },
            status=status.HTTP_200_OK,
        )


class MoodDeleteView(DestroyAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

    def get_queryset(self):
        return Mood.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        return Response({"message": "Mood deleted successfully."}, status=200)


class ChapterCreateView(CreateAPIView):
    queryset = ChapterSerializer
    permission_classes = [IsAuthenticated]
    serializer_class = ChapterSerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"message": "Chapter Created Successfully"}, status=status.HTTP_201_CREATED
        )


class ChapterDeleteView(DestroyAPIView):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Ensure the chapter belongs to the logged-in user
        obj = Chapter.objects.get(pk=self.kwargs["pk"], user=self.request.user)
        return obj

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Chapter deleted."}, status=status.HTTP_204_NO_CONTENT
        )


class ChapterListView(ListAPIView):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def list(self, request, *args, **kwargs):
        Chapter = self.get_queryset().filter(user=request.user)
        serialized = self.get_serializer(Chapter, many=True)

        return Response(
            {
                "message": "Moods fetched successfully.",
                "data": serialized.data,
                "count": len(serialized.data),
            },
            status=status.HTTP_200_OK,
        )


class ChapterUpdateView(UpdateAPIView):
    queryset = Chapter.objects.all()  
    serializer_class = ChapterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs["pk"]
        return Chapter.objects.filter(pk=pk, user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response(
            {"message": "Chapter updated successfully", "data": response.data},
            status=status.HTTP_200_OK,
        )



class ArchiveEntry(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        is_archived = request.data.get("is_archived")

        if is_archived is None:
            return Response(
                {"error": "Missing 'is_archived' in request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entry = Entry.objects.get(pk=pk, user=request.user)
            entry.is_archived = is_archived
            entry.save()
            state = "favourited" if is_archived else "unfavourited"
            return Response(
                {"message": f"Entry {state} successfully."}, status=status.HTTP_200_OK
            )
        except Entry.DoesNotExist:
            return Response(
                {"error": "Entry not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ArchiveChapter(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        is_archived = request.data.get("is_archived")

        if is_archived is None:
            return Response(
                {"error": "Missing 'is_archived' in request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entry = Chapter.objects.get(pk=pk, user=request.user)
            entry.is_archived = is_archived
            entry.save()
            state = "archived" if is_archived else "unarchived"
            return Response(
                {"message": f"Chapter {state} successfully."}, status=status.HTTP_200_OK
            )
        except Chapter.DoesNotExist:
            return Response(
                {"error": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND
            )


class FavouriteChapter(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        is_favourite = request.data.get("is_favourite")

        if is_favourite is None:
            return Response(
                {"error": "Missing 'is_favourite' in request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entry = Chapter.objects.get(pk=pk, user=request.user)
            entry.is_favourite = is_favourite
            entry.save()
            state = "favourited" if is_favourite else "unfavourited"
            return Response(
                {"message": f"Chapter {state} successfully."}, status=status.HTTP_200_OK
            )
        except Chapter.DoesNotExist:
            return Response(
                {"error": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND
            )


class FavouriteEntry(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        is_favourite = request.data.get("is_favourite")

        if is_favourite is None:
            return Response(
                {"error": "Missing 'is_favourite' in request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entry = Entry.objects.get(pk=pk, user=request.user)
            entry.is_favourite = is_favourite
            entry.save()
            state = "favourited" if is_favourite else "unfavourited"
            return Response(
                {"message": f"Entry {state} successfully."}, status=status.HTTP_200_OK
            )
        except Entry.DoesNotExist:
            return Response(
                {"error": "Entry not found."}, status=status.HTTP_404_NOT_FOUND
            )
