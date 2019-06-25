import { Request, Response } from 'firebase-functions';
import { VerifySubscriptionRule, DefaultRule } from "../rules";
import { WebhookPipeline } from "../components/WebhookPipeline";

const pipelines = new WebhookPipeline([VerifySubscriptionRule.getInstance(), DefaultRule.getInstance()]);

export let webhook = (request: Request, response: Response) => pipelines.run(request, response)
