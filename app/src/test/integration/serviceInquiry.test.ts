import supertest from "supertest";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { describe, it } from "mocha";

let mongoServer: MongoMemoryServer;
let server: any;

describe("Service Inquiries", () => {
  before(async function () {
    try {
      this.timeout(60000);
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);

      // Dynamically importing the app
      const appModule = await import("../../app");
      server = supertest(appModule.app);

      // Calling a random operation on the local database so that it creates indexes, and documents faster
      await mongoose.connection.db?.command({ ping: 1 });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });

  describe("POST /yhteistiedot", () => {
    it("Redirects on success", async () => {
      const response = await server.post("/yhteistiedot").type("form").send({
        name: "James",
        email: "james111@gmail.com",
        phone: "+358508390022",
        message: "Hello world"
      });
      assert.equal(response.status, 303);
    });

    it("Response text contains,  Name is required, on missing name input", async () => {
      const response = await server.post("/yhteistiedot").type("form").send({
        email: "james111@gmail.com",
        phone: "+358508390022",
        message: "Hello world"
      });
      assert.equal(response.status, 200);
      assert.match(response.text, /Name is required/);
    });

    it("Reponse text contains, Email is required, on missing email input", async () => {
      const response = await server.post("/yhteistiedot").type("form").send({
        name: "Jess",
        phone: "+358508390022",
        message: "Hello world"
      });

      assert.equal(response.status, 200);
      assert.match(response.text, /Email is required/);
    });
    it("Reponse text contains, Phone is required, on missing email input", async () => {
      const response = await server.post("/yhteistiedot").type("form").send({
        name: "Troy",
        email: "troy222@gmail.com",
        message: "Hello world"
      });

      assert.equal(response.status, 200);
      assert.match(response.text, /Phone number is required/);
    });
  });

  after(async function () {
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
});
