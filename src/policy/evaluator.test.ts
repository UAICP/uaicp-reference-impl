import { PolicyEvaluator } from './evaluator';

const identity = {
  agent_id: 'agent:ops/001',
  owner_id: 'org:acme',
  control_class: 'human-directed' as const,
  attestation: {
    issuer: 'uaicp-verifier',
    evidence: 'signed-token',
    issued_at: new Date().toISOString(),
    trust_tier: 'high'
  }
};

describe('PolicyEvaluator', () => {
  test('allows when all policy checks pass', () => {
    const result = PolicyEvaluator.evaluate({
      identity,
      action: 'deploy',
      resource: 'prod:api',
      write_risk: 'write_high_risk',
      approval_token: 'approved-123',
      allowed_control_classes: ['human-directed'],
      trust_tier_allowlist: ['high']
    });

    expect(result.decision).toBe('allow');
    expect(result.reasons).toEqual([]);
  });

  test('returns needs_review when high-risk write has no approval', () => {
    const result = PolicyEvaluator.evaluate({
      identity,
      action: 'deploy',
      resource: 'prod:api',
      write_risk: 'write_high_risk'
    });

    expect(result.decision).toBe('needs_review');
    expect(result.reasons).toContain('APPROVAL_REQUIRED');
  });

  test('denies when control class is not allowed', () => {
    const result = PolicyEvaluator.evaluate({
      identity: {
        ...identity,
        control_class: 'autonomous'
      },
      action: 'deploy',
      resource: 'prod:api',
      write_risk: 'write_low_risk',
      allowed_control_classes: ['human-directed']
    });

    expect(result.decision).toBe('deny');
    expect(result.reasons).toContain('CONTROL_CLASS_BLOCKED');
  });

  test('denies when trust tier is not allowed', () => {
    const result = PolicyEvaluator.evaluate({
      identity: {
        ...identity,
        attestation: {
          ...identity.attestation,
          trust_tier: 'low'
        }
      },
      action: 'access',
      resource: 'sensitive:dataset',
      write_risk: 'write_low_risk',
      trust_tier_allowlist: ['high']
    });

    expect(result.decision).toBe('deny');
    expect(result.reasons).toContain('TRUST_TIER_BLOCKED');
  });

  test('denies malformed request with missing action', () => {
    const result = PolicyEvaluator.evaluate({
      identity,
      action: '',
      resource: 'prod:api',
      write_risk: 'read_only'
    });

    expect(result.decision).toBe('deny');
    expect(result.reasons).toContain('MISSING_ACTION_OR_RESOURCE');
  });
});
