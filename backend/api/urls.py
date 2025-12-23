from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreateView.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    # STEP 5: Added endpoint to update/edit notes
    path("notes/update/<int:pk>/", views.NoteUpdate.as_view(), name="update-note"),
]