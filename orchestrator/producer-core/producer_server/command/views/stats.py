from ..models import SentHistory, ResponseHistory


def app_stats():
    return dict(
        sent=SentHistory.objects.count(),
        responses=ResponseHistory.objects.count()
    )
