# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, reverse


@login_required
@permission_required('logs.can_view')
def gui_root(request):
    page_args = {
        'page_title': 'Logs'
    }
    return render(request, 'tracking/index.html', page_args)


@login_required
@permission_required('logs.can_view')
def gui_requests(request):
    page_args = {
        'page_title': 'Request Logs'
    }
    return render(request, 'tracking/request.html', page_args)


@login_required
@permission_required('logs.can_view')
def gui_events(request):
    page_args = {
        'page_title': 'Event Logs'
    }
    return render(request, 'tracking/event.html', page_args)
