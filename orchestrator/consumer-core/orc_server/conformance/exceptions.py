from rest_framework.exceptions import APIException


class EditException(APIException):
    status_code = 403
    default_detail = 'Permission Denied, cannot alter object'
    default_code = 'permission_denied'
