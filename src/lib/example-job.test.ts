import assert from "node:assert/strict";
import test from "node:test";
import { isExampleJob } from "./example-job";

test("detecta los registros antiguos de ejemplo por su identificador", () => {
  assert.equal(
    isExampleJob({ id: "seed_ejemplo_job_1", company: { legalId: "3-101-123456" } }),
    true
  );
});

test("detecta compañías demostrativas aunque el identificador del puesto sea normal", () => {
  assert.equal(
    isExampleJob({ id: "job_real_1", company: { legalId: "DEMO_EMPRESA_1" } }),
    true
  );
});

test("permite una vacante real", () => {
  assert.equal(
    isExampleJob({ id: "job_real_1", company: { legalId: "3-101-123456" } }),
    false
  );
});
