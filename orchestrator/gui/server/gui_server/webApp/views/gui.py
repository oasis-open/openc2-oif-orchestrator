# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponseRedirect
from django.shortcuts import reverse


def gui_redirect(request):
    return HttpResponseRedirect(reverse('api.root'))
