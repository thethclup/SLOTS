import { NextResponse } from 'next/server';

const WORKER_NAME = "Slots Snowy Orchestrator";
const WORKER_VERSION = "1.0.0";

const TOOLS = [
  {
    name: 'get_race_status',
    description: 'Get the current status of a race.',
    inputSchema: { type: 'object', properties: { raceId: { type: 'string' } }, required: ['raceId'] }
  },
  {
    name: 'start_race',
    description: 'Start a new race on a given track.',
    inputSchema: { type: 'object', properties: { trackId: { type: 'string' } }, required: ['trackId'] }
  },
  {
    name: 'get_leaderboard',
    description: 'Get the leaderboard for the current tournament.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'optimize_speed',
    description: 'Optimize the speed settings for an agent.',
    inputSchema: { type: 'object', properties: { agentId: { type: 'string' } }, required: ['agentId'] }
  },
  {
    name: 'get_track_info',
    description: 'Get details about a specific track.',
    inputSchema: { type: 'object', properties: { trackId: { type: 'string' } }, required: ['trackId'] }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.method === 'initialize') {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, prompts: {}, resources: {} },
          serverInfo: { name: WORKER_NAME, version: WORKER_VERSION }
        }
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (body.method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: { tools: TOOLS }
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (body.method === 'tools/call') {
      const { name } = body.params || {};
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: 'text', text: `Simulated execution of ${name}` }],
          isError: false
        }
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (body.method === 'prompts/list') {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: { prompts: [] }
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (body.method === 'resources/list') {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: { resources: [] }
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json({
      status: "success",
      agent: WORKER_NAME,
      receivedAt: new Date().toISOString(),
      response: { success: true, message: "Command received", data: body }
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to process request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    protocol: "MCP",
    version: WORKER_VERSION,
    name: WORKER_NAME,
    status: "active",
    description: "Active MCP server for Slots Snowy Orchestrator",
    capabilities: ["snowy-slot-mechanics", "reward-optimization", "multi-reel-orchestration"],
    timestamp: new Date().toISOString()
  }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
