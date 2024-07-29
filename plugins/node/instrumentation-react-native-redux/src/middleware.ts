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
import { Dispatch, Middleware, Action, UnknownAction } from 'redux';
import { TracerProvider, trace } from '@opentelemetry/api';
import { PACKAGE_NAME, PACKAGE_VERSION } from './version';
import { spanEnd, spanStart } from './utils/spanFactory';
import { AppState } from 'react-native';

const SPAN_NAME = {
  action: 'redux-action',
  store: 'redux-created-store',
};

interface MiddlewareConfig {
  debug?: boolean;
  allowLogging?: boolean;
}

const middleware = <RootState>(
  provider: TracerProvider,
  config?: MiddlewareConfig
): Middleware<object, RootState> => {
  /**
   * happening just once, before the store is created
   */

  // NOTE
  // create an span that start with the Store creation?
  // should be ended when the store is destroyed (if possible to catch that moment)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return () => {
    /**
     * happening just once, when the store is created
     */
    if (!provider) {
      console.info('No TracerProvider found. Using global tracer instead.');
    } else {
      console.info('TracerProvider. Using custom tracer.');
    }

    const tracer = provider
      ? provider.getTracer(PACKAGE_NAME, PACKAGE_VERSION)
      : trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);

    return (next: Dispatch<UnknownAction>) => {
      /**
       * happening just once, when the store is created
       */
      return (action: Action) => {
        /**
         * happening on each action dispatch
         */
        // NOTE: should all these spans be childs of the store creation span?
        const span = spanStart(tracer, SPAN_NAME.action);
        const result = next(action);

        if (span) {
          const { type } = result;

          if (config?.allowLogging) {
            // TODO: create a log
            // experimental package: @opentelemetry/api-logs
          } else {
            span.addEvent('dispatch', { type });
          }

          spanEnd(span, AppState.currentState);
        }

        return result;
      };
    };
  };
};

export default middleware;
