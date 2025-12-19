// Provide minimal test globals so `tsc` doesn't fail on test runner globals in the repo.
// This is a temporary shim until proper test typings are installed (vitest/jest types).

type TestFn = (name: string, fn: () => unknown) => void;
type HookFn = (fn: () => unknown) => void;
type Matcher = Record<string, (...args: unknown[]) => unknown>;
type ExpectReturn = Matcher & { not: Matcher };

declare const describe: TestFn;
declare const it: TestFn;
declare const test: TestFn;
declare const expect: (value: unknown) => ExpectReturn;
declare const beforeEach: HookFn;
declare const afterEach: HookFn;
declare const vi: Record<string, unknown>;
