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
import logFactory from './utils/logFactory';

const SPAN_NAME = {
  thunk: 'thunk',
  action: 'action',
};

interface MiddlewareConfig {
  debug?: boolean;
}

const middleware = <RootState>(
  provider: TracerProvider | undefined,
  config?: MiddlewareConfig
): Middleware<object, RootState> => {
  const { debug } = config || {};
  const console = logFactory(!!debug);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return () => {
    if (!provider) {
      console.info('No TracerProvider found. Using global tracer instead.');
    } else {
      console.info('TracerProvider. Using custom tracer.');
    }

    const tracer = provider
      ? provider.getTracer(PACKAGE_NAME, PACKAGE_VERSION)
      : trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);

    return (next: Dispatch<UnknownAction>) => {
      return (action: Action) => {
        const span = spanStart(tracer, SPAN_NAME.action);
        const result = next(action);

        if (span) {
          const { type, ...otherValues } = result;

          span.setAttributes({
            type,
            payload: JSON.stringify(otherValues),
          });

          spanEnd(span);
        }

        return result;
      };
    };
  };
};

export default middleware;
