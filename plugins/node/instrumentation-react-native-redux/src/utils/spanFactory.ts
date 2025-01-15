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
import { AppState } from 'react-native';
import { Context, Span, SpanOptions, Tracer } from '@opentelemetry/api';

const STATIC_NAME = 'action';
const ATTRIBUTES = {
  payload: `${STATIC_NAME}.payload`,
  type: `${STATIC_NAME}.type`,
  appState: `${STATIC_NAME}.state`,
  outcome: `${STATIC_NAME}.outcome`
};

const OUTCOMES = {
  incomplete: 'incomplete',
  success: 'success',
  fail: 'fail',
}

const spanStart = (
  tracer: Tracer,
  name: string,
  options?: SpanOptions,
  context?: Context
) => {
  return tracer.startSpan(name, options, context);
};

const spanEnd = (span: Span, attributes: SpanOptions['attributes']) => {
  span.setAttributes({
    [ATTRIBUTES.appState]: AppState.currentState,
    ...attributes,
  });
  span.end();
};

export { spanStart, spanEnd, ATTRIBUTES, STATIC_NAME, OUTCOMES };
