import request from "supertest";
import app from "../src/app";


describe("POST /", () => {
  it("debe devolver 200 OK o 302 si no hay certificado", (done) => {
    request(app).post("/")
      .field("cuit", "33693450239")
      .expect(function (res: any) {
        if (!(res.status === 200 || res.status === 302)) done(new Error("Estado incorrecto"));
      })
      .end(done);
  });
});