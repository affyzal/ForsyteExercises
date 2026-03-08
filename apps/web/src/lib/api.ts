import axios, { AxiosError } from 'axios';
import { Message, MessageRole } from '@/types/message';

// --- API client setup ---
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8174',
  headers: { 'Content-Type': 'application/json' },
});

// --- Shared ---

// Helper to attach auth header
const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Centralized error handling for API calls
const handleAxiosError = (err: unknown): never => {
  if (err instanceof AxiosError) {
    const message = err.response?.data?.message;
    throw new Error(
      typeof message === 'string'
        ? message
        : `Request failed: ${err.response?.status ?? 'network error'}`,
    );
  }
  throw err;
};

// --- Response shapes from the API ---

export type AgentDto = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type AgentSessionDto = {
  id: string;
  agentId: string;
  organisationId: string;
  createdAt: string;
};

export type AgentMessageDto = {
  id: string;
  sessionId: string;
  role: MessageRole;
  sequenceId: number;
  content: Message['content'];
  createdAt: string;
};

// --- API functions ---
// list agents for an organisation - used to get the agent ID needed to start a session
export const listAgents = async (
  orgSlug: string,
  token: string,
): Promise<AgentDto[]> => {
  try {
    const { data } = await apiClient.get<AgentDto[]>(`/${orgSlug}/agents`, {
      headers: authHeaders(token),
    });
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

// create a new session for an agent, returning the session details including the session ID which is needed for sending messages and fetching conversation history
export const createSession = async (
  orgSlug: string,
  agentId: string,
  token: string,
): Promise<AgentSessionDto> => {
  try {
    const { data } = await apiClient.post<AgentSessionDto>(
      `/${orgSlug}/agents/${agentId}/sessions`,
      {},
      { headers: authHeaders(token) },
    );
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

// send a message and get the full message object with id, timestamps, etc. back from the API
export const sendMessage = async (
  orgSlug: string,
  sessionId: string,
  text: string,
  token: string,
  abortSignal?: AbortSignal,
): Promise<AgentMessageDto> => {
  try {
    const { data } = await apiClient.post<AgentMessageDto>(
      `/${orgSlug}/agents/sessions/${sessionId}/messages`,
      { role: 'user', content: { text } },
      { headers: authHeaders(token), signal: abortSignal },
    );
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

//  get all messages for a session (used in the comment in useMessages)
export const getSessionMessages = async (
  orgSlug: string,
  sessionId: string,
  token: string,
): Promise<AgentMessageDto[]> => {
  try {
    const { data } = await apiClient.get<AgentMessageDto[]>(
      `/${orgSlug}/agents/sessions/${sessionId}/messages`,
      { headers: authHeaders(token) },
    );
    return data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

// --- Helpers ---
export const toMessage = (dto: AgentMessageDto): Message => ({
  id: dto.id,
  sessionId: dto.sessionId,
  role: dto.role,
  sequenceId: dto.sequenceId,
  content: dto.content,
  createdAt: new Date(dto.createdAt),
});

export type RiskAssessmentDto = {
  id: string
  organisationId: string
  clientId: string
  matterId: string
  status: 'in_progress' | 'completed'
  riskLevel?: 'low' | 'medium' | 'high'
  description?: string
  version: number
  createdAt: string
  updatedAt: string
}

// Example function to list risk assessments, which could be used in the resource link for outstanding risk assessments in the mock conversation
export const listRiskAssessments = async (
  orgSlug: string,
  token: string,
): Promise<RiskAssessmentDto[]> => {
  try {
    const { data } = await apiClient.get<RiskAssessmentDto[]>(
      `/${orgSlug}/risk/assessments`,
      { headers: authHeaders(token) },
    )
    return data
  } catch (err) {
    return handleAxiosError(err)
  }
}

export type MatterDto = {
  id: string
  organisationId: string
  clientId: string
  reference: string
  description: string
  status: 'active' | 'closed' | 'pending'
  type: string
  ownedById: string
  createdAt: string
  updatedAt: string
}

// Example function to list matters, which could be used in the resource link for matters in the mock conversation
export const listMatters = async (
  orgSlug: string,
  token: string,
): Promise<MatterDto[]> => {
  try {
    const { data } = await apiClient.get<MatterDto[]>(
      `/${orgSlug}/matters`,
      { headers: authHeaders(token) },
    )
    return data
  } catch (err) {
    return handleAxiosError(err)
  }
}