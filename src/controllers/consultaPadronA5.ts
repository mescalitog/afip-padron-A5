import * as express from "express";
import { CacheLogin } from "./../cache-login";
import { PersonaServiceA5 } from "afip-apis";
import config from "./../config/config";

interface IPayload {
  cuit: number;
}

export let index: express.RequestHandler = (req: express.Request, res: express.Response) => {

  const payload: IPayload = req.body;
  const DEFAULT_URLWSAAWSDL: string = "https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL";

  const cacheLogin: CacheLogin = CacheLogin.Instance;
  cacheLogin.certificateKey = config.certificateKey;
  cacheLogin.certificatePath = config.certificate;
  cacheLogin.wsaawsdl = DEFAULT_URLWSAAWSDL;

  const personaServiceA5: PersonaServiceA5 = new PersonaServiceA5("https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5");

  personaServiceA5.dummy({})
    .then(r => {
      if (r && r.return
        && r.return.appserver === "OK"
        && r.return.dbserver === "OK"
        && r.return.authserver === "OK") {
        return cacheLogin.getTicket(PersonaServiceA5.serviceId)
          .then(ticket => {
            return personaServiceA5.getPersona(
              {
                token: ticket.credentials.token,
                sign: ticket.credentials.sign,
                cuitRepresentada: 20220536999,
                idPersona: payload.cuit
              })
              .then(persona => {
                return res.render("consulta", {
                  title: "Consulta Padron A5",
                  data: persona
                });
              });
          });
      } else {
        let msg = "El servicio no esta operativo.";
        msg = msg + ((r && r.return) ? ` appserver:${r.return.appserver}, dbserver: ${r.return.dbserver}, authserver: ${r.return.authserver}` : "");
        req.flash("errors", msg);
        return res.redirect("/");
      }
    })
    .catch(err => {
      console.error(err);
      req.flash("errors", "Ocurrió un error inesperado accediento a los servicios.");
      return res.redirect("/");
    });
};
