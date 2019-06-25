import { Request, Response } from 'firebase-functions';
import { IWebhookRule } from "../rules/IWebhookRule";
import { EmptyRule } from "../rules/EmptyRule";

export class WebhookPipeline implements Iterator<IWebhookRule> {
    private pointer = 0;

    constructor(public rules: IWebhookRule[]) { }

    public next(): IteratorResult<IWebhookRule> {
        if (this.pointer < this.rules.length) {
            return {
                done: false,
                value: this.rules[this.pointer++]
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

    public run(request: Request, response: Response) {
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