import Fastify from "fastify";
import openapiGlue from "fastify-openapi-glue";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const spec = parse(readFileSync("spec.yaml", "utf-8"));

function countRefs(value) {
  if (Array.isArray(value)) {
    return value.reduce((count, item) => count + countRefs(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((count, [key, child]) => {
      return count + (key === "$ref" ? 1 : 0) + countRefs(child);
    }, 0);
  }

  return 0;
}

class Service {
  async getUser() {
    return { id: "user-1", name: "Ada Lovelace" };
  }
}

const app = Fastify({ logger: true });

console.log(`$ref count before register: ${countRefs(spec)}\n`);

await app.register(openapiGlue, {
  specification: spec,
  serviceHandlers: new Service(),
});

console.log(`$ref count after register: ${countRefs(spec)}\n`);
console.log(JSON.stringify(spec, null, 2));

await app.close();
