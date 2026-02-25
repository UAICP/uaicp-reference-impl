import { AgentIdentity, ControlClass } from '../types/core';

export type WriteRisk = 'read_only' | 'write_low_risk' | 'write_high_risk';
export type PolicyDecision = 'allow' | 'deny' | 'needs_review';

export interface PolicyEvaluationInput {
  identity: AgentIdentity;
  action: string;
  resource: string;
  write_risk: WriteRisk;
  approval_token?: string;
  allowed_control_classes?: ControlClass[];
  trust_tier_allowlist?: string[];
}

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  reasons: string[];
}

export class PolicyEvaluator {
  static evaluate(input: PolicyEvaluationInput): PolicyEvaluationResult {
    const reasons: string[] = [];

    if (!input.action || !input.resource) {
      return {
        decision: 'deny',
        reasons: ['MISSING_ACTION_OR_RESOURCE']
      };
    }

    if (input.allowed_control_classes?.length) {
      if (!input.allowed_control_classes.includes(input.identity.control_class)) {
        reasons.push('CONTROL_CLASS_BLOCKED');
      }
    }

    if (input.trust_tier_allowlist?.length) {
      const trustTier = input.identity.attestation?.trust_tier;
      if (!trustTier || !input.trust_tier_allowlist.includes(trustTier)) {
        reasons.push('TRUST_TIER_BLOCKED');
      }
    }

    if (input.write_risk === 'write_high_risk' && !input.approval_token) {
      reasons.push('APPROVAL_REQUIRED');
      return {
        decision: 'needs_review',
        reasons
      };
    }

    if (reasons.length > 0) {
      return {
        decision: 'deny',
        reasons
      };
    }

    return {
      decision: 'allow',
      reasons: []
    };
  }
}
