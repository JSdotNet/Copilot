---
name: api-client-contract
description: 'Bind a React frontend to a .NET API using the approved plan API contract as the single source of truth for request, response, and error types. Use before building screens against a new or changed endpoint.'
---

# API Client From Contract

Types flow from the contract into the UI. A screen never invents a shape the API does not
promise, and the frontend never restates a shape the backend already publishes.

## When To Use

- A plan step adds or changes an endpoint the UI consumes.
- A screen currently talks to the API through untyped or hand-guessed shapes.
- A backend change altered a response and the UI must follow.

## Source Of Truth Order

Use the first source that exists, and record which one was used.

1. A generated client or generated types produced from the API's OpenAPI document.
2. The API's OpenAPI or Swagger document, when the repository has a generation step.
3. The `## API Contract` section of the approved plan under `.wip/implementation-plans/`.
4. The .NET request, response, and problem-detail types in the API layer, read directly.

Never treat a component's existing local interface as the source of truth. If it disagrees
with the contract, the contract wins and the local type is corrected.

## Workflow

1. Detect the stack first with the `frontend-stack-detect` skill: data-fetching library,
   whether a generation step already exists, and the typecheck command.
2. If the repository generates types, run the generation step rather than hand-writing types,
   and report the command used.
3. Otherwise, write the request, response, and error types once in the module that owns that
   endpoint group, and export them for the components to consume.
4. Wrap each endpoint in a single call site: one function or one query and mutation pair per
   endpoint, holding the URL, method, headers, and status handling.
5. Model the error path from the contract, not from a generic catch: cover the documented
   status codes and the API's problem-detail shape.
6. Consume the endpoint from components through the detected data-fetching library's own
   patterns, so caching, retry, and invalidation stay consistent with the rest of the app.
7. Run the detected typecheck command and confirm the contract binding compiles.

## Mapping Rules

Translate .NET shapes deliberately rather than assuming a default:

- Confirm the JSON naming policy on the API side before naming TypeScript fields; do not
  assume camelCase.
- Model a nullable or optional value as optional in TypeScript, and keep required fields
  required — do not blanket every field with `?`.
- Represent dates and timestamps as the contract's wire format, and convert at the edge
  rather than storing mixed types.
- Represent `decimal` money values in the precision the contract specifies, and never
  through a lossy intermediate.
- Represent an enum as a union of the contract's literal values, not as `string`.
- Represent a paged result with the contract's envelope, including its total and cursor
  fields.

## Prohibited

- `any`, an unchecked cast, or a non-null assertion used to silence a contract mismatch.
- A `fetch` call inlined in a component when the endpoint module exists.
- A second, divergent definition of a shape the contract already defines.
- A base URL, tenant id, or token hardcoded in the client instead of configured.

## Quality Checks

- Every consumed endpoint has exactly one typed call site.
- Request, response, and error types trace back to the recorded source of truth.
- Documented failure statuses are handled, not collapsed into one generic error.
- The detected typecheck command passes.
- No prohibited pattern was introduced.
