import { Message } from '@/types/message'

export const MOCK_SESSION_ID = 'ags_mock_session_001'
export const MOCK_AGENT_MODEL = 'ai-agent-forsyte-preview'

// --- Stage A: Plain text response ---
export const mockPlainText: Message[] = [
  {
    id: 'agm_a_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Do I have matters in high risk jurisdictions?',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_a_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Yes, you have 3 matters on your Forsyte book. Two of those matters have indicators that they may involve higher-risk jurisdictions based on their risk assessments.',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
]

// --- Stage B: Agent reply with markdown ---
export const mockMarkdown: Message[] = [
  {
    id: 'agm_b1_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Summarise the matters with outstanding items and suggest next steps',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_b1_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Here is a summary of your outstanding matters:\n\n**Beekeeper Ltd — Employment Contract**\n- Risk level: **High**\n- Status: In progress\n- Outstanding: Adverse media check, high-risk third country residence\n\n**Suggested next steps:**\n1. Resolve pending adverse media screening\n2. Document risk-based rationale for high-risk country exposure\n3. Obtain sign-off from compliance lead before proceeding',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
]

// --- Stage B: Agent reply with risk assessments resource table ---
export const mockWithRiskAssessments: Message[] = [
  {
    id: 'agm_b2_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Summarise the matters with outstanding items and suggest next steps',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_b2_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Here are the matters with outstanding risk assessments. Two are currently in progress and require attention before proceeding.',
      resources: [
        {
          rel: 'allSeededRiskAssessments',
          href: '/v1/risk-assessments?organisationSlug=forsyte',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
]

// --- Stage B: Agent reply with matters resource table ---
export const mockWithMatters: Message[] = [
  {
    id: 'agm_b3_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'How many of those have outstanding risk assessments?',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_b3_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Out of your 3 seeded matters, 2 currently have risk assessments in progress and 1 has a completed high-risk assessment.\n\nYou can review the outstanding matters and their assessments using the link below.',
      resources: [
        {
          rel: 'mattersWithOutstandingRiskAssessments',
          href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
]

// --- Stage B: Agent reply with unresolvable resource (placeholder href, falls back to link only) ---
export const mockWithUnresolvableResource: Message[] = [
  {
    id: 'agm_b4_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Show the risk assessment flags for the Beekeeper employment contract',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_b4_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Here are the risk assessment flags for the Beekeeper employment contract. Two flags remain pending and require resolution.',
      resources: [
        {
          rel: 'riskAssessmentFlags',
          href: '/v1/risk-assessments/{beekeeperRiskId}/flags',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
]

// --- Stage C: Multi-part response (length → stop), no resources ---
export const mockMultipartPlain: Message[] = [
  {
    id: 'agm_c1_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Show the risk assessment flags for the Beekeeper employment contract',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_c1_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: '## Risk Assessment Flags\n\n- **Remote identity verification**: accepted\n- **Identity confidence**: accepted\n- **Sanctions screening**: accepted\n- **Adverse media**: pending\n- **High-risk third country residence**: pending',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'length' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
  {
    id: 'agm_c1_003',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 3,
    content: {
      text: 'Overall, the Beekeeper employment contract has a completed, high-risk assessment driven mainly by remote onboarding and outstanding screening checks. Typical next steps would include resolving the pending identity and adverse media checks and documenting a clear risk-based rationale before proceeding.',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:04Z'),
  },
]

// --- Stage C: Multi-part with unresolvable resources on each part ---
export const mockMultipartWithResources: Message[] = [
  {
    id: 'agm_c2_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Show the risk assessment flags for the Beekeeper employment contract',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_c2_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: '## Risk Assessment Flags\n\n- **Remote identity verification**: accepted\n- **Identity confidence**: accepted\n- **Sanctions screening**: accepted\n- **Adverse media**: pending\n- **High-risk third country residence**: pending',
      resources: [
        {
          rel: 'riskAssessmentFlags',
          href: '/v1/risk-assessments/{beekeeperRiskId}/flags',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'length' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
  {
    id: 'agm_c2_003',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 3,
    content: {
      text: 'Overall, the Beekeeper employment contract has a completed, high-risk assessment driven mainly by remote onboarding and outstanding screening checks. Typical next steps would include resolving the pending identity and adverse media checks and documenting a clear risk-based rationale before proceeding.',
      resources: [
        {
          rel: 'riskAssessmentDetails',
          href: '/v1/risk-assessments/{beekeeperRiskId}',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:04Z'),
  },
]

// --- Stage C: Multi-part with resolvable resource on the stop part ---
export const mockMultipartWithResolvedResource: Message[] = [
  {
    id: 'agm_c3_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Summarise the matters with outstanding items and suggest next steps',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_c3_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Here is a breakdown of your outstanding matters and the associated risk assessment flags that require attention.',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'length' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },
  {
    id: 'agm_c3_003',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 3,
    content: {
      text: 'I recommend prioritising the two in-progress assessments. Both require compliance sign-off before the matters can proceed to the next stage.',
      resources: [
        {
          rel: 'allSeededRiskAssessments',
          href: '/v1/risk-assessments?organisationSlug=forsyte',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:04Z'),
  },
]

// --- Full conversation: all stages in sequence ---
export const mockConversation: Message[] = [
  // Turn 1 — plain text (Stage A)
  {
    id: 'agm_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: { text: 'Do I have matters in high risk jurisdictions?' },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Yes, you have 3 matters on your Forsyte book. Two of those matters have indicators that they may involve higher-risk jurisdictions based on their risk assessments.',
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },

  // Turn 2 — resources (Stage B)
  {
    id: 'agm_003',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 3,
    content: { text: 'How many of those have outstanding risk assessments?' },
    createdAt: new Date('2025-03-07T09:01:00Z'),
  },
  {
    id: 'agm_004',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 4,
    content: {
      text: 'Out of your 3 seeded matters, 2 currently have risk assessments in progress and 1 has a completed high-risk assessment.\n\nYou can review the outstanding matters and their assessments using the link below.',
      resources: [
        {
          rel: 'mattersWithOutstandingRiskAssessments',
          href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:01:02Z'),
  },

  // Turn 3 — multi-part with resources (Stage C)
  {
    id: 'agm_005',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 5,
    content: { text: 'Show the risk assessment flags for the Beekeeper employment contract' },
    createdAt: new Date('2025-03-07T09:02:00Z'),
  },
  {
    id: 'agm_006',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 6,
    content: {
      text: 'Here are the seeded risk assessment flags for the Beekeeper employment contract:\n\n- Remote identity verification: accepted\n- Identity confidence: accepted\n- Sanctions screening: accepted\n- Adverse media: pending\n- High-risk third country residence: pending\n\nI will summarise what this means and suggested next steps next.',
      resources: [
        {
          rel: 'riskAssessmentFlags',
          href: '/v1/risk-assessments/{beekeeperRiskId}/flags',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'length' },
    },
    createdAt: new Date('2025-03-07T09:02:02Z'),
  },
  {
    id: 'agm_007',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 7,
    content: {
      text: 'Overall, the Beekeeper employment contract has a completed, high-risk assessment driven mainly by remote onboarding and outstanding screening checks. Typical next steps would include resolving the pending identity and adverse media checks and documenting a clear risk-based rationale before proceeding.',
      resources: [
        {
          rel: 'riskAssessmentDetails',
          href: '/v1/risk-assessments/{beekeeperRiskId}',
        },
      ],
      meta: { model: MOCK_AGENT_MODEL, finishReason: 'stop' },
    },
    createdAt: new Date('2025-03-07T09:02:04Z'),
  },
]

// list of all examples
// mockPlainText,                    // Stage A — plain text only
// mockMarkdown,                     // Stage B — markdown bold/lists
// mockWithRiskAssessments,          // Stage B — risk assessment table
// mockWithMatters,                  // Stage B — matters table
// mockWithUnresolvableResource,     // Stage B — placeholder href, link only
// mockMultipartPlain,               // Stage C — length → stop, no resources
// mockMultipartWithResources,       // Stage C — length → stop, unresolvable resources
// mockMultipartWithResolvedResource,     // Stage C — length → stop, resolvable resource