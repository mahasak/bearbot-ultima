var httpMocks       = require('node-mocks-http');

import { WebhookPipeline } from "../components/WebhookPipeline";
import { MockWebhookRule } from "../mocks/rules/MockWebhookRule";
import { EmptyRule } from "../rules";

test("Should execute first rule", () => {

    let rule1 = new MockWebhookRule("Rule #1", true );
    let rule2 = new MockWebhookRule("Rule #2", true);
    let pipeline = new WebhookPipeline([rule1, rule2]);

    var request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    var response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule1.name());
})

test("Should execute second rule", () => {

    let rule1 = new MockWebhookRule("Rule #1", false );
    let rule2 = new MockWebhookRule("Rule #2", true);
    let rule3 = new MockWebhookRule("Rule #3", true);

    let pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    var request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    var response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule2.name());
})

test("Should execute third rule", () => {

    let rule1 = new MockWebhookRule("Rule #1", false );
    let rule2 = new MockWebhookRule("Rule #2", false);
    let rule3 = new MockWebhookRule("Rule #3", true);

    let pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    var request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    var response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(rule3.name());
})

test("Should execute empty rule", () => {

    let rule1 = new MockWebhookRule("Rule #1", false );
    let rule2 = new MockWebhookRule("Rule #2", false);
    let rule3 = new MockWebhookRule("Rule #3", false);
    let emptyRule = new EmptyRule();

    let pipeline = new WebhookPipeline([rule1, rule2, rule3]);

    var request = httpMocks.createRequest({
        method: 'GET',
        url: `/users/123`,
        params: {
            uid: '123'
        }
    });
    var response = httpMocks.createResponse();


    const result = pipeline.run(request, response);
    expect(result.name()).toBe(emptyRule.name());
})