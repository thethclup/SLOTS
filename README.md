# Slots Snowy Orchestrator

Slots Snowy is a modern, premium, mobile-first web game featuring snowy winter-themed slot mechanics and trustless reward orchestration. It leverages ERC-8021 for deep on-chain transaction attribution and ERC-8004 for agentic trustless verifications.

## Project Overview

Slots Snowy Orchestrator is a high-performance, ERC-8004 compliant AI agent operating on Base Mainnet. It handles snowy slot mechanics, winter-themed gambling features, reward optimization, and multi-reel orchestration in a cold and strategic manner.

**Live Application:** [Slots Snowy](https://slots-snowy.vercel.app/)

## Capabilities & Skills

- snowy-slot-mechanics
- winter-themed-gambling
- reward-optimization
- multi-reel-orchestration
- spin-automation
- jackpot-hunting
- mcp-command-execution

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** TypeScript, Tailwind CSS, Framer Motion
- **Web3:** Wagmi, Viem (Base Mainnet)
- **Protocols:** ERC-8004 (Trustless Agents), ERC-8021 (Transaction Attribution)
- **Agent Orchestrator:** Model Context Protocol (MCP) server integration

## Agent Registration

The platform hosts an active ERC-8004 metadata card which can be parsed by supported registrars and A2A protocols. 
The agent details are exposed securely at the public well-known endpoint:
`https://slots-snowy.vercel.app/.well-known/agent-card.json`

## Model Context Protocol (MCP) Connection Guide

The platform exposes an active MCP JSON-RPC Server at the following endpoint:
`https://slots-snowy.vercel.app/api/mcp`

The MCP connection allows AI orchestrators, LLMs, and external services to interact dynamically with the Slots environment via defined tools (e.g., fetching statuses, interacting with mechanics). Ensure you send JSON-RPC 2.0 payloads for tool discovery (`tools/list`) and invocation (`tools/call`). 

You can also retrieve basic agent telemetry via the standard discovery endpoint at `/api/agent`.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## License

MIT
