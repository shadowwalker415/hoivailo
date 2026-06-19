import supertest from "supertest";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { describe, it } from "mocha";

import {
  wasYesterday,
  getNextWorkingDay,
  getNextWeekend,
  currentDay,
  overThreeMonthsDate,
  getNextPublicHoliday
} from "../testHelpers";
import { Appointment } from "../../model/appointment";

let mongoServer: MongoMemoryServer;
let server: any;

describe("Appointments:", function () {
  before(async function () {
    try {
      this.timeout(60000);
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);

      // Dynamically importing the app
      const appModule = await import("../../app");
      server = supertest(appModule.app);

      // Calling a random first operation on the local database.
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
  });

  describe("POST /tapaaminen/aika", () => {
    it("Redirects on successful booking", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `${getNextWorkingDay()} 09:00`,
          endTime: `${getNextWorkingDay()} 11:00`,
          name: "Jason Bourne",
          email: "jasonbourne@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });
      assert.equal(response.status, 303);
    });

    it("Response text contains name required, on missing name input", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `${getNextWorkingDay()} 09:00`,
          endTime: `${getNextWorkingDay()} 11:00`,
          email: "jasonbourne@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });

      assert.equal(response.status, 200);
      assert.match(response.text, /Name is required/);
    });

    it("Response contains Valitse päivämäärä, on missing appointment start time input", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          endTime: `${getNextWorkingDay()} 11:00`,
          name: "James",
          email: "james23@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });

      assert.equal(response.status, 200);
      assert.match(response.text, /Valitse päivämäärä/);
    });
    it("Response contains Valitse päivämäärä, on missing appointment end time input", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `${getNextWorkingDay()} 09:00`,
          name: "James",
          email: "james23@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });

      assert.equal(response.status, 200);
      assert.match(response.text, /Valitse päivämäärä/);
    });
    it("Response contains klo, on start time before opening hours", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `${getNextWorkingDay()} 07:00`,
          endTime: `${getNextWorkingDay()} 09:00`,
          name: "James",
          email: "james23@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });

      assert.equal(response.status, 200);
      assert.match(response.text, /klo/);
    });
    it("Response contains klo, on end time after closing hours", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `${getNextWorkingDay()} 07:00`,
          endTime: `${getNextWorkingDay()} 09:00`,
          name: "James",
          email: "james23@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });

      assert.equal(response.status, 200);
      assert.match(response.text, /klo/);
    });

    it("Response contains Valitse päivämäärä, on empty request body", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({});

      assert.equal(response.status, 200);
      assert.match(response.text, /Valitse päivämäärä/);
    });

    it("Response with status code 400, on invalid date time format for start or end time", async () => {
      const response = await server
        .post("/tapaaminen/aika")
        .type("form")
        .send({
          startTime: `16.06.2026 07:00`,
          endTime: `${getNextWorkingDay()} 09:00`,
          name: "James",
          email: "james23@gmail.com",
          phone: "+358408399065",
          service: "Yrityssiivous"
        });
      assert.equal(response.status, 400);
    });
  });

  describe("POST /tapaaminen/peruta", () => {
    it("Redirects on successful cancellations", async () => {
      const bookedAppointment = await Appointment.create({
        startTime: `${getNextWorkingDay()} 13:00`,
        endTime: `${getNextWorkingDay()} 15:00`,
        appointmentDate: getNextWorkingDay(),
        name: "James",
        email: "james11@gmail.com",
        phone: "+358408399065",
        service: "Kotihoito"
      });

      const response = await server
        .post("/tapaaminen/peruta")
        .type("form")
        .send({
          appointmentId: bookedAppointment.appointmentId,
          reason: "sickness"
        });

      assert.equal(response.status, 303);
    });

    it("Response text contains appointmentId required, on missing appointmentId input", async () => {
      await Appointment.create({
        startTime: `${getNextWorkingDay()} 15:00`,
        endTime: `${getNextWorkingDay()} 17:00`,
        appointmentDate: getNextWorkingDay(),
        name: "Terry",
        email: "terry11@gmail.com",
        phone: "+358408399091",
        service: "Yrityssiivous"
      });
      const response = await server
        .post("/tapaaminen/peruta")
        .type("form")
        .send({ reason: "sickness" });
      assert.equal(response.status, 200);
      assert.match(response.text, /Appointment ID required/);
    });

    it("Response text contains Appointment with this ID was not found, for non existing appointments", async () => {
      const nonExistingID = crypto.randomUUID();
      const response = await server
        .post("/tapaaminen/peruta")
        .type("form")
        .send({ appointmentId: nonExistingID, reason: "Sickness" });
      assert.equal(response.status, 200);
      assert.match(response.text, /Appointment with this ID was not found/);
    });

    it("Reponse text contains, invalid appointmentId, for invalid appointmentId input", async () => {
      const invalidAppointmentId = "dhsakdsa9e209370134927801";
      const response = await server
        .post("/tapaaminen/peruta")
        .type("form")
        .send({ appointmentId: invalidAppointmentId, reason: "Sickness" });
      assert.equal(response.status, 200);
      assert.match(response.text, /Invalid appointment ID/);
    });

    it("Response text contains Appointment already cancelled, for appointments already cancelled", async () => {
      const appointment = await Appointment.create({
        startTime: `${getNextWorkingDay()} 11:00`,
        endTime: `${getNextWorkingDay()} 13:00`,
        appointmentDate: getNextWorkingDay(),
        name: "Terry",
        email: "terry11@gmail.com",
        phone: "+358408399091",
        service: "Yrityssiivous"
      });

      // canceling appointment
      appointment.status = "cancelled";
      const cancelledAppointment = await appointment.save();
      const response = await server
        .post("/tapaaminen/peruta")
        .type("form")
        .send({
          appointmentId: cancelledAppointment.appointmentId,
          reason: "Sickness"
        });
      assert.equal(response.status, 200);
      assert.match(response.text, /Appointment already cancelled/);
    });
  });

  after(async () => {
    try {
      await Appointment.deleteMany({});
      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
});
