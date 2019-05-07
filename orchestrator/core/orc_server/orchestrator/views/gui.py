# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render, reverse


def gui_redirect(request):
    return HttpResponseRedirect(reverse('api.root'))


@login_required
def gui_root(request):
    page_args = {
        'page_title': 'Home'
    }
    return render(request, 'index.html', page_args)
