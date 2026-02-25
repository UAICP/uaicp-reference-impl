# UAICP Reference Implementation

Reference implementation primitives for the UAICP reliability contract.

Current implementation scope:

- identity and attestation validation
- policy evaluation service (baseline)

## Purpose

This repository is intentionally narrow and composable. It provides portable building blocks that can be embedded under existing frameworks and orchestration runtimes.

## Implemented Modules

- `src/identity`:
  - schema contracts for identity and attestation
  - validator with strict and optional attestation modes
- `src/policy`:
  - deterministic policy evaluator for allow/deny/review decisions
  - reason-coded decisions for runtime gating

## Quick Start

```bash
npm install
npm test
npm run build
```

## Example

```ts
import { IdentityValidator, PolicyEvaluator } from '@uaicp/uaicp-reference-impl';

const identityResult = IdentityValidator.validate(identityInput, true);
if (!identityResult.valid || !identityResult.identity) {
  throw new Error('Identity validation failed');
}

const decision = PolicyEvaluator.evaluate({
  identity: identityResult.identity,
  action: 'deploy',
  resource: 'prod:payments',
  write_risk: 'write_high_risk',
  approval_token: 'change-approval-123',
  allowed_control_classes: ['human-directed'],
  trust_tier_allowlist: ['high']
});

if (decision.decision !== 'allow') {
  console.log(decision.reasons);
}
```

## Roadmap

- verification report builder
- invariant evaluation engine
- audit event emitters

## License

Apache-2.0
