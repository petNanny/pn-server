import supertest from "supertest";
import { app } from "../app";

describe("users", () => {
  describe("get user route", () => {
    describe("given the product does not exist", () => {
      it("should return a 404", async () => {
        const userId = "user-123";
        await supertest(app).get(`/api/users/${userId}`).expect(400);
      });
    });
  });
});
