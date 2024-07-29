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
import store, { counterActions } from './helper/store';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';

describe('middleware.ts', () => {
  const sandbox = sinon.createSandbox();
  let mockConsoleDir: sinon.SinonSpy;

  beforeEach(() => {
    mockConsoleDir = sandbox.spy(console, 'dir');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should track an action and create the corresponding span', async () => {
    store.dispatch(counterActions.increase(5));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'redux-action',
        id: sandbox.match.string,
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        attributes: { 'action.state': 'background' },
        events: [
          {
            name: 'dispatch',
            attributes: { type: 'COUNTER_INCREASE' },
            time: [sandbox.match.number, sandbox.match.number],
            droppedAttributesCount: sandbox.match.number,
          },
        ],
      }),
      sandbox.match({ depth: sandbox.match.number })
    );

    store.dispatch(counterActions.decrease(2));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'redux-action',
        traceId: sandbox.match.string,
        attributes: { 'action.state': 'background' },
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        events: [
          {
            name: 'dispatch',
            attributes: { type: 'COUNTER_DECREASE' },
            time: [sandbox.match.number, sandbox.match.number],
            droppedAttributesCount: sandbox.match.number,
          },
        ],
      }),
      sandbox.match({ depth: sandbox.match.number })
    );

    sandbox.assert.match(store.getState(), { counter: { count: 3 } });
  });

  it('should work as expected when there is a component firing actions', () => {
    const screen = render(
      <Provider store={store}>
        <Pressable
          onPress={() => {
            store.dispatch(counterActions.increase(3));
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Text>Increase</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            store.dispatch(counterActions.decrease(1));
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Text>Decrease</Text>
        </Pressable>
      </Provider>
    );

    fireEvent.click(screen.getByText('Increase'));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'redux-action',
        id: sandbox.match.string,
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        attributes: { 'action.state': 'background' },
        events: [
          {
            name: 'dispatch',
            attributes: { type: 'COUNTER_INCREASE' },
            time: [sandbox.match.number, sandbox.match.number],
            droppedAttributesCount: sandbox.match.number,
          },
        ],
      }),
      sandbox.match({
        depth: sandbox.match.number,
      })
    );

    fireEvent.click(screen.getByText('Decrease'));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'redux-action',
        id: sandbox.match.string,
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        attributes: { 'action.state': 'background' },
        events: [
          {
            name: 'dispatch',
            attributes: { type: 'COUNTER_DECREASE' },
            time: [sandbox.match.number, sandbox.match.number],
            droppedAttributesCount: sandbox.match.number,
          },
        ],
      }),
      sandbox.match({
        depth: sandbox.match.number,
      })
    );
  });
});
