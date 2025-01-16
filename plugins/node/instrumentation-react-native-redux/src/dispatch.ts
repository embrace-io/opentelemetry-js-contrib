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
import { Middleware, Action } from 'redux';
import { TracerProvider, trace, Attributes } from '@opentelemetry/api';
import { PACKAGE_NAME, PACKAGE_VERSION } from './version';
import {
  ATTRIBUTES,
  spanEnd,
  spanStart,
  STATIC_NAME,
  OUTCOMES,
} from './utils/spanFactory';
import logFactory from './utils/logFactory';

interface MiddlewareConfig {
  debug?: boolean;
  name?: string; // custom name for each action
  attributeTransform?: (attrs: Attributes) => Attributes;
}

const defaultAttributeTransform = (attrs: Attributes) => attrs;

const middleware = <RootState>(
  provider: TracerProvider | undefined,
  config?: MiddlewareConfig
  // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
  // eslint-disable-next-line @typescript-eslint/ban-types
): Middleware<{}, RootState> => {
  const {
    debug,
    name,
    attributeTransform = defaultAttributeTransform,
  } = config || {};
  const console = logFactory(!!debug);

  return () => {
    if (provider) {
      console.info('TracerProvider. Using custom tracer.');
    } else {
      console.info('No TracerProvider found. Using global tracer instead.');
    }

    const tracer = provider
      ? provider.getTracer(PACKAGE_NAME, PACKAGE_VERSION)
      : trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);

    return next => {
      return action => {
        const actionTyped = action as Action;
        if (!(actionTyped && actionTyped.type)) {
          return next(action);
        }

        const { type, ...otherValues } = actionTyped;

        const span = spanStart(tracer, name ?? STATIC_NAME, {
          attributes: attributeTransform({
            [ATTRIBUTES.type]: type,
            [ATTRIBUTES.payload]: JSON.stringify(otherValues),
            [ATTRIBUTES.outcome]: OUTCOMES.incomplete,
          }),
        });

        try {
          const result = next(action);
          spanEnd(
            span,
            attributeTransform({
              [ATTRIBUTES.outcome]: OUTCOMES.success,
            })
          );
          return result;
        } catch (err) {
          spanEnd(
            span,
            attributeTransform({
              [ATTRIBUTES.outcome]: OUTCOMES.fail,
            })
          );
          throw err;
        }
      };
    };
  };
};

export default middleware;