from django.http import HttpResponseRedirect
from django.shortcuts import reverse


def gui_redirect(request):
    """
    GUI redirect to API
    :param request: request instance
    :return: HTTP Redirect
    """
    return HttpResponseRedirect(reverse('api.root'))
