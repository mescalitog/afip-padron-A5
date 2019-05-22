import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it("debe devolver 200 OK", (done) => {
    request(app).get("/")
      .expect(200, done);
  });
});
