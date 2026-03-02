import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AgentRepositoryPort } from '@/modules/agent/application/ports/agent.repository.port';
import { AgentSessionRepositoryPort } from '@/modules/agent/application/ports/agent-session.repository.port';
import { AgentMessageRepositoryPort } from '@/modules/agent/application/ports/agent-message.repository.port';
import { AgentDto } from '@/modules/agent/presenters/http/dto/agent.dto';
import { AgentSessionDto } from '@/modules/agent/presenters/http/dto/agent-session.dto';
import { AgentMessageDto } from '@/modules/agent/presenters/http/dto/agent-message.dto';
import { AgentMessageRole } from '@/common/enums/agent-message-role.enum';
import slugify from 'slugify';

type JourneyResource = {
  rel: string;
  href: string;
};

type JourneyMeta = {
  model: string;
  finishReason: 'length' | 'stop';
};

type JourneyAnswerContent = {
  text: string;
  resources?: JourneyResource[];
  meta?: JourneyMeta;
};

type JourneyContext = {
  model: string;
};

type JourneyStep = {
  slug: string;
  buildAnswers: (context: JourneyContext) => JourneyAnswerContent[];
};

/** Journey steps: matched by slugified incoming text. Order of questions no longer matters. */
const JOURNEY_STEPS: JourneyStep[] = [
  {
    slug: 'do-i-have-matters-in-high-risk-jurisdictions',
    buildAnswers: (ctx) => [
      {
        text:
          'Yes, you have 3 matters on your Forsyte book. Two of those matters have indicators that they may involve higher-risk jurisdictions based on their risk assessments.',
        meta: {
          model: ctx.model,
          finishReason: 'stop',
        },
      },
    ],
  },
  {
    slug: 'how-many-of-those-have-outstanding-risk-assessments',
    buildAnswers: (ctx) => [
      {
        text:
          'Out of your 3 seeded matters, 2 currently have risk assessments in progress and 1 has a completed high-risk assessment.\n\nYou can review the outstanding matters and their assessments using the link below.',
        resources: [
          {
            rel: 'mattersWithOutstandingRiskAssessments',
            href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
          },
        ],
        meta: {
          model: ctx.model,
          finishReason: 'stop',
        },
      },
    ],
  },
  {
    slug: 'show-the-risk-assessment-flags-for-the-beekeeper-employment-contract',
    buildAnswers: (ctx) => [
      {
        text:
          'Here are the seeded risk assessment flags for the Beekeeper employment contract:\n\n- Remote identity verification: accepted\n- Identity confidence: accepted\n- Sanctions screening: accepted\n- Adverse media: pending\n- High-risk third country residence: pending\n\nI will summarise what this means and suggested next steps next.',
        resources: [
          {
            rel: 'riskAssessmentFlags',
            href: '/v1/risk-assessments/{beekeeperRiskId}/flags',
          },
        ],
        meta: {
          model: ctx.model,
          finishReason: 'length',
        },
      },
      {
        text:
          'Overall, the Beekeeper employment contract has a completed, high-risk assessment driven mainly by remote onboarding and outstanding screening checks. Typical next steps would include resolving the pending identity and adverse media checks and documenting a clear risk-based rationale before proceeding.',
        resources: [
          {
            rel: 'riskAssessmentDetails',
            href: '/v1/risk-assessments/{beekeeperRiskId}',
          },
        ],
        meta: {
          model: ctx.model,
          finishReason: 'stop',
        },
      },
    ],
  },
  {
    slug: 'summarise-the-matters-with-outstanding-items-and-suggest-next-steps',
    buildAnswers: (ctx) => [
      {
        text:
          'Across your seeded Forsyte matters, there are outstanding items on 2 in-progress risk assessments and one completed high-risk assessment on the Beekeeper employment contract. I will summarise the overall position and suggested next steps next.',
        resources: [
          {
            rel: 'mattersWithOutstandingRiskAssessments',
            href: '/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress',
          },
        ],
        meta: {
          model: ctx.model,
          finishReason: 'length',
        },
      },
      {
        text:
          'In summary, you should (1) prioritise clearing outstanding risk assessment actions on the 2 in-progress matters, (2) review and document your position on the completed high-risk Beekeeper employment contract, and (3) ensure ownership of each matter is clear so follow-up reviews happen promptly.',
        resources: [
          {
            rel: 'allSeededRiskAssessments',
            href: '/v1/risk-assessments?organisationSlug=forsyte',
          },
        ],
        meta: {
          model: ctx.model,
          finishReason: 'stop',
        },
      },
    ],
  },
] as const;

@Injectable()
export class AgentService {
  constructor(
    private readonly agentRepo: AgentRepositoryPort,
    private readonly sessionRepo: AgentSessionRepositoryPort,
    private readonly messageRepo: AgentMessageRepositoryPort,
  ) {}

  async listAgents(organisationIdOrSlug: string): Promise<AgentDto[]> {
    const agents = await this.agentRepo.findManyByOrganisationIdOrSlugOrderByName(organisationIdOrSlug);
    return agents.map((a) => this.toAgentDto(a));
  }

  async createSession(agentId: string, organisationIdOrSlug: string): Promise<AgentSessionDto> {
    const agent = await this.agentRepo.findById(agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    const organisationId = await this.agentRepo.getOrganisationIdByIdOrSlug(organisationIdOrSlug);
    if (!organisationId) {
      throw new NotFoundException('Organisation not found');
    }

    const session = await this.sessionRepo.create({
      agentId: agent.id,
      organisationId,
    });
    return this.toSessionDto(session);
  }

  async sendMessage(
    sessionId: string,
    role: AgentMessageRole,
    content: Record<string, unknown> | null,
  ): Promise<AgentMessageDto> {
    const sessionWithAgent = await this.sessionRepo.findByIdWithAgent(sessionId);
    if (!sessionWithAgent) {
      throw new NotFoundException('Session not found');
    }

    const { session, agent } = sessionWithAgent;

    const existingCount = await this.messageRepo.countBySessionId(sessionId);
    const text = typeof content?.text === 'string' ? content.text.trim() : '';
    if (!text) {
      throw new BadRequestException('Message content must include a non-empty text field.');
    }
    const messageSlug = slugify(text, { lower: true });

    const step = JOURNEY_STEPS.find((s) => s.slug === messageSlug);
    if (!step) {
      throw new BadRequestException(
        `This mock conversation only supports specific seeded questions. Received slug: "${messageSlug || '(empty)'}".`,
      );
    }

    const userSequenceId = existingCount + 1;
    const answers = step.buildAnswers({ model: agent.model });
    if (!answers.length) {
      throw new BadRequestException('Configured journey step did not provide any answers.');
    }

    const agentMessages: { id: string; sessionId: string; role: string; sequenceId: number; content: Record<string, unknown> | null; createdAt: Date }[] =
      [];

    const userMessagePromise = this.messageRepo.create({
      sessionId,
      organisationId: session.organisationId,
      role,
      sequenceId: userSequenceId,
      content: content ?? undefined,
    });

    let nextSequenceId = userSequenceId + 1;
    for (const answer of answers) {
      // eslint-disable-next-line no-await-in-loop
      const created = await this.messageRepo.create({
        sessionId,
        organisationId: session.organisationId,
        role: AgentMessageRole.Agent,
        sequenceId: nextSequenceId,
        content: {
          text: answer.text,
          ...(answer.resources && { resources: answer.resources }),
          ...(answer.meta && { meta: answer.meta }),
        },
      });
      agentMessages.push(created);
      nextSequenceId += 1;
    }

    await userMessagePromise;

    const lastAgentMessage = agentMessages.at(-1)!;
    return this.toMessageDto(lastAgentMessage);
  }

  private toAgentDto(agent: { id: string; name: string; slug: string; description: string | null; createdAt: Date; updatedAt: Date }): AgentDto {
    return plainToInstance(AgentDto, {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      description: agent.description,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }, { excludeExtraneousValues: true });
  }

  private toSessionDto(session: { id: string; agentId: string; organisationId: string; createdAt: Date }): AgentSessionDto {
    return plainToInstance(AgentSessionDto, {
      id: session.id,
      agentId: session.agentId,
      organisationId: session.organisationId,
      createdAt: session.createdAt,
    }, { excludeExtraneousValues: true });
  }

  private toMessageDto(msg: { id: string; sessionId: string; role: string; sequenceId: number; content: Record<string, unknown> | null; createdAt: Date }): AgentMessageDto {
    return plainToInstance(AgentMessageDto, {
      id: msg.id,
      sessionId: msg.sessionId,
      role: msg.role as AgentMessageRole,
      sequenceId: msg.sequenceId,
      content: msg.content,
      createdAt: msg.createdAt,
    }, { excludeExtraneousValues: true });
  }
}
