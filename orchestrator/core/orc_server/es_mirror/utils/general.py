import string

from django.db.models import signals, Model
from elasticsearch_dsl import Field, Nested, Object
from django.db.models.fields.related import ForeignKey, ManyToManyField
from elasticsearch.exceptions import NotFoundError
from elasticsearch_dsl import connections, Document, Search
from typing import (
    Dict,
    List,
    Tuple,
    Union
)


FIELDS = Union[str, Union[None, 'FIELDS']]
_ignore_keys = [
    '__doc__',
    '__module__',
    '_state',
    'password'
]


def es_dict(model: Model, fields: FIELDS = None) -> Union[dict, None]:
    if not isinstance(model, Model):
        return model

    fields = fields or {}
    data = dict(
        _id=model.pk
    )
    opts = getattr(model, '_meta')
    model_fields = [*opts.concrete_fields, *opts.private_fields, *opts.many_to_many]
    for f in model_fields:
        if isinstance(f, ForeignKey):
            val = es_dict(getattr(model, f.name), fields.get(f.name))
        elif isinstance(f, ManyToManyField):
            val = [es_dict(mod, fields.get(f.name)) for mod in getattr(model, f.name).all()]
            pass
        else:
            val = getattr(model, f.name)
        data[f.name] = val
    data = {k: v for k, v in data.items() if k not in _ignore_keys}

    if fields:
        return {k: v for k, v in data.items() if k in fields}

    return data


def get_nestedFields(fields: List[Tuple[str, Field, bool]]) -> dict:
    nested_fields = {}
    for f_name, f_type, f_req in fields:
        if isinstance(f_type, (Nested, Object)):
            nested_fields[f_name] = get_nestedFields(list(f_type._doc_class._ObjectBase__list_fields()))
        else:
            nested_fields[f_name] = None

    return nested_fields if nested_fields else None


class ElasticHooks:
    _mirror: bool
    _exists: set
    _models: Dict[Model, Document]
    _prefix: str

    def __init__(self, host: Union[list, str] = None, prefix: str = '', **kwargs) -> None:
        self._exists = set()
        self._mirror = False
        self._models = {}
        self._prefix = self._clean_string(prefix)

        if host is not None:
            self._mirror = True
            connections.configure(
                default=dict(
                    hosts=host,
                    timeout=kwargs.get('timeout', 60)
                )
            )

    def add_model(self, model: Model, doc: Document) -> None:
        # print(f"{model.__name__} add -> {doc.Index.name}")
        self._models[model] = doc
        # Listen to all model saves
        signals.post_save.connect(self.handle_save, sender=model)
        signals.post_delete.connect(self.handle_delete, sender=model)

        # Use to manage related objects update
        m2m = getattr(model, '_meta').many_to_many
        if m2m:
            for field in m2m:
                print(f"M2M thought - {field}")
                signals.m2m_changed.connect(self.handle_m2m_changed, sender=getattr(model, field.attname).through)

    def handle_save(self, sender, instance=None, **kwargs):
        # print(f"{sender.__name__} save")
        if self._mirror:
            doc = self._check_mirror(sender)
            d = doc.model_init(instance)
            d.save(index=self._prefix_index(doc.Index.name))

    def handle_delete(self, sender, instance=None, **kwargs):
        # print(f"{sender.__name__} delete")
        if self._mirror:
            doc = self._check_mirror(sender)
            d = doc.model_init(instance)
            try:
                d.delete(index=self._prefix_index(doc.Index.name))
            except (NotFoundError, TypeError):
                pass

    def handle_m2m_changed(self, sender, instance, action, **kwargs):
        if action.startswith('post_') and self._mirror:
            # print(f"{sender.__name__} m2m change - {action} - {instance}")
            self.handle_save(instance.__class__, instance)

    # Helper functions
    def _check_mirror(self, model) -> Document:
        doc = self._models[model]

        # Create model index if not exists...
        if self._mirror:
            conn = connections.get_connection()
            if not conn.indices.exists(index=self._prefix_index(doc.Index.name)):
                doc.init(index=self._prefix_index(doc.Index.name))
            self._exists.add(model.__name__)

        return doc

    def _clean_string(self, s: str) -> str:
        cleaned = filter(lambda c: c in string.printable, s)
        return ''.join(cleaned).replace(" ", "-")

    def _prefix_index(self, index: str) -> str:
        prefix = self._prefix.replace('/', '_')
        return f"{prefix}_{index}"
