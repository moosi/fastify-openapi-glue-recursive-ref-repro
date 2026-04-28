# fastify-openapi-glue: recursive `$ref` serialization bug

Minimal reproduction for a behavior in `fastify-openapi-glue@4.11.0` where the provided apiSpec object is manipulated.

## Reproduce

```bash
npm install
npm run repro
```

**Expected:** The callers apiSpec stays untouched.

**Actual:** The `$ref`'s of the callers apiSpec are resolved (see `console.log()` output).

## Environment

- Node: v24.14.0
- Fastify: 5.8.5
- fastify-openapi-glue: 4.11.0
- yaml: 2.8.3

## Root cause

**Parser.js** — `preProcessSpec()` passes the spec by reference to `validator.validate()`. After `resolveRefs()`, circular JS object references propagate back to the caller's original spec.
