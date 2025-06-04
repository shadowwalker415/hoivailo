import app from "../app";
import supertest from "supertest";
import config from "../utils/config";
import mongoose from "mongoose";
import Appointment from "../model/appointment";
import { describe, it } from "mocha";
import assert from "assert";
import { v4 as uuidv4 } from "uuid";
import {
  wasYesterday,
  overThreeMonths,
  getNextWorkingDay,
  getNextWeekend,
  isToday
} from "./testHelpers";

const server = supertest(app);
const workingDay = getNextWorkingDay();

describe("Booking Appointments:", () => {
  beforeEach(async () => {
    try {
      await mongoose.connect(config.MONGODB_URI);
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
  describe("Booking appointment with invalid input data (Phone number)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 09:00`,
          endTime: `${workingDay} 11:00`,
          name: "John Doe",
          phone: "0989039283",
          email: "johndoe@gmail.com",
          service: "kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Invalid phone number"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (Name)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 09:00`,
          endTime: `${workingDay} 11:00`,
          name: "J",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Name must be at least 3 characters long"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (Start time is before opening hour)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 08:00`,
          endTime: `${workingDay} 10:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message:
              "Appointment start or end time cannot be a time before official opening hour"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (Start time is at closing hour or after closing hour)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 18:00`,
          endTime: `${workingDay} 20:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message:
              "Appointment start or end time cannot be same as closing hour or after closing hour"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (Appointment duration is more than 2 hours)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 09:00`,
          endTime: `${workingDay} 12:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message:
              "Appointment duration cannot be less than or more than 2 hours"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (Appointment start time or end time has minutes)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 11:15`,
          endTime: `${workingDay} 13:15`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Appointment start or end time must have 00 minutes"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (date time is past date)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${wasYesterday()} 09:00`,
          endTime: `${wasYesterday()} 11:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Appointment start or end time cannot be a past date"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (date time is current date)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${isToday()} 09:00`,
          endTime: `${isToday()} 11:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "An Appointment can't be booked on the same day"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (date time is three months away)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${overThreeMonths()} 09:00`,
          endTime: `${overThreeMonths()} 11:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message:
              "Appointment start or end time cannot be a date 3 months away"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data (date time is a holiday)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `2025-12-25 09:00`, // Should be updated manually to test all holiday dates in availability config file
          endTime: `2025-12-25 11:00`, // Should be updated manually to test all holiday dates in availability config file
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Start or end time date must be a working day"
          });
        });
    });
  });

  describe("Booking appointment with invalid input data(date time is a weekend)", () => {
    it("Has response with status code 400", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${getNextWeekend()} 09:00`,
          endTime: `${getNextWeekend()} 11:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(400)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 400,
            message: "Start or end time date must be a working day"
          });
        });
    });
  });

  describe("Booking appointment with valid input data", () => {
    it("Successfully books an appointment", async () => {
      await server
        .post("/api/v1/appointment")
        .send({
          startTime: `${workingDay} 09:00`,
          endTime: `${workingDay} 11:00`,
          name: "John Doe",
          phone: "+358507279900",
          email: "johndoe@gmail.com",
          service: "Kotiapu"
        })
        .expect(201)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: true,
            code: 201,
            data: {
              message: "Appointment successfully booked for johndoe@gmail.com"
            }
          });
        });
    });
  });

  describe("Booking appointment with valid input data when an appointment with same data already exist", () => {
    it("Response with status code 500", async () => {
      const appointmentDetails = {
        startTime: `${workingDay} 09:00`,
        endTime: `${workingDay} 11:00`,
        name: "John Doe",
        phone: "+358507279900",
        email: "johndoe@gmail.com",
        service: "Kotiapu"
      };
      const newAppointment = new Appointment(appointmentDetails);
      await newAppointment.save();
      await server
        .post("/api/v1/appointment")
        .send(appointmentDetails)
        .expect(500)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            status: 500,
            message: "Appoinment already exist"
          });
        });
    });
  });

  afterEach(async () => {
    try {
      await Appointment.deleteMany({});
      await mongoose.disconnect();
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
});

describe("Cancelling appointments:", () => {
  beforeEach(async () => {
    try {
      await mongoose.connect(config.MONGODB_URI);
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });

  describe("Attempting to cancel appointment with valid appointment ID", () => {
    it("Successfully cancels the appointment", async () => {
      const appointmentDetails = {
        startTime: `${workingDay} 09:00`,
        endTime: `${workingDay} 11:00`,
        name: "John Doe",
        phone: "+358507279900",
        email: "johndoe@gmail.com",
        service: "Kotiapu"
      };
      const newAppointment = new Appointment(appointmentDetails);
      const savedAppointment = await newAppointment.save();

      await server
        .post("/api/v1/appointment/cancel")
        .send({
          appointmentId: savedAppointment.appointmentId,
          reason: "Sickness"
        })
        .expect(201)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: true,
            status: 201,
            data: {
              message:
                "Appointment successfully cancelled for johndoe@gmail.com"
            }
          });
        });
    });
  });

  describe("Attempting to cancel appointment with invalid appointment ID", () => {
    it("Response with 404 status code", async () => {
      const appointmentDetails = {
        startTime: `${workingDay} 09:00`,
        endTime: `${workingDay} 11:00`,
        name: "John Doe",
        phone: "+358507279900",
        email: "johndoe@gmail.com",
        service: "Kotiapu"
      };
      const newAppointment = new Appointment(appointmentDetails);
      await newAppointment.save();
      const id = uuidv4();

      await server
        .post("/api/v1/appointment/cancel")
        .send({
          appointmentId: id,
          reason: "Sickness"
        })
        .expect(404)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 404,
            message: `Appointment with appointment ID (${id}) not found`
          });
        });
    });
  });

  describe("Attempting to cancel appointment that has already been cancelled", () => {
    it("Response with 500 status code", async () => {
      const appointmentDetails = {
        startTime: `${workingDay} 09:00`,
        endTime: `${workingDay} 11:00`,
        name: "John Doe",
        phone: "+358507279900",
        email: "johndoe@gmail.com",
        service: "Kotiapu"
      };
      const newAppointment = new Appointment(appointmentDetails);
      const savedAppointment = await newAppointment.save();
      savedAppointment.status = "cancelled";
      await savedAppointment.save();
      await server
        .post("/api/v1/appointment/cancel")
        .send({
          appointmentId: savedAppointment.appointmentId,
          reason: "Sickness"
        })
        .expect(500)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: false,
            code: 500,
            message: "Appointment already cancelled"
          });
        });
    });
  });
  afterEach(async () => {
    try {
      await Appointment.deleteMany({});
      await mongoose.disconnect();
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  });
});
