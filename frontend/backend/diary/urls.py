from django.urls import path
from django.views.decorators.cache import cache_page
from diary.views import (
    EntryCreateView, EntryDetailView, AuthCheckView, CookieTokenObtainPairView,
    LogoutView, IsActivatedCheckView, CollectionCreateView, EntryListView,
    CollectionListView, CollectionDeleteView, MoodCreateView, MoodListView,
    MoodDeleteView, ChapterCreateView, ChapterListView, ArchiveChapter,
    ArchiveEntry, FavouriteChapter, FavouriteEntry, ChapterDeleteView,
    ChapterUpdateView
)

urlpatterns = [
    path('entries/create-new/', EntryCreateView.as_view(), name='entry-create'),
    path('entries/details/<int:pk>/', cache_page(300)(EntryDetailView.as_view()), name='entry-detail'),
    path('entries/all/', cache_page(300)(EntryListView.as_view()), name="all-entries"),
    path('entries/mark-favourite/<int:pk>/', FavouriteEntry.as_view(), name='mark-entry-favourite'),
    path('entries/archive/<int:pk>/', ArchiveEntry.as_view(), name='archive-entry'),

    path('auth/validate/', cache_page(300)(AuthCheckView.as_view()), name='validate-user'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path("auth/jwt/create/", CookieTokenObtainPairView.as_view(), name="jwt-create"),
    path("auth/isActivated/", cache_page(300)(IsActivatedCheckView.as_view()), name="is-activated"),

    path('collections/create-new/', CollectionCreateView.as_view(), name='create-collection'),
    path('collections/all/', cache_page(300)(CollectionListView.as_view()), name='all-collections'),
    path('collections/delete/<int:pk>/', CollectionDeleteView.as_view(), name='delete-collection'),

    path('moods/create-new/', MoodCreateView.as_view(), name="create-mood"),
    path('moods/all/', cache_page(300)(MoodListView.as_view()), name='all-moods'),
    path('moods/delete/<int:pk>/', MoodDeleteView.as_view(), name='delete-mood'),

    path('chapters/create-new/', ChapterCreateView.as_view(), name='create-chapter'),
    path('chapters/delete/<int:pk>/', ChapterDeleteView.as_view(), name='delete-chapter'),
    path('chapters/all/', cache_page(300)(ChapterListView.as_view()), name='all-chapter'),
    path('chapters/mark-favourite/<int:pk>/', FavouriteChapter.as_view(), name='mark-chapter-favourite'),
    path('chapters/archive/<int:pk>/', ArchiveChapter.as_view(), name='archive-chapter'),
    path('chapters/update/<int:pk>/', ChapterUpdateView.as_view(), name="update-chapter")
]
