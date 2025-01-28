import fs from "fs";
import { glob } from "glob";
import os from "os";
import path from "path";
import * as util from "util";
import { Logger } from "./sentry/logger";
import { promisify } from "util";
import SentryCli from "@sentry/cli";
import { dynamicSamplingContextToSentryBaggageHeader } from "@sentry/utils";
import { safeFlushTelemetry } from "./sentry/telemetry";
import { stripQueryAndHashFromPath } from "./utils";
import { setMeasurement, spanToTraceHeader, startSpan } from "@sentry/core";
import { getDynamicSamplingContextFromSpan, Scope } from "@sentry/core";
import { Client } from "@sentry/types";

interface RewriteSourcesHook {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (source: string, map: any): string;
}
