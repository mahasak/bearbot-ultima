import { Request, Response } from 'firebase-functions';
import { VerifySubscriptionRule, DefaultRule } from "../rules";
import { IWebhookRule } from '../rules/IWebhookRule';

const pipeline: IWebhookRule[] = [VerifySubscriptionRule.getInstance(), DefaultRule.getInstance()];

export let webhook = (request: Request, response: Response) => { 
    let executed: boolean = false;

    pipeline.forEach(rule => {
        if(!executed && rule.pass(request, response)){
            rule.execute(request, response);
            executed = true;
        }
    });
}
