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
  BasicTracerProvider,
  SpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

let provider: BasicTracerProvider;

const createInstanceProvider = (exporter: SpanExporter) => {
  provider = new BasicTracerProvider();

  const processor = new SimpleSpanProcessor(exporter);

  provider.addSpanProcessor(processor);
  provider.register();

  return provider;
};

const shutdownInstanceProvider = async () => {
  if (provider) {
    await provider.shutdown();
  }
};

export { createInstanceProvider, shutdownInstanceProvider };
