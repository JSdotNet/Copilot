# Copilot Model Selection Overrides

## Purpose

Use Azure Foundry model catalog and deployment entries for orchestration runs. The Copilot
UI **Wire model** value must match the Azure Foundry deployment/model ID exactly.

Prefer Microsoft Foundry GPT reasoning models because Claude 5 models currently fail when
the Anthropic provider injects the deprecated `temperature` parameter.

## Team Repo Overrides

| Category | Model |
| --- | --- |
| Planning & Product Definition | gpt-5.4 |
| Architecture & Design | gpt-5.4 |
| Implementation & Coding | gpt-5.4 |
| Testing, QA & Monitoring | gpt-5.4 |
| Review | gpt-5.4 |
| Documentation & Low-Complexity | gpt-5.6-luna |
| Fallback / Unclassified | gpt-5.4 |

## Recommended Azure Foundry Model Catalog

Configure these Azure Foundry model catalog/deployment entries when they are available in
the target Microsoft Foundry environment.

| Foundry display name | Wire model | Max prompt tokens | Max output tokens | Intended use |
| --- | --- | --- | --- | --- |
| `gpt-5.4` | `gpt-5.4` | `922000` | `128000` | Default orchestration model |
| `gpt-5.5` | `gpt-5.5` | `922000` | `128000` | Premium fallback |
| `gpt-5.6-luna` | `gpt-5.6-luna` | `922000` | `128000` | Fast or cheaper routine work |
| `gpt-5.6-sol` | `gpt-5.6-sol` | `922000` | `128000` | Optional balanced alternative |

## Conditional Claude Foundry Fallbacks

Keep older Claude models only as Azure Foundry catalog entries. Configure them only when
the Foundry catalog/provider accepts requests without the deprecated `temperature`
parameter.

| Foundry display name | Wire model | Max prompt tokens | Max output tokens | Intended use |
| --- | --- | --- | --- | --- |
| `claude-sonnet-4-6` | `claude-sonnet-4-6` | `1000000` | `128000` | Conditional premium fallback |
| `claude-sonnet-4-5` | `claude-sonnet-4-5` | `200000` | `64000` | Conditional fallback |
| `claude-haiku-4-5` | `claude-haiku-4-5` | `200000` | `64000` | Conditional lightweight fallback |

Avoid Claude 5 models until the provider stops sending `temperature`:

- `claude-opus-5`
- `claude-sonnet-5`
- `claude-fable-5`

## Reasoning Model Parameter Guardrails

Do not configure sampling or legacy completion parameters for reasoning models:

- `temperature`
- `top_p`
- penalties
- `logprobs`
- `logit_bias`
- `max_tokens`

Use the provider-specific output-token field instead of `max_tokens` when a token limit is
required.
