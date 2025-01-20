/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import sinon from 'sinon';
import { beforeEach, afterEach } from 'mocha';
import getStore, { counterActions, rootReducer } from './helpers/store';
import middleware from '../src/dispatch';
import {createInstanceProvider, shutdownInstanceProvider} from './helpers/provider';
import * as spanFactory from '../src/utils/spanFactory';
import {Attributes} from "@opentelemetry/api";
import noopMiddleware from "./helpers/noopMiddleware";
import {TestSpanExporter} from "./helpers/exporter";
import {configureStore, Tuple} from "@reduxjs/toolkit";


describe('dispatch.ts', () => {
  const sandbox = sinon.createSandbox();
  let mockConsoleInfo: sinon.SinonSpy;
  let exporter: TestSpanExporter;

  const verifySpans = (expected: object[]) => {
    sandbox.assert.match(exporter.exportedSpans.map(span => ({
      name: span.name,
      attributes: span.attributes,
    })), expected);
  };

  beforeEach(() => {
    exporter = new TestSpanExporter();
    mockConsoleInfo = sandbox.spy(console, 'info');
  });

  afterEach(async () => {
    sandbox.restore();
    await shutdownInstanceProvider();
    if (exporter) {
      await exporter.shutdown();
    }
  });

  it('should not post console messages if debug mode is disabled', () => {
    const store = getStore(exporter);
    mockConsoleInfo.resetHistory()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    middleware(undefined, { debug: false })(store);
    sandbox.assert.notCalled(mockConsoleInfo);
  });

  it('should use the custom provider and custom configurations to apply to the middleware', () => {
    const provider = createInstanceProvider(exporter);
    const getTracerSpy = sandbox.spy(provider, 'getTracer');
    const spanStartSpy = sandbox.spy(spanFactory, 'spanStart');
    const spanEndSpy = sandbox.spy(spanFactory, 'spanEnd');
    const store = configureStore({
      reducer: rootReducer,
      middleware: () => new Tuple(middleware(provider, {
        debug: true,
        name: 'redux-action',
        attributeTransform: (attrs: Attributes) => ({
          ...attrs,
          version: '1.1.1'
        }),
      })),
    });

    sandbox.assert.calledWith(
      mockConsoleInfo,
      'TracerProvider. Using custom tracer.'
    );

    sandbox.assert.calledWith(
      getTracerSpy,
      '@opentelemetry/instrumentation-react-native-redux',
      '0.1.0'
    );

    store.dispatch(counterActions.decrease(1));

    // calling the start span function
    sandbox.assert.calledWith(spanStartSpy, sandbox.match.any, 'redux-action', {
      attributes: {
        version: '1.1.1',
        'action.type': 'COUNTER_DECREASE:normal',
        'action.payload': '{"count":1}',
        'action.outcome': 'incomplete',
      },
    });

    // calling the end span function
    sandbox.assert.calledOnce(spanEndSpy);

    // output of the span exporter
    verifySpans([{
      name: 'redux-action',
      attributes: {
        version: '1.1.1',
        'action.type': 'COUNTER_DECREASE:normal',
        'action.state': 'background',
        'action.payload': '{"count":1}',
        'action.outcome': 'success',
      },
    }]);
  });

  it('should track an action and create the corresponding span', () => {
    const store = getStore(exporter);

    store.dispatch(counterActions.increase(3));
    verifySpans([{
      name: 'action',
      attributes: {
        'action.type': 'COUNTER_INCREASE:slow',
        'action.state': 'background',
        'action.payload': '{"count":3}',
        'action.outcome': 'success',
      },
    }]);

    exporter.reset();
    store.dispatch(counterActions.decrease(1));
    verifySpans([{
      name: 'action',
      attributes: {
        'action.type': 'COUNTER_DECREASE:normal',
        'action.state': 'background',
        'action.payload': '{"count":1}',
        'action.outcome': 'success',
      },
    }]);
  });

  it('should handle an action that fails', () => {
    try {
      getStore(exporter).dispatch(counterActions.decrease(42));
    } catch (e) {}

    verifySpans([{
      name: 'action',
      attributes: {
        'action.type': 'COUNTER_DECREASE:normal',
        'action.state': 'background',
        'action.payload': '{"count":42}',
        'action.outcome': 'fail',
      },
    }]);
  });

  it('should handle another middleware being added to the chain', () => {
    const provider = createInstanceProvider(exporter);
    const store = configureStore({
      reducer: rootReducer,
      middleware: () => new Tuple(middleware(provider)).concat(noopMiddleware()),
    });

    store.dispatch(counterActions.increase(1));

    verifySpans([{
      name: 'action',
      attributes: {
        'action.type': 'COUNTER_INCREASE:slow',
        'action.state': 'background',
        'action.payload': '{"count":1}',
        'action.outcome': 'success',
      },
    }]);

    // The slow action should take at least 1000ms, make sure that we still record this duration correctly
    // when there's another middleware in the way
    sandbox.assert.match(exporter.exportedSpans[0].duration[1] >= 1, true);
  });
});
