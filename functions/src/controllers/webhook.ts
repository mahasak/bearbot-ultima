import { Request, Response } from 'firebase-functions';
import { VerifySubscriptionRule, DefaultRule } from "../rules";
import { IWebhookRule } from '../rules/IWebhookRule';
import {WebhookPipeline} from '../components/WebhookPipeline';

//const pipeline: IWebhookRule[] = [VerifySubscriptionRule.getInstance(), DefaultRule.getInstance()];
const pipeline = new WebhookPipeline([VerifySubscriptionRule.getInstance(), DefaultRule.getInstance()]);
export let webhook = (request: Request, response: Response) => pipeline.run(request, response)