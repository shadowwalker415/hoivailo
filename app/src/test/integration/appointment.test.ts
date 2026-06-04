import supertest from "supertest";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { describe, it } from "mocha";

// import { v4 as uuidv4 } from "uuid";
import {
  wasYesterday,
  getNextWorkingDay,
  getNextWeekend,
  currentDay,
  overThreeMonthsDate,
  getNextPublicHoliday
} from "../testHelpers";

// const server = supertest(app);
let mongoServer: MongoMemoryServer;
let server: any;

describe("Appointments:", function () {
  before(async function () {
    try {
      this.timeout(60000);
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      const appModule = await import("../../app");
      server = supertest(appModule.app);

      // Calling a random operation on the local database so that it creates indexes, and documents faster
      await mongoose.connection.db?.command({ ping: 1 });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
  describe("GET /tapaaminen/oleva-aika", () => {
    it("Response text contains klo,  valid working days", async () => {
      const response = await server
        .get("/tapaaminen/oleva-aika")
        .query({ date: getNextWorkingDay() });
      assert.equal(response.status, 200);
      assert.match(response.text, /klo/);
    });

    it("Response with status code 400 for invalid date", async () => {
      const response = await server
        .get("/tapaaminen/oleva-aika")
        .query({ date: "202" });

      assert.equal(response.status, 400);
    });

    it("Response text contains Ei ole mahdollisuuksia, for past date", async () => {
      const response = await server
        .get("/tapaaminen/oleva-aika")
        .query({ date: wasYesterday() });

      assert.equal(response.status, 200);
      assert.match(response.text, /Ei ole mahdollisuuksia/);
    });

    it("Response text contains Ei ole mahdollisuuksia,  for weekend date", async () => {
      const response = await server
        .get("/tapaaminen/oleva-aika")
        .query({ date: getNextWeekend() });
      assert.equal(response.status, 200);
      assert.match(response.text, /Ei ole mahdollisuuksia/);
    });

    it("Response text contains Ei ole mahdollisuuksia, for current day", async () => {
      const response = await server
        .get("/tapaaminen/oleva-aika")
        .query({ date: currentDay() });
      assert.equal(response.status, 200);
      assert.match(response.text, /Ei ole mahdollisuuksia/);
    });
  });

  it("Response text contains Ei ole mahdollisuuksia, for date over three months in advance", async () => {
    const response = await server
      .get("/tapaaminen/oleva-aika")
      .query({ date: overThreeMonthsDate() });
    assert.equal(response.status, 200);
    assert.match(response.text, /Ei ole mahdollisuuksia/);
  });

  it("Reponse text contains Ei ole mahdolliksuuksia, for public holidays", async () => {
    const response = await server
      .get("/tapaaminen/oleva-aika")
      .query({ date: getNextPublicHoliday() });
    assert.equal(response.status, 200);
    assert.match(response.text, /Ei ole mahdollisuuksia/);
  });

  after(async () => {
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
});
