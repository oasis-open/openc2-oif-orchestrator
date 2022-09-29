from django.urls import include, path
from rest_framework import routers

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from . import views

router = routers.DefaultRouter()
router.register('', views.UserViewSet)
router.register('(?P<username>[^/.]+)/history', views.UserHistoryViewSet)

urlpatterns = [
    # JWT Tokens
    path('jwt/', include([
        path('', views.OrchTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    ])),

    # User Actions
    path('',  include(router.urls)),

    # Actuator Access
    path('<str:username>/actuator/', include([
        path('', views.ActuatorAccess.as_view()),
        path('<str:actuator_id>/', views.actuatorDelete)
    ]))
]
