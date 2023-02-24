import supertest from "supertest";
import { app } from "../app";
import env from "../util/validateEnv";
import mongoose from "mongoose";
import PetOwner from "../models/PetOwnerModel";

beforeEach(async () => {
  jest.setTimeout(60000);
  await mongoose.connect(env.MONGO_CONNECTION_STRING_TEST_DB);
});

afterEach(async () => {
  await PetOwner.deleteMany();
  await mongoose.disconnect();
});

// Pet owners register test
describe("sign up", () => {
  it("returns status code 400 if email missing", async () => {
    const res = await supertest(app).post("/api/auth/register").send({
      firstName: "shawn",
      lastName: "wang",
      userName: "sw86b",
      password: "123",
      phone: "0420123456",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 400 if firstName missing", async () => {
    const res = await supertest(app).post("/api/auth/register").send({
      lastName: "wang",
      userName: "sw86b",
      password: "123",
      email: "shawn@gmail.com",
      phone: "0420123456",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 400 if lastName missing", async () => {
    const res = await supertest(app).post("/api/auth/register").send({
      firstName: "shawn",
      userName: "sw86b",
      password: "123",
      email: "shawn@gmail.com",
      phone: "0420123456",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 400 if password missing", async () => {
    const res = await supertest(app).post("/api/auth/register").send({
      firstName: "shawn",
      lastName: "wang",
      userName: "sw86b",
      email: "shawn@gmail.com",
      phone: "0420123456",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 201 if register success", async () => {
    const newData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn.wang@gmail.com",
    };
    const res = await supertest(app).post("/api/auth/register").send(newData);
    expect(res.statusCode).toEqual(201);
  });

  it("returns status code 409 if register an email duplicate", async () => {
    const newData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    await supertest(app).post("/api/auth/register").send(newData);
    const res = await supertest(app).post("/api/auth/register").send(newData);
    expect(res.statusCode).toEqual(409);
    expect(res.body).toEqual({ message: "Duplicate email" });
  });
});

describe("login", () => {
  // login test
  it("returns status code 400 if login missing email", async () => {
    const newData = {
      email: "shawn@gmail.com",
    };
    const res = await supertest(app).post("/api/auth/login").send(newData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 400 if login missing password", async () => {
    const newData = {
      password: "123",
    };
    const res = await supertest(app).post("/api/auth/login").send(newData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "All fields are required" });
  });

  it("returns status code 200 if login success", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const loginData = {
      email: "shawn@gmail.com",
      password: "123",
    };
    await supertest(app).post("/api/auth/register").send(registerData);
    const res = await supertest(app).post("/api/auth/login").send(loginData);
    expect(res.statusCode).toEqual(200);
  });

  it("returns status code 200 if password error", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const loginData = {
      email: "shawn@gmail.com",
      password: "1234",
    };
    await supertest(app).post("/api/auth/register").send(registerData);
    const res = await supertest(app).post("/api/auth/login").send(loginData);
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });
});
