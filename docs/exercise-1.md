## Exercise 1 – Ask Forsyte layout

This exercise focuses on building the **frontend layout only** for an “Ask Forsyte” assistant in `apps/web`. You will design the conversation UI, but you do **not** need to integrate with the real API yet.

### Overview

- **App**: `apps/web` (Next.js frontend).
- **Backend**: `apps/api` (NestJS), treated as read-only/stable (but **not used** in this exercise).
- **Goal**: Design and implement the chat-style UI for an “Ask Forsyte” assistant using mocked data.

At the end of this exercise you should have a clearly structured conversation layout that can be wired up to the real API in Exercise 2.

### Prerequisites

- Installed dependencies with `pnpm install`.
- Able to run the web app with `pnpm dev --filter web` or `pnpm dev` from the root.

You do **not** need to run the API or seed the database for Exercise 1.

### Requirements

Build the core “Ask Forsyte” layout in `apps/web`, including:

- A main page or route that acts as the **assistant screen**.
- A conversation area that can display a sequence of messages, with visual distinction between:
  - User messages.
  - Agent messages.
- A message input area:
  - Text box for the user’s question.
  - Clear “Send” action (button or equivalent).
- A sensible layout that would scale to multiple messages:
  - Scrolling behaviour.
  - Responsive behaviour (desktop-first is fine, but don’t make it brittle).

For this exercise, you should:

- Use **mocked conversation data** in component state or fixtures (no network calls).
- Simulate at least a couple of turns so that:
  - You can demonstrate how messages from different roles render.
  - The layout looks realistic enough to be wired to the API later.

### Constraints

- **Frontend only**:
  - Do not change `apps/api` code, schema, or seed data as part of the exercise.
  - Do not call the real API; use mocked data instead.
  - You do **not** need to handle login or authentication in this exercise.
- **Tooling**:
  - You may install small, standard client-side libraries if explicitly allowed; otherwise, prefer using what’s already in the repo.

### What we look for

- **Layout quality** – a clear, usable conversation layout that will be easy to integrate in Exercise 2.
- **Code quality** – clear React components and sensible state structure for rendering messages.
- **UX** – a UI that feels like a real assistant surface even with mocked data (good spacing, typography, and basic interaction).
