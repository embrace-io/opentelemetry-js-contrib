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
import store from './helper/store';
import { FC } from 'react';
import { Button, SafeAreaView, ScrollView, View } from 'react-native';
import { render } from '@testing-library/react';

const App: FC = () => {
  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Button title="Go to A View" onPress={() => console.log('hey')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

describe('middleware.ts', () => {
  const sandbox = sinon.createSandbox();
  let mockConsoleDir: sinon.SinonSpy;

  beforeEach(() => {
    mockConsoleDir = sandbox.spy(console, 'dir');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should track an action and create the corresponding span', () => {
    store.dispatch({ type: 'COUNTER_INCREASE', count: 5 });

    store.dispatch({ type: 'COUNTER_DECREASE', count: 1 });

    store.dispatch({ type: 'COUNTER_INCREASE', count: 2 });

    sandbox.assert.called(mockConsoleDir);
  });

  it('should work as expected when there is a component', () => {
    const screen = render(<App />);

    console.log(screen);
  });
});
