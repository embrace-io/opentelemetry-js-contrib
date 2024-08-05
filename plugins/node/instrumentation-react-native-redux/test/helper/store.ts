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
import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
  Reducer,
} from 'redux';
import { dispatchMiddleware } from '../../src';
import { createInstanceProvider } from '../helper/provider';

type IncrementAction = {
  type: 'COUNTER_INCREASE:slow';
  count: number;
};

type DecrementAction = {
  type: 'COUNTER_DECREASE:normal';
  count: number;
};

type CounterState = {
  count: number;
};

const initialCounterState: CounterState = {
  count: 0,
};

const counterIncrease = (count = 1): IncrementAction => ({
  type: 'COUNTER_INCREASE:slow',
  count,
});

const counterDecrease = (count = 1): DecrementAction => ({
  type: 'COUNTER_DECREASE:normal',
  count,
});

/**
 * Counter actions (for testing purposes)
 */
type CounterActions = IncrementAction | DecrementAction;
const counterActions = { increase: counterIncrease, decrease: counterDecrease };

/**
 * Counter reducer (for testing purposes)
 */
const counterReducer: Reducer<CounterState, CounterActions> = (
  state = initialCounterState,
  action
) => {
  switch (action.type) {
    case 'COUNTER_INCREASE:slow': {
      // NOTE: adding slowliness to the action for testing purposes
      const test = new Array(1000000);
      test.forEach((_, index) => (test[index] = true));

      return { ...state, count: state.count + action.count };
    }
    case 'COUNTER_DECREASE:normal': {
      return { ...state, count: state.count - action.count };
    }
    default:
      return state;
  }
};

/**
 * Root reducer (in case of multiple reducers)
 */
const rootReducer = combineReducers({
  counter: counterReducer,
});

type RootState = ReturnType<typeof rootReducer>;

const provider = createInstanceProvider();
const otelLoggerMiddleware = dispatchMiddleware<RootState>(provider, {
  debug: true,
});

/**
 * Store
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const store = createStore(rootReducer, applyMiddleware(otelLoggerMiddleware));

type AppDispatch = typeof store.dispatch;

export default store;
export { counterActions, rootReducer };
export type { RootState, AppDispatch };
