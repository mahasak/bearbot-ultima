const httpMocks       = require('node-mocks-http');

import { WebhookPipeline } from "../components/WebhookPipeline";
import { MockWebhookRule } from "../mocks/rules/MockWebhookRule";
import { EmptyRule } from "../rules";

test("Should execute first rule", () => {

    const rule1 = new MockWebhookRule("Rule #1", true ,true);
    const rule2 = new MockWebhookRule("Rule #2", true, true);
    const pipeline = new WebhookPipeline([rule1, rule2]);

    const request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    const response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule1.name());
})

test("Should execute second rule", () => {

    const rule1 = new MockWebhookRule("Rule #1", false, true );
    const rule2 = new MockWebhookRule("Rule #2", true, true);
    const rule3 = new MockWebhookRule("Rule #3", true, true);

    const pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    const request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    const response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule2.name());
})

test("Should execute third rule", () => {

    const rule1 = new MockWebhookRule("Rule #1", false, true );
    const rule2 = new MockWebhookRule("Rule #2", false, true);
    const rule3 = new MockWebhookRule("Rule #3", true, true);

    const pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    const request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    const response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule3.name());
})

test("Should execute empty rule", () => {

    const rule1 = new MockWebhookRule("Rule #1", false, true);
    const rule2 = new MockWebhookRule("Rule #2", false, true);
    const rule3 = new MockWebhookRule("Rule #3", false, true);
    const emptyRule = new EmptyRule();

    const pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    const request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    const response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(emptyRule.name());
})

test("Should terminate at rule 2", () => {

    const rule1 = new MockWebhookRule("Rule #1", true, false);
    const rule2 = new MockWebhookRule("Rule #2", true, true);
    const rule3 = new MockWebhookRule("Rule #3", true, true);

    const pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    const request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    const response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule2.name());
})