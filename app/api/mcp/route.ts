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

function handleJsonRpc(body: any) {
  if (body.method === 'initialize') {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {}, prompts: {}, resources: {} },
      serverInfo: { name: WORKER_NAME, version: WORKER_VERSION }
    };
  }
  if (body.method === 'tools/list') {
    return { tools: TOOLS };
  }
  if (body.method === 'tools/call') {
    const { name, arguments: args } = body.params || {};
    return {
      content: [{ type: 'text', text: `Simulated execution of ${name}` }],
      isError: false
    };
  }
  if (body.method === 'prompts/list') {
    return { prompts: [] };
  }
  if (body.method === 'resources/list') {
    return { resources: [] };
  }
  
  // existing logic fallback
  const cmd = (body.action || body.command || body.task || "").toLowerCase();
  let result: any = {};
  switch (cmd) {
    case "status":
    case "ping":
      result = { status: "online", agent: WORKER_NAME, message: "Reels are frozen and ready to spin!" };
      break;
    case "execute":
      result = { success: true, executed: body.params || body.command, executedAt: new Date().toISOString(), message: "Slot spin executed successfully" };
      break;
    case "get_info":
      result = { name: WORKER_NAME, wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6", platform: "Base", version: WORKER_VERSION };
      break;
    default:
      result = { success: true, message: "Command received", data: body };
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = handleJsonRpc(body);
    
    // JSON-RPC response format or old format
    const responseBody = body.jsonrpc === '2.0' ? {
      jsonrpc: "2.0",
      id: body.id,
      result: result
    } : {
      status: "success",
      agent: WORKER_NAME,
      response: result,
      receivedAt: new Date().toISOString()
    };

    return NextResponse.json(responseBody, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

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
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
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
