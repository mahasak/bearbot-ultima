import * as functions from "firebase-functions";

import { IWebhookRule } from "./IWebhookRule";

export class EmptyRule implements IWebhookRule {
    name(): string {
        return "EmptyRule";
    }

    public terminator(): boolean { return true; }

    pass(req: functions.Request, res: functions.Response): boolean {
        return true;
    }

    execute(req: functions.Request, res: functions.Response): void {
        res.status(200).send("Empty Rule")
    }

    static getInstance(): IWebhookRule {
        return new EmptyRule();
    }
}