#!/usr/bin/env python3
"""Turn the MBTA V3 API swagger.json into a compact Markdown reference.

    python3 doc/mbta/swagger-to-md.py doc/mbta/swagger.json > doc/mbta/mbta-v3-api-reference.md

Lists every GET endpoint with its parameters, then every resource with its
attributes (type, enum values, description) and relationships.
"""
import json
import re
import sys


def one_line(text):
    return re.sub(r'\s+', ' ', (text or '').strip())


def describe_param(p):
    name = p['name']
    kind = p.get('type', p.get('schema', {}).get('type', ''))
    if name == 'sort':
        keys = sorted({e.lstrip('-') for e in p.get('enum', [])})
        return f'- `sort` — any of: {", ".join(f"`{k}`" for k in keys)} (prefix `-` for descending)'
    desc = p.get('description', '')
    if name.startswith('fields['):
        # The description just lists the attribute names; keep it short.
        return f'- `{name}` ({kind}) — sparse fieldset: comma-separated attribute names'
    if name == 'include':
        rels = re.findall(r'^\* `([^`]+)`', desc, flags=re.M)
        first = one_line(desc.split('\n\n')[0])
        extra = f' Values: {", ".join(f"`{r}`" for r in rels)}.' if rels else ''
        rest = desc.split('\n\n', 1)[1] if '\n\n' in desc else ''
        return f'- `include` — {first}{extra}' + (f'\n  <details><summary>details</summary>\n\n{indent(rest)}\n  </details>' if rest.strip() else '')
    enum = p.get('enum')
    enum_txt = f' One of: {", ".join(f"`{e}`" for e in enum)}.' if enum else ''
    req = ' **required**' if p.get('required') else ''
    return f'- `{name}` ({p["in"]}, {kind}{req}) — {indent(desc).strip()}{enum_txt}'


def demote(text):
    """Headings inside API descriptions would break this document's outline."""
    return re.sub(r'^\s*#+\s*(.+?)\s*$', r'**\1**', text or '', flags=re.M)


def indent(text, pad='  '):
    text = demote(text)
    return '\n'.join(pad + line if line.strip() else '' for line in text.strip().split('\n'))


def walk_props(props, defs, depth=0, out=None):
    out = [] if out is None else out
    for name, schema in props.items():
        schema = resolve(schema, defs)
        kind = schema.get('type', '')
        if kind == 'array':
            item = resolve(schema.get('items', {}), defs)
            kind = f'array of {item.get("type", "object")}'
        else:
            item = None
        nullable = ' (nullable)' if schema.get('x-nullable') else ''
        enum = schema.get('enum') or (item or {}).get('enum')
        enum_txt = f' Values: {", ".join(f"`{e}`" for e in enum)}.' if enum else ''
        example = schema.get('example')
        ex_txt = f' Example: `{json.dumps(example)}`.' if example not in (None, '') else ''
        desc = one_line(schema.get('description'))
        out.append(f'{"  " * depth}- `{name}` — {kind}{nullable}. {desc}{enum_txt}{ex_txt}'.rstrip())
        sub = (item or schema).get('properties')
        if sub:
            walk_props(sub, defs, depth + 1, out)
    return out


def resolve(schema, defs):
    ref = schema.get('$ref')
    if ref:
        return defs[ref.split('/')[-1]]
    return schema


def main(path):
    spec = json.load(open(path))
    defs = spec['definitions']
    print('<!-- Generated from swagger.json by swagger-to-md.py. Do not edit by hand. -->\n')
    print(f'# MBTA V3 API reference ({spec["info"].get("title")} {spec["info"].get("version")})\n')
    print('Base URL: `https://api-v3.mbta.com`. Auth: `x-api-key` header (or `api_key` query param).')
    print('Format: JSON:API — `data[]` of `{type, id, attributes, relationships}`, related objects in `included[]`.')
    print('Filters take comma-separated lists, e.g. `filter[stop]=place-pktrm,place-dwnxg`.\n')

    print('## Endpoints\n')
    for route, ops in sorted(spec['paths'].items()):
        op = ops.get('get')
        if not op:
            continue
        print(f'### GET {route}\n')
        print(f'{one_line(op.get("summary"))}\n')
        desc = (op.get('description') or '').strip()
        if desc:
            print(demote(desc) + '\n')
        params = op.get('parameters', [])
        if params:
            print('Parameters:\n')
            for p in params:
                print(describe_param(p))
            print()

    print('## Resources\n')
    for name in sorted(defs):
        schema = defs[name]
        props = schema.get('properties', {})
        attrs = props.get('attributes', {}).get('properties')
        rels = props.get('relationships', {}).get('properties')
        is_helper = name in ('InformedEntity', 'ActivePeriod', 'FacilityProperty', 'Activity')
        if not attrs and not rels and not is_helper:
            continue  # list wrappers and error objects
        print(f'### {name}\n')
        if schema.get('description'):
            print(demote(schema['description']).strip() + '\n')
        if attrs:
            print('Attributes:\n')
            print('\n'.join(walk_props(attrs, defs)))
            print()
        elif is_helper and props:
            print('\n'.join(walk_props(props, defs)))
            print()
        elif is_helper:
            print('\n'.join(walk_props({name: schema}, defs)))
            print()
        if rels:
            print('Relationships: ' + ', '.join(f'`{r}`' for r in rels) + '\n')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'swagger.json')
