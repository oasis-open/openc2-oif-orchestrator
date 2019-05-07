# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import redirect, render, reverse


def gui_redirect(request):
    return HttpResponseRedirect(reverse('api.root'))


@login_required
def gui_root(request):
    return 'GUI Root....'
