import * as functions from 'firebase-functions';

export interface IWebhookRule {
    name(): string;
    terminator():boolean;
    pass(request: functions.Request, response: functions.Response): boolean;
    execute(request: functions.Request, response: functions.Response): void;
}