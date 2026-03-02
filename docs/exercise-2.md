## Exercise 2 – Ask Forsyte with backend integration

This exercise builds on Exercise 1 by wiring your “Ask Forsyte” layout to the real API in three progressively richer stages.

### Overview

- **App**: `apps/web` (Next.js frontend).
- **Backend**: `apps/api` (NestJS).
- **Goal**: Take the layout from Exercise 1 and connect it to the NestJS agent endpoints, handling three stages of increasing complexity:
  - **Stage A** – plain-text answers.
  - **Stage B** – markdown answers with `resources` links.
  - **Stage C** – multi-part answers with `finishReason: "length"` then `"stop"`.

### Prerequisites

- All prerequisites from Exercise 1 (web app running).
- API and database running and seeded:
  - `pnpm dev --filter api` (or `pnpm dev` from root).
  - `pnpm prisma:seed` from `apps/api` if needed.
- Ability to log in to the API to obtain a JWT:
  - `POST /auth/login` with a seeded user, for example:
    - `email`: `buzz.aldrin@forsyte.co`
    - `password`: `beeCompliant33`

### Authentication

- Implement a minimal login flow in `apps/web` so the user can enter email + password and obtain an access token from `POST /auth/login`.
- Store the access token (e.g. in component state or a simple client-side store).
- Send `Authorization: Bearer <accessToken>` on all Ask Forsyte agent calls:
  - `GET /:organisationIdOrSlug/agents`
  - `POST /:organisationIdOrSlug/agents/:agentId/sessions`
  - `POST /:organisationIdOrSlug/agents/sessions/:sessionId/messages`

### Common agent API behaviour

Across all stages you will use the same core endpoints in `apps/api`:

- List agents: `GET /:organisationIdOrSlug/agents`.
- Create session: `POST /:organisationIdOrSlug/agents/:agentId/sessions`.
- Send message: `POST /:organisationIdOrSlug/agents/sessions/:sessionId/messages` with body:

  ```json
  {
    "role": "user",
    "content": { "text": "..." }
  }
  ```

For every call to `sendMessage` the backend:

- Slugifies `content.text` and matches one of the seeded journey steps.
- Persists the user message with `sequenceId = existingCount + 1`.
- Persists one or more agent messages with subsequent `sequenceId`s.
- Returns the **last** agent message as `AgentMessageDto`.

Each agent message has:

- `content.text`: human-readable answer (plain or markdown).
- Optional `content.resources`: array of `{ rel, href }` links to relevant data.
- Optional `content.meta`: `{ model, finishReason }`, where `finishReason` is `"stop"` or `"length"`.

Your Exercise 1 layout should now be driven by real data from these endpoints.

### Stage A – plain-text answers

Handle the simplest case: a single plain-text answer.

- Question text (user input):

  > `Do I have matters in high risk jurisdictions?`

- Behaviour:
  - Backend persists user + one agent message.
  - Answer text summarises that there are **3 seeded matters** and **2** have higher-risk indicators.
  - `content.meta.finishReason = "stop"`.
  - `content.resources` is not required for this stage.

**Requirements**:

- Wire your layout from Exercise 1 to the real API:
  - Pick the wired agent and create a session.
  - Allow the user to send the exact question above.
  - Render both user and agent messages in order.
- You may render `content.text` as plain text at this stage.

### Stage B – markdown + resources

Add support for richer answers with markdown content and `resources`.

- Question text:

  > `How many of those have outstanding risk assessments?`

- Behaviour:
  - Backend persists user + one agent message.
  - Answer text (markdown-capable) states that **2 matters** have in-progress assessments and **1** has a completed high-risk assessment, and suggests reviewing outstanding matters.
  - `content.resources` contains at least:

    ```json
    [
      {
        "rel": "mattersWithOutstandingRiskAssessments",
        "href": "/v1/matters?organisationSlug=forsyte&riskAssessmentStatus=in_progress"
      }
    ]
    ```

  - `content.meta.finishReason = "stop"`.

**Requirements**:

- Extend the conversation UI to:
  - Treat `content.text` as markdown (e.g. paragraphs, bullet lists, links).
  - Display `resources` as clearly labelled links/buttons.
- You do not need to follow the `href`s with additional HTTP calls (though you may as a stretch goal).

### Stage C – multi-part answers

Finally, support answers that arrive in **two agent messages** per user question.

- Multi-part behaviour:
  - First agent message: `content.meta.finishReason = "length"`.
  - Second agent message: `content.meta.finishReason = "stop"`.
  - Both messages share the same conversation context (e.g. Beekeeper risk flags, or overall summary and next steps).
  - Each part may also include `resources` pointing at relevant risk endpoints (e.g. risk assessments and flags).

**Requirements**:

- Update your UI so that:
  - It fetches and displays the full session history, not just the last reply.
  - When a user sends a question expected to produce a multi-part answer, both parts appear in order.
  - The distinction between `"length"` and `"stop"` is handled sensibly (e.g. visually indicating that an answer continues, then completes).
  - `resources` for each part are rendered as in Stage B.

### Constraints

- **No backend changes**:
  - Do not modify controllers, services, Prisma schema, or seed data.
  - Treat the API as a black box with the behaviour described above.
- **Focus on frontend integration**:
  - Clear separation between data fetching and presentation.
  - Re-use and extend components from Exercise 1 where possible.

### What we look for

- **Correctness** across all three stages – the UI behaves as described for plain, markdown, and multi-part answers.
- **Re-use and composition** – building on layout and components from Exercise 1 rather than starting again.
- **State management** – clean handling of loading/error states and multiple messages per user turn.
- **Clarity** – code remains understandable even as integration complexity increases.
- **User experience** – a conversation surface that feels coherent and robust when interacting with the real backend.
