import app from "../app";
import supertest from "supertest";
import config from "../utils/config";
import mongoose from "mongoose";
import Appointment from "../model/appointment";
import { describe, it } from "mocha";
import assert from "assert";

import {
  wasYesterday,
  isToday,
  getNextWeekend,
  overThreeMonths,
  getNextWorkingDay
} from "./testHelpers";

const server = supertest(app);

describe("Available Slots:", () => {
  describe("When selected date is a wrong date format", () => {
    it("Response status code is 400", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: "202" })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400);
      assert.strictEqual(response.status, 400);
    });
  });

  describe("When selected date is a current date", () => {
    it("Returns an empty slot", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: isToday() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 0);
      }
    });
  });

  describe("When selected date is a past date", () => {
    it("Returns an empty slot", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: wasYesterday() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 0);
      }
    });
  });

  describe("When selected date is holiday", () => {
    it("Returns an empty slot", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: "2025-12-25" })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 0);
      }
    });
  });

  describe("When selected date is a weekend", () => {
    it("Returns an empty slot array", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: getNextWeekend() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 0);
      }
    });
  });

  describe("When selected date is three or over three months away", function () {
    it("Returns an empty slot array", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: overThreeMonths() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 0);
      }
    });
  });

  describe("When selected date is a work day and there are no booked appointments", () => {
    before(async () => {
      try {
        await mongoose.connect(config.MONGODB_URI);
      } catch (err) {
        throw err;
      }
    });

    it("Returns 4 appointment slots", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: getNextWorkingDay() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 4);
      }
    });
    after(async () => {
      try {
        await mongoose.disconnect();
      } catch (err) {
        throw err;
      }
    });
  });

  describe("When selected date is a work day and there is a booked appointment", () => {
    before(async () => {
      try {
        await mongoose.connect(config.MONGODB_URI);

        const newAppointment = new Appointment({
          startTime: `${getNextWorkingDay()} 09:00`,
          endTime: `${getNextWorkingDay()} 11:00`,
          name: "John Doe",
          email: "johndoe@gmail.com",
          phone: "+358507115688",
          service: "Yrityssiivous"
        });
        // Creating a new appointment
        await newAppointment.save();
      } catch (err) {
        throw err;
      }
    });

    it("Returns 3 appointment slots", async () => {
      const response = await server
        .get("/api/v1/availability")
        .query({ date: getNextWorkingDay() })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      let resBody;
      if ("body" in response) {
        resBody = response.body;
      }
      if (!resBody || typeof resBody !== "object") {
        throw new Error("Body does not exist");
      }
      if ("data" in resBody && "slots" in resBody) {
        assert.equal(resBody.data.slots.length, 3);
      }
    });

    after(async () => {
      try {
        // Deleting all existing appointments
        await Appointment.deleteMany({});
        await mongoose.disconnect();
      } catch (err) {
        throw err;
      }
    });
  });
});
