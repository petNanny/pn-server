import supertest from "supertest";
import { app } from "../app";
import env from "../util/validateEnv";
import mongoose from "mongoose";
import PetSitter from "../models/PetSitterModel";
import PetOwner from "../models/PetOwnerModel";
import Attachment from "../models/AttachmentModel";
import * as path from "path";
import * as fs from "fs";

beforeEach(async () => {
  jest.setTimeout(60000);
  await mongoose.connect(env.MONGO_CONNECTION_STRING_TEST_DB);
});

afterEach(async () => {
  await PetOwner.deleteMany();
  await PetSitter.deleteMany();
  await mongoose.disconnect();
});

describe("Get all pet sitters", () => {
  it("returns status code 200, blank data, currentPage is 2 and number of Page is 0", async () => {
    const res = await supertest(app).get("/api/petSitters?page=2");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ data: [], currentPage: 2, numberOfPage: 0 });
  });

  it("returns status code 200, blank data, currentPage is 2 and number of Page is 1", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
    const petOwnerId = petOwner.body._id;
    //create a pet sitter info, by using pet owner id
    await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    const res = await supertest(app).get("/api/petSitters?page=2");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ data: [], currentPage: 2, numberOfPage: 1 });
  });
});

describe("Get one pet sitters by id", () => {
  it("returns status code 400, when use Invalid pet sitter id", async () => {
    const res = await supertest(app).get("/api/petSitters/63f30d611a7a5ecead0b7a1");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid pet sitter id." });
  });

  it("returns status code 200, when use valid pet sitter id", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
    const petOwnerId = petOwner.body._id;
    //create a pet sitter info, by using pet owner id
    const petSitter = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    const petSitterId = petSitter.body.petSitterFullInfo._id;
    const res = await supertest(app).get(`/api/petSitters/${petSitterId}`);
    expect(res.statusCode).toEqual(200);
  });
});

describe("Create one pet sitter by using pet owner id", () => {
  it("returns status code 400, when use Invalid pet owner id", async () => {
    const res = await supertest(app).get("/api/petSitters/63f30d611a7a5ecead0b7a1");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid pet sitter id." });
  });

  it("returns status code 409, when create by using registered pet owner id", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
    const petOwnerId = petOwner.body._id;
    //create a pet sitter info, by using pet owner id
    const petSitter = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    const res = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    expect(res.statusCode).toEqual(409);
  });

  it("returns status code 200, when use valid pet owner id", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
    const petOwnerId = petOwner.body._id;
    //create a pet sitter info, by using pet owner id
    const petSitter = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    expect(petSitter.statusCode).toEqual(201);
  });
});

describe("Update one pet sitter by using pet sitter id", () => {
  it("returns status code 400, by using invalid pet sitter id", async () => {
    const res = await supertest(app).post(
      "/api/petSitters/updatePetSitter/63f30d611a7a5ecead0b7a1"
    );
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid pet sitter id." });
  });

  it("returns status code 200, when update pet sitter info successful", async () => {
    const registerData = {
      firstName: "shawn",
      lastName: "wang",
      password: "123",
      email: "shawn@gmail.com",
    };
    const updatePetSitterData = { abn: "123456789" };
    const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
    const petOwnerId = petOwner.body._id;
    //create a pet sitter info, by using pet owner id
    const petSitter = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
    const petSitterId = petSitter.body.petSitterFullInfo._id;
    const res = await supertest(app)
      .post(`/api/petSitters//updatePetSitter/${petSitterId}`)
      .send(updatePetSitterData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.updatePetSitter.abn).toEqual("123456789");
  });
});

describe("pet sitter upload image by using pet sitter id", () => {
  // const testPetSitterId = "6400451574a37ae610ab7cbb";
  // const testImage1FilePath = path.join(__dirname, "./assets/test_image1.jpg");
  // const testImage2FilePath = path.join(__dirname, "./assets/test_image2.jpg");
  // const testImage3FilePath = path.join(__dirname, "./assets/test_image3.jpg");
  // const testImageData1 = fs.readFileSync(testImage1FilePath);
  // const testImageData2 = fs.readFileSync(testImage2FilePath);
  // const testImageData3 = fs.readFileSync(testImage3FilePath);
  // it("returns status code 400, by using invalid pet sitter id", async () => {
  //   const res = await supertest(app).post(
  //     "/api/petSitters/upload/6400451574a37ae610ab7c"
  //   );
  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body).toEqual({ error: "Invalid pet sitter id." });
  // });
  // it("returns status code 200, ", async () => {
  //   const registerData = {
  //     firstName: "tong",
  //     lastName: "lin",
  //     password: "1111",
  //     email: "tong123@test.com",
  //   };
  //   const petOwner = await supertest(app).post("/api/auth/register").send(registerData);
  //   const petOwnerId = petOwner.body._id;
  //   const petSitter = await supertest(app).post(`/api/petSitters/createPetSitter/${petOwnerId}`);
  //   const petSitterId = petSitter.body.petSitterFullInfo._id;
  //   // const res = await supertest(app).get(`/api/petSitters/${petSitterId}`);
  //   const res = await supertest(app).post(
  //         `/api/petSitters/upload/${petSitterId}a`
  //       );
  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body).toEqual({ error: "Invalid pet sitter id." });
  // })
});
