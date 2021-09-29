"""
Update OSQuery tables
"""
import os
import re

from functools import partial
from pathlib import Path
from string import Template
from typing import List

IgnoreTables = ["example", ]
NameOverride = {
    "os": "OS"
}
OperatingSystems = {
    "DARWIN": "MacOS",
    "FreeBSD": "FreeBSD",
    "LINUX": "Linux",
    "POSIX": "Posix",
    "WINDOWS": "Windows"
}
TypeMap = {
    # "AutoField
    # "BigAutoField
    "UNSIGNED_BIGINT": "BigIntegerField",
    "INTEGER": "IntegerField",
    "BIGINT": "BigIntegerField",
    # "SmallIntegerField": "SmallIntegerField",
    # "IdentityField": "IdentityField",
    # "FloatField": "FloatField",
    "DOUBLE": "DoubleField",
    # "DecimalField": "DecimalField",
    "CharField": "CharField",
    # "FixedCharField": "FixedCharField",
    "TEXT": "TextField",
    # "BlobField": "BlobField",
    # "BitField": "BitField",
    # "BigBitField": "BigBitField",
    # "UUIDField": "UUIDField",
    # "BinaryUUIDField": "BinaryUUIDField",
    "DATETIME": "DateTimeField",
    # "DateField: "DateField",
    # "TimeField: "TimeField",
    # "TimestampField": "TimestampField",
    # "IPField": "IPField",
    # "BooleanField": "BooleanField",
    # "BareField": "BareField",
    # "ForeignKey": "ForeignKeyField"
}
AliasFields = ("False", "def", "if", "raise", "None", "del", "import", "return", "True", "elif", "in", "try", "and",
               "else", "is", "while", "as", "except", "lambda", "with", "assert", "finally", "nonlocal", "yield",
               "break", "for", "not", "class", "from", "or", "continue", "global", "pass")


def getClassName(_name: str):
    fixed_name = []
    for c in _name.split('_'):
        fixed_name.append(NameOverride.get(c.lower(), c.capitalize()))
    return ''.join(fixed_name)


def getOperatingSystemExtentions(_os: str, cls: str):
    os_name = OperatingSystems.get(_os, _os)
    return f"class {os_name}_{cls}({cls}):"


def escapeText(txt: str) -> str:
    txt = txt.replace("\"", "\\\"")
    txt = txt.replace("'", "\\'")
    # txt = re.sub(r"\\([uU])", "\\\\\1", txt)
    return txt


# Table functions
def table_name(attrs: dict, _name: str, *args, **kwargs):
    attrs.update(
        class_name=getClassName(_name),
        table_name=_name
    )


def description(attrs: dict, desc: str):
    attrs["description"] = escapeText(desc)


def schema(attrs: dict, fields: List[str]):
    fields = "\n".join(fields)
    fields = re.sub(r"^", "\t", fields, flags=re.MULTILINE).replace("\t", "    ")
    attrs.update(
        schema=fields
    )


def schema_column(attrs: dict, _name: str, _type: str, desc: str, **kwargs):
    _type = TypeMap.get(_type, _type)
    attrs.setdefault("field_imports", set()).add(_type)
    args = {
        "help_text": f'"{escapeText(desc)}"'
    }
    if _name in AliasFields:
        args['column_name'] = f'"{_name}"'
        _name = f"{_name}_"
    field = f"{_name} = {_type}({', '.join(f'{k}={v}' for k, v in args.items())})"
    if kwargs:
        field += f"  # {kwargs}"
    return field


def schema_foreign_key(attrs: dict, column: str, table: str, **kwargs):
    cls = getClassName(table)
    attrs.setdefault("field_imports", set()).add("ForeignKeyField")
    attrs.setdefault("local_imports", set()).add(f"from .{table} import {cls}")
    field = f"{name} = ForeignKeyField({cls}, backref='{column}')"
    if kwargs:
        field += f"  # {kwargs}"
    return field


def extended_schema(attrs: dict, _os: str, fields: List[str]):
    ext_schema = f"\n\n# OS specific properties for {_os}"
    ext_schema += f"\n{getOperatingSystemExtentions(_os, attrs['class_name'])}\n"
    columns = "\n".join(fields)
    ext_schema += re.sub(r"^", "\t", columns, flags=re.MULTILINE).replace("\t", "    ")
    attrs.setdefault("extended_schema", "")
    attrs["extended_schema"] += ext_schema.replace("\t", " " * 4) + "\n"


def implementation(attrs: dict, imp: str, **kwargs):
    pass


def fuzz_paths(attrs: dict, *paths):
    pass


def attributes(attrs: dict, **attr):
    pass


def examples(attrs: dict, exp: List[str]):
    attrs["description"] += "\n\tExamples:\n" + re.sub(r"^", "\t\t", "\n".join(exp), flags=re.MULTILINE)
    attrs["description"] = attrs["description"].replace("\t", "    ")


table_funcs = {
    "table_name": table_name,
    "description": description,
    "schema": schema,
    "Column": schema_column,
    "ForeignKey": schema_foreign_key,
    "extended_schema": extended_schema,
    "implementation": implementation,
    "fuzz_paths": fuzz_paths,
    "attributes": attributes,
    "examples": examples
}


def doc2table(doc: str) -> dict:
    attrs = {
        "general_imports": set(),
        "field_imports": set(),
        "local_imports": set(),
        "extended_schema": "",
        "description": ""
    }
    env_funcs = {
        **{k: partial(v, attrs) for k, v in table_funcs.items()},
        **OperatingSystems,
        **TypeMap
    }
    eval_env = {
        "locals": env_funcs,
        "globals": env_funcs,
        "__name__": "NAME",
        "__file__": "FILE",
        "__builtins__": env_funcs
    }

    with open(doc, "r") as d:
        spec = d.read()
        try:
            cc = compile(spec, doc, 'exec')
            eval(cc, eval_env)
            attrs["description"] = re.sub("\t", "    ", f'''"""\n\t{attrs["description"]}\n\t"""''' if attrs["description"] else "")
            attrs["general_imports"] = ("\n".join(attrs["general_imports"]) + "\n") if attrs["general_imports"] else ""
            attrs["field_imports"] = attrs["field_imports"] - {"int", "str"}
            attrs["field_imports"] = f"from peewee import {', '.join(attrs['field_imports'])}\n" if attrs["field_imports"] else ""
            attrs["local_imports"] = ('\n'.join(attrs['local_imports']) + "\n\n") if attrs["local_imports"] else "\n"
            return attrs
        except Exception as e:
            raise Exception('Table parsing error has occurred: {}'.format(e))


if __name__ == "__main__":
    with open('table_template.txt', 'r') as t:
        template_str = Template(t.read())
    spec_dir = os.path.abspath("./specs")
    table_dir = os.path.abspath("./tables")
    for (dirpath, dirnames, filenames) in os.walk(spec_dir):
        for filename in filenames:
            name, ext = os.path.splitext(filename)
            if name in IgnoreTables:
                continue
            if ext == '.table':
                spec_path = os.sep.join([dirpath, filename])
                table_path = os.path.join(dirpath, f"{name}.py")
                table_path = table_path.replace(spec_dir, table_dir)
                print(f"Updating table for {spec_path}")
                opts = doc2table(spec_path)
                Path(os.path.dirname(table_path)).mkdir(parents=True, exist_ok=True)
                with open(table_path, "w") as f:
                    f.write(template_str.substitute(opts))
