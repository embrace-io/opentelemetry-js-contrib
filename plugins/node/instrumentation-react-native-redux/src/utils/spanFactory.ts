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
import { AppStateStatus } from 'react-native';
import { Attributes, Span, Tracer } from '@opentelemetry/api';

const ATTRIBUTES = {
  name: 'action.name',
  appState: 'action.state',
};

const spanStart = (
  tracer: Tracer,
  name: string,
  customAttributes?: Attributes
) => {
  if (!tracer) {
    // do nothing in case for some reason the tracer is not initialized or there is already an active span
    return;
  }

  // Starting the span
  const span = tracer.startSpan(name);

  if (customAttributes) {
    span.setAttributes(customAttributes);
  }

  return span;
};

const spanEnd = (span: Span | null, appState?: AppStateStatus) => {
  if (span) {
    span.setAttribute(ATTRIBUTES.appState, appState ?? 'active');

    span.end();
  }
};

export { spanStart, spanEnd, ATTRIBUTES };
