import { Request, Response } from 'firebase-functions';
import { IWebhookRule } from "../rules/IWebhookRule";
import { EmptyRule } from "../rules/EmptyRule";

export class WebhookPipeline implements Iterator<IWebhookRule> {
    private pointer = 0;

    public run(request: Request, response: Response): IWebhookRule {
        let executedRule: IWebhookRule = EmptyRule.getInstance();
        let executed = false;

        this.pipeline.forEach(rule => {
            if(!executed && rule.pass(request, response)){
                if (rule.terminator()) {
                    executedRule = rule;
                    executed = true;
                }
                rule.execute(request, response);
            }
        });

        return executedRule;
    }

    constructor(public pipeline: IWebhookRule[]) { }

    public next(): IteratorResult<IWebhookRule> {
        if (this.pointer < this.pipeline.length) {
            return {
                done: false,
                value: this.pipeline[this.pointer++]
            }
        } else {
            return {
                done: true,
                value: new EmptyRule()
            }
        }
    }

    [Symbol.iterator](): IterableIterator<IWebhookRule> {
        return this;
    }

    public execute(request: Request, response: Response) {
        let rule = this.next();

        while (true) {
            console.log(typeof rule)
            if (rule.value.pass(request, response)) {
                rule.value.execute(request, response);
            }
            rule = this.next();
        }
    }
}