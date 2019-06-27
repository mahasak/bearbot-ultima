import * as functions from "firebase-functions";
import * as crypto from "crypto";
import { IWebhookRule } from "./IWebhookRule";

export class verifyRequestRule implements IWebhookRule {
    name(): string {
        return "EmptyRule";
    }

    public terminator(): boolean { return false; }

    pass(req: functions.Request, res: functions.Response): boolean {
        return true;
    }

    execute(req: functions.Request, res: functions.Response): void {
        const appsecret: string = (process.env.appsecret as string);
        const [algorithm, signature] = ((req.headers["x-hub-signature"] as string) || "").split("=");
        if (!signature) {
            console.log("couldn't validate the request signature, the 'x-hub-signature' header not found");
            throw new Error("couldn't validate the request signature, the 'x-hub-signature' header not found");
        }
        const buf = req.body;
        if (signature !== crypto.createHmac(algorithm, appsecret).update(buf).digest("hex")) {
            console.log("request's signature is not valid");
            throw new Error("request's signature is not valid");
        }
    }

    static getInstance(): IWebhookRule {
        return new verifyRequestRule();
    }
}
/*
private verifyRequest: (req: express.Request, res: express.Response, buf: Buffer, encoding: string) => void = (req: express.Request, res: express.Response, buf: Buffer, encoding: string) => {

    

    

    

    logger.debug("request signature verified");
}

*/