import app from "../app";
import supertest from "supertest";
import { describe, it } from "mocha";
import assert from "assert";

const server = supertest(app);

describe("Contact Us:", () => {
  describe("Contact request with invalid input data(Phone number)", () => {
    it("Response with status code 400", async () => {
      await server
        .post("/api/v1/contact-us")
        .send({
          name: "John Does",
          phone: "04903847492",
          email: "johndoe@gmail.com",
          message: "Hello world"
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

  describe("Contact request with valid input data", () => {
    it("Response with status code 201", async () => {
      await server
        .post("/api/v1/contact-us")
        .send({
          name: "John Does",
          phone: "+358503158872",
          email: "johndoe@gmail.com",
          message: "Hello world"
        })
        .expect(201)
        .expect((res) => {
          assert.deepEqual(res.body, {
            success: true,
            status: 201,
            data: {
              message: "Your message has been sent and we will reach out soon."
            }
          });
        });
    });
  });
});
