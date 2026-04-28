# fastify-openapi-glue: recursive `$ref` serialization bug

Minimal reproduction for a bug in `fastify-openapi-glue@4.11.0` where recursive `$ref` schemas in OpenAPI response definitions produce unresolvable `$ref` paths in Fastify's serialization pipeline.

## Reproduce

```bash
npm install
npm run repro
```

**Expected:** Server starts, both endpoints respond with 200.

**Actual:**
```
node_modules/fastify/lib/route.js:440
              throw new FST_ERR_SCH_SERIALIZATION_BUILD(opts.method, url, error.message)
                    ^
FastifyError: Failed building the serialization schema for GET: /tree,
due to error Cannot find reference "#/content/application~1json/schema"
```

## Environment

- Node: v24.14.0
- Fastify: 5.8.5
- fastify-openapi-glue: 4.11.0
- yaml: 2.8.3

## Root cause

See the associated issue for full analysis. In short, three shared-mutable-state bugs interact:

1. **Parser.js** — `preProcessSpec()` passes the spec by reference to `validator.validate()`. After `resolveRefs()`, circular JS object references propagate back to the caller's original spec.
2. **Parser.v3.js** — `parseContent()` assigns shared schema object references instead of deep copies. When `removeRecursion()` mutates one endpoint's schema, it corrupts other endpoints sharing the same schema objects.
3. **ParserBase.js** — `removeRecursion()` processes response schemas at the content-wrapper level instead of unwrapping to the inner schema. Generated `$ref` paths start with `#/content/application~1json/schema/...`, but Fastify strips the content wrapper before passing to `fast-json-stringify`, making the paths unresolvable.
