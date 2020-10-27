from django.urls import include, path

from rest_framework import routers

from .. import views


router = routers.DefaultRouter()
router.register(r'registered', views.OrchestratorViewSet)
router.register(r'auth', views.OrchestratorAuthViewSet)

urlpatterns = [
    # Routers
    path('', views.api_root, name='orchestrator.api_root'),
    path('', include(router.urls)),
]
