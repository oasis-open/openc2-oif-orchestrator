from peewee import Model


class BaseModel(Model):
    """
    Base for all OSQuery table models
    """
    def __str__(self):
        if self._meta.primary_key is False:
            return 'No_PK'
        return str(self._pk)

    class Meta:
        primary_key = False
