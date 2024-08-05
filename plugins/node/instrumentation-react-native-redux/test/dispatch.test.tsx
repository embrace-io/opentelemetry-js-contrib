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
import { fireEvent, render } from '@testing-library/react';
import { Dispatch, MiddlewareAPI, UnknownAction } from 'redux';
import middleware from '../src/dispatch';
import { Provider } from 'react-redux';
import { Pressable, Text } from 'react-native';

describe('dispatch.ts', () => {
  const sandbox = sinon.createSandbox();
  let mockConsoleDir: sinon.SinonSpy;
  let mockConsoleInfo: sinon.SinonSpy;

  beforeEach(() => {
    mockConsoleDir = sandbox.spy(console, 'dir');
    mockConsoleInfo = sandbox.spy(console, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should post console messages if debug mode is enabled', () => {
    const result = middleware(undefined, { debug: true });

    // note: not worried about the redux implementation here.
    result(null as unknown as MiddlewareAPI<Dispatch<UnknownAction>, unknown>);

    sandbox.assert.calledWith(
      mockConsoleInfo,
      'No TracerProvider found. Using global tracer instead.'
    );
  });

  it('should not post console messages if debug mode is disabled', () => {
    const result = middleware(undefined, { debug: false });

    // note: not worried about the redux implementation here.
    result(null as unknown as MiddlewareAPI<Dispatch<UnknownAction>, unknown>);

    sandbox.assert.notCalled(mockConsoleInfo);
  });

  it('should track an action and create the corresponding span', () => {
    const handleIncrease = () => {
      store.dispatch(counterActions.increase(3));
    };

    const handleDecrease = () => {
      store.dispatch(counterActions.decrease(1));
    };

    const screen = render(
      <Provider store={store}>
        <Pressable onPress={handleIncrease}>
          <Text>Increase</Text>
        </Pressable>

        <Pressable onPress={handleDecrease}>
          <Text>Decrease</Text>
        </Pressable>
      </Provider>
    );

    fireEvent.click(screen.getByText('Increase'));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'action',
        id: sandbox.match.string,
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        attributes: {
          'action.type': 'COUNTER_INCREASE:slow',
          'action.state': 'background',
          'action.payload': '{"count":3}',
        },
      }),
      sandbox.match({
        depth: sandbox.match.number,
      })
    );

    fireEvent.click(screen.getByText('Decrease'));
    sandbox.assert.calledWith(
      mockConsoleDir,
      sandbox.match({
        name: 'action',
        id: sandbox.match.string,
        timestamp: sandbox.match.number,
        duration: sandbox.match.number,
        attributes: {
          'action.type': 'COUNTER_DECREASE:normal',
          'action.state': 'background',
          'action.payload': '{"count":1}',
        },
      }),
      sandbox.match({
        depth: sandbox.match.number,
      })
    );
  });
});
