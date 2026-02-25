export type ControlClass = 'autonomous' | 'human-supervised' | 'human-directed';

export interface Attestation {
  issuer: string;
  evidence: string;
  issued_at: string; // ISO 8601 date string
  trust_tier: string;
}

export interface AgentIdentity {
  agent_id: string;
  owner_id: string;
  control_class: ControlClass;
  attestation?: Attestation; // Optional in some contexts, but mandatory for verified hops
}

export interface UaicpEnvelope {
  uaicp_version: string;
  request_id: string;
  message_type: string;
  timestamp: string;
  trace_id: string;
  identity: AgentIdentity;
  // Other fields omitted for this focused implementation
}
