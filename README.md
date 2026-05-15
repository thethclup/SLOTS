# Slots Snowy

Slots Snowy is a modern, premium, mobile-first web game featuring snowy winter-themed slot mechanics and trustless reward orchestration. It leverages ERC-8021 for deep on-chain transaction attribution and ERC-8004 for agentic trustless verifications.

## Features

- **Winter / Neon Aesthetic**: A beautiful casino aesthetic with satisfying gameplay and juicy animations.
- **On-chain Integration**: Powered by Base Mainnet. Records biggest wins using SIWE (Sign-In with Ethereum) signatures. 
- **ERC-8004 Trustless Agents**: Implements agentic verifications for provably fair spin outcomes.
- **ERC-8021 Transaction Attribution**: Full tracking of builder and campaign attributions on-chain.
- **MCP Endpoint**: Embedded Model Context Protocol (MCP) server integration for orchestration tasks.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Web3**: Wagmi, Viem (Base chain)
- **Agent Orchestrator**: Supports automated A2A and MCP interactions.

## Agent Information

The platform hosts an active ERC-8004 compatible AI Agent named **Slots Snowy Orchestrator**. 
You can view the agent capabilities via the `.well-known/agent-card.json` endpoint or query the agent directly via `/api/agent` and `/api/mcp`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## License

MIT
