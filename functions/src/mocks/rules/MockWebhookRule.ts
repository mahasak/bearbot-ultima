import * as functions from "firebase-functions";

import { IWebhookRule } from "../../rules/IWebhookRule";

export class MockWebhookRule implements IWebhookRule {
    private status: boolean;
    private module_name: string;
    private is_terminator: boolean;

    constructor(name: string, pass: boolean, terminator: boolean) {
        this.status = pass;
        this.module_name = name;
        this.is_terminator = terminator;
    }

    public terminator(): boolean { return this.is_terminator; }

    name(): string {
        return this.module_name;
    }

    pass(req: functions.Request, res: functions.Response): boolean {
        return this.status;
    }

    execute(req: functions.Request, res: functions.Response): void {
        res.status(200).send(this.module_name);
    }

    static getInstance(): IWebhookRule {
        return new MockWebhookRule("MockRule", false, false);
    }
}

