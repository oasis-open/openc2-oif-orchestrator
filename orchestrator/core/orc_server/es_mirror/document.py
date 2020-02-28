from django.db.models import Model
from elasticsearch_dsl import Document as DSL_Document, InnerDoc, Nested, Object

from .utils import es_dict, get_nestedFields


class Document(DSL_Document):
    @classmethod
    def model_init(cls, model: Model = None) -> 'Document':
        fields = dict(
            _id=model.pk
        )
        for f_name, f_type, _ in cls._ObjectBase__list_fields():
            prepare = getattr(cls, f'prepare_{f_name}', None)
            if prepare:
                val = prepare(cls, model)
            else:
                val = getattr(model, f_name, None)
                if isinstance(f_type, (Nested, Object)):
                    nested_fields = get_nestedFields(list(f_type._doc_class._ObjectBase__list_fields()))

                    if isinstance(f_type, Nested):
                        val = [es_dict(v, nested_fields) for v in val.all()]
                    else:
                        val = es_dict(val, nested_fields)

            fields[f_name] = val
        return cls(**fields)


__all__ = [
    'Document',
    'InnerDoc'
]
