import app from "../app";
import supertest from "supertest";
import { describe, it } from "mocha";
import assert from "assert";
const server = supertest(app);

describe("When query parameter is a wrong date format", () => {
  it("Returns an error response with status 400", async function () {
    // this.timeout(5000);
    const response = await server
      .get("/api/v1/availability")
      .query({ date: "202" })
      .expect(400);
    assert.strictEqual(response.status, 400);
  });
});
