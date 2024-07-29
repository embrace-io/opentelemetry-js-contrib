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
  Dispatch,
  Middleware,
  MiddlewareAPI,
  Action,
  UnknownAction,
} from 'redux';
import { TracerProvider, trace } from '@opentelemetry/api';
import { PACKAGE_NAME, PACKAGE_VERSION } from './version';
import { spanEnd, spanStart } from './utils/spanFactory';
import { AppState } from 'react-native';

const SPAN_NAME = 'redux-action';

const middleware = <RootState>(
  provider: TracerProvider
): Middleware<object, RootState> => {
  if (!provider) {
    console.info('No TracerProvider found. Using global tracer instead.');
  } else {
    console.info('TracerProvider. Using custom tracer.');
  }

  const tracer = provider
    ? provider.getTracer(PACKAGE_NAME, PACKAGE_VERSION)
    : trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return ({ getState }: MiddlewareAPI<Dispatch<UnknownAction>, RootState>) => {
    const span = spanStart(tracer, SPAN_NAME);

    console.log('store before dispatch', getState());

    return (next: Dispatch<UnknownAction>) => {
      return async (action: Action) => {
        const result = await next(action);

        if (span) {
          span.addEvent('dispatch', result);

          spanEnd(span, AppState.currentState);
        }

        return result;
      };
    };
  };
};

export default middleware;
