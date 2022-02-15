import * as fs from "fs";
import { LoginTicket, ILoginTicketResponse } from "afip-apis";
import moment from "moment";
import * as path from "path";

const DEFAULT_CERTIFICATE: string = "./private/certificate/certificate.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/private.key";
const DEFAULT_URLWSAAWSDL: string = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL";
const TICKET_PATH: string = "./cache/";

export class CacheLogin {
    private static _instance: CacheLogin;
    private loginTicket: LoginTicket;
    private _tickets: { [serviceId: string]: ILoginTicketResponse } = {};

    private _certificatePath: string = DEFAULT_CERTIFICATE;
    private _certificateKey: string = DEFAULT_CERTIFICATE_KEY;
    private _wsaawsdl: string = DEFAULT_URLWSAAWSDL;

    get certificatePath(): string {
        return this._certificatePath;
    }
    set certificatePath(path: string) {
        this._certificatePath = path;
    }

    get certificateKey(): string {
        return this._certificateKey;
    }
    set certificateKey(key: string) {
        this._certificateKey = key;
    }

    get wsaawsdl(): string {
        return this._wsaawsdl;
    }
    set wsaawsdl(url: string) {
        this._wsaawsdl = url;
    }

    constructor() {
        this.loginTicket = new LoginTicket();
    }

    public static get instance(): CacheLogin {
        if (!CacheLogin._instance) {
            CacheLogin._instance = new CacheLogin();
        }
        return CacheLogin._instance;
    }

    private checkFolder(pathToCheck: string) {
        const _pathToCheck = path.dirname(pathToCheck);
        if (fs.existsSync(_pathToCheck)) {
            return;
        }
        fs.mkdirSync(_pathToCheck);
    }
    private login(serviceId: string): Promise<ILoginTicketResponse> {
        return this.loginTicket.wsaaLogin(serviceId, this._wsaawsdl, this._certificatePath, this._certificateKey)
            .then(ticket => {
                try {
                    this.checkFolder(TICKET_PATH);
                    fs.writeFileSync(`${TICKET_PATH}${serviceId}-ticket.json`, JSON.stringify(ticket));
                } catch (err) {
                    return Promise.reject(err);
                }
                return Promise.resolve(ticket);
            });
    }

    /*
     * Devuelve el ticket de autenticacion
     * @param serviceId identificador del servicio
     * @returns Promise con el ticket
     */
    public getTicket = (serviceId: string): Promise<ILoginTicketResponse> => {
        let ticket = this._tickets[serviceId];
        const now = new Date();
        const promise = new Promise<ILoginTicketResponse>((resolve: Function, reject: Function) => {
            // Memoria
            if (ticket && moment(ticket.header.expirationTime).isSameOrAfter(moment())) {
                return resolve(ticket);
            }
            // Archivo
            const ticketPath = `${TICKET_PATH}${serviceId}-ticket.json`;
            if (fs.existsSync(ticketPath)) {
                try {
                    const s = fs.readFileSync(`${TICKET_PATH}${serviceId}-ticket.json`, "utf8");
                    ticket = JSON.parse(s);
                } catch (err) {
                }
            }
            if (ticket && moment(ticket.header.expirationTime).isSameOrAfter(moment())) {
                return resolve(ticket);
            }
            // Genero
            return this.login(serviceId)
                .then(ticket => resolve(ticket))
                .catch(err => reject(err));
        });
        return promise;
    };
}



