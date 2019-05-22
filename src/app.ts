import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import fs from "fs";
import * as bodyParser from "body-parser";
import config from "./config/config";
import * as homeController from "./controllers/home";
import * as consultaController from "./controllers/consultaPadronA5";

//
if (!fs.existsSync(config.certificate) || !fs.existsSync(config.certificateKey)) {
  console.error(`Falta el certificado en ${config.certificate} o la clave en ${config.certificate}`);
  process.exit(1);
}

// server Express
const app: express.Application = express();

// configuracion de express
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "itstuff.com.ar",
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// rutas
app.get("/", homeController.index);
app.post("/", consultaController.index);

export default app;