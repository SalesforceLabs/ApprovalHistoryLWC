# @salesforce/wire-service-jest-util

A utility so Lightning Web Component unit tests can control the data provisioned with `@wire`.

## Basic Example

Assume you have a component like this.

```js
import { LightningElement, wire } from 'lwc';
import { getTodo } from 'x/todoApi';
export default class MyComponent extends LightningElement {
    @wire(getTodo, {id: 1})
    todo
}
```

You'd like to test the component's handling of `@wire` data and errors. This test utility makes it trivial.

 ```js
import { createElement } from 'lwc';
import { registerTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MyComponent from 'x/myComponent';

// adapter identifier used by the component under test
import { getTodo } from 'x/todoApi';

// **IMPORTANT** call the register API before creating the component under test
// register a test wire adapter to control @wire(getTodo)
const getTodoWireAdapter = registerTestWireAdapter(getTodo);

describe('@wire demonstration test', () => {

    // disconnect the component to reset the adapter. it is also
    // a best practice to cleanup after each test.
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('handles receiving data', () => {
        // arrange: insert component, with @wire(getTodo), into DOM
        const LightningElement = createElement('x-my-component', { is: MyComponent });
        document.body.appendChild(LightningElement);

        // act: have @wire(getTodo) provision a value
        const data = { 'userId': 1, 'id': 1, 'title': 'delectus aut autem', 'completed': false };
        getTodoWireAdapter.emit(data);

        // assert: verify component behavior having received @wire(getTodo)
    });
});
```

## Overview

The utility works by allowing component unit tests to register a wire adapter for an arbitrary identifier. Registration returns a test adapter which has the ability to emit data and get the last resolved `@wire` configuration.

### Adapter Types

There are three flavors of test adapters: Lightning Data Service (LDS), Apex, and generic. All allow test authors to emit data through the wire. The main difference is that the LDS and Apex wire adapters follow certain patterns that are automatically handled by the test adapters. These patterns include the shape in which data and errors are emitted, and an initial object emitted during registration. The generic test adapter directly emits any data passed to it. See the API section below for more details.

## API

```js
/**
 * Registers a wire adapter that mimics Lightning Data Service (LDS) adapters behavior,
 * and emitted data and error shapes. For example, the emitted shape is
 * `{ data: object|undefined, error: FetchResponse|undefined}`.
 */
registerLdsTestWireAdapter(identifier: any): LdsTestWireAdapter;

interface LdsTestWireAdapter {
    /** Emits data. */
    emit(value: object): void;

    /**
     * Emits an error. By default this will emit a resource not found error.
     *
     * `{
     *       ok: false,
     *       status: 404,
     *       statusText: "NOT_FOUND",
     *       body: [{
     *           errorCode: "NOT_FOUND",
     *           message: "The requested resource does not exist",
     *       }]
     *  }`
     */
    error(body?: any, status?: number, statusText?: string): void;

    /**
     * Gets the last resolved config. Useful if component @wire uses includes
     * dynamic parameters.
     */
    getLastConfig(): object;
}

interface FetchResponse {
    body: any,
    ok: false,
    status: number,
    statusText: string,
}

/**
 * Registers a wire adapter that connects to an Apex method and provides APIs
 * to emit data and errors in the expected shape. For example, the emitted shape
 * is `{ data: object|undefined, error: FetchResponse|undefined}`.
 */
registerApexTestWireAdapter(identifier: any): ApexTestWireAdapter;

interface ApexTestWireAdapter {
    /** Emits data. */
    emit(value: object): void;

    /**
     * Emits an error. By default this will emit a resource not found error.
     *
     * `{
     *       ok: false,
     *       status: 400,
     *       statusText: "Bad Request",
     *       body: {
     *           message: "An internal server error has occurred",
     *       }
     *  }`
     */
    error(body?: any, status?: number, statusText?: string): void;

    /**
     * Gets the last resolved config. Useful if component @wire uses includes
     * dynamic parameters.
     */
    getLastConfig(): object;
}

interface FetchResponse {
    body: any,
    ok: false,
    status: number,
    statusText: string,
}

/**
 * Registers a generic wire adapter for the given identifier. Emitted values may be of
 * any shape.
 */
registerTestWireAdapter(identifier: any): TestWireAdapter;

interface TestWireAdapter {
    /** Emits any value of any shape. */
    emit(value: any): void;

    /**
     * Gets the last resolved config. Useful if component @wire uses includes
     * dynamic parameters.
     */
    getLastConfig(): object
}
```
