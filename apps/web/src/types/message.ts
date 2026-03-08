export type MessageRole = 'user' | 'agent'

export type MessageResource = {
  rel: string
  href: string
}

export type MessageMeta = {
  model: string
  finishReason: 'stop' | 'length'
}

export type MessageContent = {
  text: string
  resources?: MessageResource[]
  meta?: MessageMeta
}

export type Message = {
  id: string
  sessionId: string
  role: MessageRole
  sequenceId: number
  content: MessageContent
  createdAt: Date
}