#!/usr/bin/env python3
"""Turn BKK's FUTÁR OpenAPI 3 spec (futar-openapi.yaml) into a compact Markdown reference.

    python3 doc/bkk/openapi-to-md.py doc/bkk/futar-openapi.yaml > doc/bkk/futar-api-reference.md

Lists every endpoint with its parameters and response schema, then every schema
with its properties (type, enum values, description).
"""
import re
import sys

import yaml


def one_line(text):
    return re.sub(r'\s+', ' ', str(text or '').strip())


def ref_name(ref):
    return ref.split('/')[-1]


def type_of(schema):
    if not isinstance(schema, dict):
        return ''
    if '$ref' in schema:
        return f'[{ref_name(schema["$ref"])}](#{ref_name(schema["$ref"]).lower()})'
    for combo in ('allOf', 'oneOf', 'anyOf'):
        if combo in schema:
            return f' {combo} '.join(type_of(s) for s in schema[combo])
    kind = schema.get('type', '')
    if kind == 'array':
        return f'array of {type_of(schema.get("items", {}))}'
    if kind == 'object' and 'additionalProperties' in schema:
        return f'map of string → {type_of(schema["additionalProperties"]) or "any"}'
    fmt = schema.get('format')
    return f'{kind} ({fmt})' if fmt else kind


def resolve_param(p, spec):
    if '$ref' in p:
        parts = p['$ref'].lstrip('#/').split('/')
        node = spec
        for part in parts:
            node = node[part]
        return node
    return p


def describe_param(p):
    schema = p.get('schema', {})
    enum = schema.get('enum')
    enum_txt = f' One of: {", ".join(f"`{e}`" for e in enum)}.' if enum else ''
    default = schema.get('default')
    default_txt = f' Default: `{default}`.' if default is not None else ''
    req = ' **required**' if p.get('required') else ''
    return f'- `{p["name"]}` ({p.get("in")}, {type_of(schema)}{req}) — {one_line(p.get("description"))}{enum_txt}{default_txt}'


def main(path):
    spec = yaml.safe_load(open(path))
    schemas = spec.get('components', {}).get('schemas', {})
    info = spec['info']
    print('<!-- Generated from futar-openapi.yaml by openapi-to-md.py. Do not edit by hand. -->\n')
    print(f'# BKK FUTÁR API reference ({info.get("title")} {info.get("version")})\n')
    for s in spec.get('servers', []):
        print(f'Server: `{s["url"]}` ({s.get("description", "")})  ')
    print('Auth: API key in the `key` query parameter. `{dialect}` in paths is `otp` for BKK.\n')
    if info.get('description'):
        print(one_line(info['description']) + '\n')

    print('## Endpoints\n')
    for route, ops in spec['paths'].items():
        shared = [resolve_param(p, spec) for p in ops.get('parameters', [])]
        for method, op in ops.items():
            if method == 'parameters' or not isinstance(op, dict):
                continue
            print(f'### {method.upper()} {route}\n')
            text = ' '.join(filter(None, [one_line(op.get('summary')), one_line(op.get('description'))]))
            if text:
                print(text + '\n')
            params = shared + [resolve_param(p, spec) for p in op.get('parameters', [])]
            if params:
                print('Parameters:\n')
                for p in params:
                    print(describe_param(p))
                print()
            body = op.get('requestBody', {}).get('content', {})
            for ctype, content in body.items():
                print(f'Request body ({ctype}): {type_of(content.get("schema", {}))}\n')
            for code, resp in op.get('responses', {}).items():
                for ctype, content in (resp.get('content') or {}).items():
                    print(f'Response {code} ({ctype}): {type_of(content.get("schema", {}))}\n')

    print('## Schemas\n')
    for name, schema in sorted(schemas.items()):
        print(f'### {name}\n')
        if schema.get('description'):
            print(one_line(schema['description']) + '\n')
        if schema.get('enum'):
            print('Values: ' + ', '.join(f'`{e}`' for e in schema['enum']) + '\n')
        parts = schema.get('allOf', [schema])
        for part in parts:
            if '$ref' in part:
                print(f'Extends {type_of(part)}.\n')
                continue
            required = set(part.get('required', []))
            for prop, ps in (part.get('properties') or {}).items():
                enum = ps.get('enum') or (ps.get('items') or {}).get('enum')
                enum_txt = f' Values: {", ".join(f"`{e}`" for e in enum)}.' if enum else ''
                req = ' **required**' if prop in required else ''
                print(f'- `{prop}` — {type_of(ps)}{req}. {one_line(ps.get("description"))}{enum_txt}'.rstrip())
        print()


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'futar-openapi.yaml')
