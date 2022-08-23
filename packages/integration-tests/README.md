# Integration Tests

Each folder in the `fixtures` folder represents one testing scenario.
When `yarn test` is run, first `setup.ts` in all fixtures is executed, afterwards we run `jest`, which will pick up all `*.test.ts` files.
The `*.test.ts` files can then use anything that is generated via `setup.ts`.
