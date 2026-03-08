import { Message } from '@/types/message'

export const MOCK_SESSION_ID = 'ags_mock_session_001'
export const MOCK_AGENT_MODEL = 'ai-agent-forsyte-preview'

export const mockConversation: Message[] = [
  // Turn 1 — plain text (Stage A preview)
  {
    id: 'agm_001',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 1,
    content: {
      text: 'Do I have matters in high risk jurisdictions?',
    },
    createdAt: new Date('2025-03-07T09:00:00Z'),
  },
  {
    id: 'agm_002',
    sessionId: MOCK_SESSION_ID,
    role: 'agent',
    sequenceId: 2,
    content: {
      text: 'Yes, you have 3 matters on your Forsyte book. Two of those matters have indicators that they may involve higher-risk jurisdictions based on their risk assessments.',
      meta: {
        model: MOCK_AGENT_MODEL,
        finishReason: 'stop',
      },
    },
    createdAt: new Date('2025-03-07T09:00:02Z'),
  },

  // Turn 2 — agent reply with resources (Stage B preview)
  {
    id: 'agm_003',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 3,
    content: {
      text: 'How many of those have outstanding risk assessments?',
    },
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
      meta: {
        model: MOCK_AGENT_MODEL,
        finishReason: 'stop',
      },
    },
    createdAt: new Date('2025-03-07T09:01:02Z'),
  },

  // Turn 3 — multi-part agent response (Stage C preview)
  {
    id: 'agm_005',
    sessionId: MOCK_SESSION_ID,
    role: 'user',
    sequenceId: 5,
    content: {
      text: 'Show the risk assessment flags for the Beekeeper employment contract',
    },
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
      meta: {
        model: MOCK_AGENT_MODEL,
        finishReason: 'length',
      },
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
      meta: {
        model: MOCK_AGENT_MODEL,
        finishReason: 'stop',
      },
    },
    createdAt: new Date('2025-03-07T09:02:04Z'),
  },
]