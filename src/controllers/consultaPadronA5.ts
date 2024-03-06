/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from "express";
import { CacheLogin } from "./../cache-login";
import { PersonaServiceA5 } from "afip-apis";
import config from "./../config/config";
import { IdummyOutput } from "afip-apis/dist/lib/services/wsdl/PersonaServiceA5/PersonaServiceA5Port";

interface IPayload {
    cuit: number;
}

export const index: express.RequestHandler = (req: express.Request, res: express.Response) => {

    const payload: IPayload = req.body;
    const cacheLogin: CacheLogin = cacheData();
    const personaServiceA5: PersonaServiceA5 = new PersonaServiceA5(config.urlPersonaServiceA5);

    personaServiceA5.dummy({})
        .then(r => {
            if (checkDummyStatus(r)) {
                return cacheLogin.getTicket(PersonaServiceA5.serviceId)
                    .then(ticket => getPersona({ personaServiceA5, ticket, payload, res }));
            } else {
                return handleNoOperational(r, req, res);
            }
        })
        .catch(err => handleError(err, req, res));
};

function getPersona({ personaServiceA5, ticket, payload, res }: { personaServiceA5: PersonaServiceA5; ticket: any; payload: IPayload; res: express.Response }): void | PromiseLike<void> {
    return personaServiceA5.getPersona({
        token: ticket.credentials.token,
        sign: ticket.credentials.sign,
        cuitRepresentada: config.cuitRepresentada,
        idPersona: payload.cuit
    })
        .then(persona => res.render("consulta", {
            title: "Consulta Padron A5",
            data: persona
        }
        ));
}

function cacheData() {
    const cacheLogin: CacheLogin = CacheLogin.instance;
    cacheLogin.certificateKey = config.certificateKey;
    cacheLogin.certificatePath = config.certificate;
    cacheLogin.wsaawsdl = config.urlwsaa;
    return cacheLogin;
}

function handleError(err: any, req: express.Request, res: express.Response) {
    console.error(err);
    req.flash("errors", "Ocurrió un error inesperado accediendo a los servicios.");
    return res.redirect("/");
}

function handleNoOperational(r: IdummyOutput, req: express.Request, res: express.Response) {
    let msg = "El servicio no esta operativo.";
    msg = msg + ((r && r.return) ? ` appserver:${r.return.appserver}, dbserver: ${r.return.dbserver}, authserver: ${r.return.authserver}` : "");
    req.flash("errors", msg);
    return res.redirect("/");
}

function checkDummyStatus(r: IdummyOutput) {
    return r && r.return
        && r.return.appserver === "OK"
        && r.return.dbserver === "OK"
        && r.return.authserver === "OK";
}

