import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgentService } from '@/modules/agent/application/agent.service';
import { AgentRepositoryPort } from '@/modules/agent/application/ports/agent.repository.port';
import { AgentSessionRepositoryPort } from '@/modules/agent/application/ports/agent-session.repository.port';
import { AgentMessageRepositoryPort } from '@/modules/agent/application/ports/agent-message.repository.port';
import { AgentMessageRole } from '@/common/enums/agent-message-role.enum';

type Mock<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('AgentService - sendMessage', () => {
  let service: AgentService;
  let agentRepo: Mock<AgentRepositoryPort>;
  let sessionRepo: Mock<AgentSessionRepositoryPort>;
  let messageRepo: Mock<AgentMessageRepositoryPort>;

  const sessionId = 'session-1';
  const organisationId = 'org-1';
  const agent = {
    id: 'agent-1',
    organisationId,
    name: 'Wired Compliance Agent',
    slug: 'wired-agent',
    model: 'forsyte.ask-forsyte-mock-1-alpha-v5',
    description: 'Mock agent wired for demo conversation.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const session = {
    id: sessionId,
    agentId: agent.id,
    organisationId,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    agentRepo = {};
    sessionRepo = {
      findByIdWithAgent: jest.fn(),
      create: jest.fn(),
    } as unknown as Mock<AgentSessionRepositoryPort>;
    messageRepo = {
      countBySessionId: jest.fn(),
      create: jest.fn(),
    } as unknown as Mock<AgentMessageRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: AgentRepositoryPort, useValue: agentRepo },
        { provide: AgentSessionRepositoryPort, useValue: sessionRepo },
        { provide: AgentMessageRepositoryPort, useValue: messageRepo },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('throws NotFoundException when session is missing', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue(null);

    await expect(
      service.sendMessage(sessionId, AgentMessageRole.User, { text: 'Do I have matters in high risk jurisdictions?' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when text is empty', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue({ session, agent });

    await expect(
      service.sendMessage(sessionId, AgentMessageRole.User, { text: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for unsupported slug', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue({ session, agent });
    (messageRepo.countBySessionId as jest.Mock).mockResolvedValue(0);

    await expect(
      service.sendMessage(sessionId, AgentMessageRole.User, { text: 'Some unsupported question' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates user and single agent message with plain text and meta for high-risk jurisdictions question', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue({ session, agent });
    (messageRepo.countBySessionId as jest.Mock).mockResolvedValue(0);

    const createdAgentMessage = {
      id: 'msg-2',
      sessionId,
      role: AgentMessageRole.Agent,
      sequenceId: 2,
      content: {
        text: 'Yes, you have 3 matters on your Forsyte book. Two of those matters have indicators that they may involve higher-risk jurisdictions based on their risk assessments.',
        meta: {
          model: agent.model,
          finishReason: 'stop',
        },
      },
      createdAt: new Date(),
    };

    (messageRepo.create as jest.Mock)
      // first call: user message
      .mockResolvedValueOnce({
        id: 'msg-1',
        sessionId,
        role: AgentMessageRole.User,
        sequenceId: 1,
        content: { text: 'Do I have matters in high risk jurisdictions?' },
        createdAt: new Date(),
      })
      // second call: agent message
      .mockResolvedValueOnce(createdAgentMessage);

    const result = await service.sendMessage(
      sessionId,
      AgentMessageRole.User,
      { text: 'Do I have matters in high risk jurisdictions?' },
    );

    expect(messageRepo.countBySessionId).toHaveBeenCalledWith(sessionId);
    expect(messageRepo.create).toHaveBeenCalledTimes(2);

    expect((messageRepo.create as jest.Mock).mock.calls[0][0]).toMatchObject({
      sessionId,
      organisationId,
      role: AgentMessageRole.User,
      sequenceId: 1,
    });

    expect((messageRepo.create as jest.Mock).mock.calls[1][0]).toMatchObject({
      sessionId,
      organisationId,
      role: AgentMessageRole.Agent,
      sequenceId: 2,
    });

    expect(result.id).toBe(createdAgentMessage.id);
    expect(result.sequenceId).toBe(2);
    expect(result.content?.meta).toEqual({
      model: agent.model,
      finishReason: 'stop',
    });
  });

  it('creates user and single agent message with resources for outstanding risk assessments question', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue({ session, agent });
    (messageRepo.countBySessionId as jest.Mock).mockResolvedValue(2);

    const createdAgentMessage = {
      id: 'msg-4',
      sessionId,
      role: AgentMessageRole.Agent,
      sequenceId: 4,
      content: {
        text:
          'Out of your 3 seeded matters, 2 currently have risk assessments in progress and 1 has a completed high-risk assessment.\n\nYou can review the outstanding matters and their assessments using the link below.',
        resources: [
          {
            rel: 'mattersWithOutstandingRiskAssessments',
            href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
          },
        ],
        meta: {
          model: agent.model,
          finishReason: 'stop',
        },
      },
      createdAt: new Date(),
    };

    (messageRepo.create as jest.Mock)
      // user message (sequenceId 3)
      .mockResolvedValueOnce({
        id: 'msg-3',
        sessionId,
        role: AgentMessageRole.User,
        sequenceId: 3,
        content: { text: 'How many of those have outstanding risk assessments?' },
        createdAt: new Date(),
      })
      // agent message (sequenceId 4)
      .mockResolvedValueOnce(createdAgentMessage);

    const result = await service.sendMessage(
      sessionId,
      AgentMessageRole.User,
      { text: 'How many of those have outstanding risk assessments?' },
    );

    expect(messageRepo.create).toHaveBeenCalledTimes(2);
    expect(result.sequenceId).toBe(4);
    expect(result.content?.resources).toEqual([
      {
        rel: 'mattersWithOutstandingRiskAssessments',
        href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
      },
    ]);
    expect(result.content?.meta?.finishReason).toBe('stop');
  });

  it('creates user message and two agent messages for Beekeeper flags question and returns the last one', async () => {
    (sessionRepo.findByIdWithAgent as jest.Mock).mockResolvedValue({ session, agent });
    (messageRepo.countBySessionId as jest.Mock).mockResolvedValue(4);

    (messageRepo.create as jest.Mock)
      // user message (sequenceId 5)
      .mockResolvedValueOnce({
        id: 'msg-5',
        sessionId,
        role: AgentMessageRole.User,
        sequenceId: 5,
        content: { text: 'Show the risk assessment flags for the Beekeeper employment contract' },
        createdAt: new Date(),
      })
      // first agent message (sequenceId 6)
      .mockResolvedValueOnce({
        id: 'msg-6',
        sessionId,
        role: AgentMessageRole.Agent,
        sequenceId: 6,
        content: {
          text:
            'Here are the seeded risk assessment flags for the Beekeeper employment contract:\n\n- Remote identity verification: accepted\n- Identity confidence: accepted\n- Sanctions screening: accepted\n- Adverse media: pending\n- High-risk third country residence: pending\n\nI will summarise what this means and suggested next steps next.',
          meta: {
            model: agent.model,
            finishReason: 'length',
          },
        },
        createdAt: new Date(),
      })
      // second agent message (sequenceId 7)
      .mockResolvedValueOnce({
        id: 'msg-7',
        sessionId,
        role: AgentMessageRole.Agent,
        sequenceId: 7,
        content: {
          text: 'Overall, the Beekeeper employment contract has a completed, high-risk assessment driven mainly by remote onboarding and outstanding screening checks. Typical next steps would include resolving the pending identity and adverse media checks and documenting a clear risk-based rationale before proceeding.',
          meta: {
            model: agent.model,
            finishReason: 'stop',
          },
        },
        createdAt: new Date(),
      });

    const result = await service.sendMessage(
      sessionId,
      AgentMessageRole.User,
      { text: 'Show the risk assessment flags for the Beekeeper employment contract' },
    );

    expect(messageRepo.create).toHaveBeenCalledTimes(3);
    expect(result.sequenceId).toBe(7);
    expect(result.content?.meta?.finishReason).toBe('stop');
  });
});

