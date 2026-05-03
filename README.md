# fastify-openapi-glue: recursive `$ref` serialization bug

Minimal reproduction for a bug in `fastify-openapi-glue@4.11.1` where recursive `$ref` schemas in OpenAPI response definitions produce unresolvable `$ref` paths in Fastify's serialization pipeline.

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
FastifyError: Failed building the serialization schema for GET: /forest, due to error Cannot find reference "#/allOf/1"
```

## Trigger condition

Two endpoints reference the same recursive schema through different wrappers. The one directly (`TreeNode`), the other via `allOf` (`AnnotatedTree`). The endpoint processed first mutates the shared objects with `$ref` paths that are invalid for the second endpoint's schema root (when the endpoint order is flipped in `spec.yaml` the `GET: /tree` endpoint fails).

## Environment

- Node: v24.14.0
- Fastify: 5.8.5
- fastify-openapi-glue: 4.11.1
- yaml: 2.8.3
