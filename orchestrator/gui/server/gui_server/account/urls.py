from django.urls import include, path
from rest_framework import routers

from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token, verify_jwt_token

from . import views

router = routers.DefaultRouter()
router.register(r'', views.UserViewSet)

urlpatterns = [
    # JWT Tokens
    path('jwt/', include([
        path('', obtain_jwt_token),
        path('refresh/', refresh_jwt_token),
        path('verify/', verify_jwt_token),
    ])),

    # User Actions
    path('',  include(router.urls)),
]
