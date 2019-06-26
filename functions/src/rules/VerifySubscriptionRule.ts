import * as functions from "firebase-functions";

import { RuleConstants } from "./RuleConstants";
import { IWebhookRule } from "./IWebhookRule";

export class VerifySubscriptionRule implements IWebhookRule {
    name(): string {
        return "VerifySubscriptionRule";
    }
    
    public pass(req: functions.Request, res: functions.Response): boolean {
        return (req.query['hub.mode'] === 'subscribe');
    }

    public execute(req: functions.Request, res: functions.Response): void {
        if (req.query['hub.verify_token'] === RuleConstants.VERIFY_TOKEN) {
            console.log("Validating webhook")
            res.status(200).send(req.query['hub.challenge'])
        } else {
            console.error("Failed validation. Make sure the validation tokens match.")
            res.sendStatus(403)
        }
    }

    static getInstance(): IWebhookRule {
        return new VerifySubscriptionRule();
    }
}