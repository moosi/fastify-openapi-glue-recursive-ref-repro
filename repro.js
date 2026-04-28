import Fastify from "fastify";
import openapiGlue from "fastify-openapi-glue";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const spec = parse(readFileSync("spec.yaml", "utf-8"));

class Service {
  async getTree() {
    return { id: "root", children: [] };
  }
  async getForest() {
    return [];
  }
}

const app = Fastify({ logger: true });

await app.register(openapiGlue, {
  specification: spec,
  serviceHandlers: new Service(),
});

await app.ready();

const treeRes = await app.inject({ method: "GET", url: "/tree" });
console.log(`GET /tree → ${treeRes.statusCode}`);

const forestRes = await app.inject({ method: "GET", url: "/forest" });
console.log(`GET /forest → ${forestRes.statusCode}`);

await app.close();
