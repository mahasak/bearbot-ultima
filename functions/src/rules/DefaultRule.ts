import * as functions from "firebase-functions";

import { IWebhookRule } from "./IWebhookRule";

export class DefaultRule implements IWebhookRule {

    pass(req: functions.Request, res: functions.Response): boolean {
        return true;
    }

    execute(req: functions.Request, res: functions.Response): void {
        res.status(200).send("Default Rule")
    }

    static getInstance(): IWebhookRule {
        return new DefaultRule();
    }
}