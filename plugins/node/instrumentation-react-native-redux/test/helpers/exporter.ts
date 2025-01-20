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
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base/build/src/export/ReadableSpan';

class TestSpanExporter implements SpanExporter {
  public exportedSpans: ReadableSpan[];

  constructor() {
    this.exportedSpans = [];
  }

  public export(spans: ReadableSpan[]) {
    this.exportedSpans.push(...spans);
  }

  public async shutdown() {
    this.reset();
  }

  public reset() {
    this.exportedSpans = [];
  }
}

export { TestSpanExporter };
