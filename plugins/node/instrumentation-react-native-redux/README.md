# OpenTelemetry React Native Redux Instrumentation

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

## Installation

```bash
npm i @opentelemetry/instrumentation-react-native-redux @opentelemetry/api
```

or if you use yarn

```bash
yarn add @opentelemetry/instrumentation-react-native-redux @opentelemetry/api
```

## Usage

`@opentelemetry/instrumentation-react-native-redux` exports a custom middleware that creates telemetry data for each action dispatched by your React Native application.

```javascript
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {Stack} from "expo-router";
import {Provider} from "react-redux";
import store from './store';

export default function RootLayout() {

return (
    <Provider store={store}> {/* As with any regular Redux configuration, the provider should wrap the entire application at the root of the tree. There is nothing new or custom here. */}
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </Provider>
  );
}
```

Now, let's take a look at the Store configuration in `store.ts`. We need to implement the dispatch middleware:

```javascript
// store.ts

import {dispatchMiddleware} from "@opentelemetry/instrumentation-react-native-redux";
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
  Reducer,
} from "redux";
import rootReducer from './reducer'

const exporter = new ConsoleSpanExporter();
const processor = new SimpleSpanProcessor(exporter);
const provider = new BasicTracerProvider();

provider.addSpanProcessor(processor);
provider.register();

const middleware = dispatchMiddleware<RootState>(provider, {
  // Here the new middleware is configured in debug mode. It will display console messages in this case.
  // To shut them down, we need to turn it to `false`.
  debug: true,
});

const store = createStore(rootReducer, applyMiddleware(middleware));
export default store;
```

Just for completeness of the example, the rest of the configuration can look like:

```javascript
// actions.ts

type IncrementAction = {
  type: "COUNTER_INCREASE";
  count: number;
};

type DecrementAction = {
  type: "COUNTER_DECREASE";
  count: number;
};

type CounterState = {
  count: number;
};

const initialCounterState: CounterState = {
  count: 0,
};

const counterIncrease = (count = 1): IncrementAction => ({
  type: "COUNTER_INCREASE",
  count,
});

const counterDecrease = (count = 1): DecrementAction => ({
  type: "COUNTER_DECREASE",
  count,
});

/**
 * Counter actions (for testing purposes)
 */
type CounterActions = IncrementAction | DecrementAction;

export {counterIncrease, counterDecrease, initialCounterState};
export type {CounterState, CounterActions}
```

```javascript
// reducers.ts

import { combineReducers, Reducer } from "redux";
import { initialCounterState, CounterState, CounterActions } from './actions';

/**
 * Counter reducer (for testing purposes)
 */
const counterReducer: Reducer<CounterState, CounterActions> = (
  state = initialCounterState,
  action,
) => {
  switch (action.type) {
    case "COUNTER_INCREASE": {
      return {...state, count: state.count + action.count};
    }
    case "COUNTER_DECREASE": {
      return {...state, count: state.count - action.count};
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

export default rootReducer;
export type {RootState};
```

This middleware was prepared to accept a custom provider to start creating telemetry data, but if it is not passed, it will use a global tracer provider instead.
Internally, each `redux` dispatched action can take a few milliseconds to process (depending on how heavy the transaction is) and that is why this instrumentation library produces Spans. Each Span will display a static name, and besides that, it will add a few attributes.

The following object is the representation of what the middleware will create for a dispatched action:

```bash
{
  resource: {
    attributes: {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '1.25.1'
    }
  },
  traceId: '9c591b898c2e85c49f283d1e6393aae1',
  parentId: undefined,
  traceState: undefined,
  name: 'action',
  id: 'aa80b027f2570181',
  kind: 0,
  timestamp: 1722889197399000,
  duration: 52.166,
  attributes: {
    'action.payload': '{"count":1}',
    'action.type': 'COUNTER_DECREASE',
    'action.state': 'active'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```
As mentioned above, the `name` of this Span is `action` (static). The `action.type` is injected as an attribute, as well as `action.payload`, which is a string that adds whatever the action has (except for the mentioned `action.type`).
Finally, the middleware adds the `action.state`, which provides information about the state of the application (`AppState.currentState`).

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation-react-native-redux
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation-react-native-redux.svg
