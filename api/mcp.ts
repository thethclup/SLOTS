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

export default async function handler(req: any, res: any) {
  // CORS & Cache Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      protocol: "MCP",
      version: WORKER_VERSION,
      name: WORKER_NAME,
      status: "active",
      description: "Active MCP server for Slots Snowy Orchestrator",
      capabilities: {
        tools: { listChanged: true },
        prompts: {},
        resources: {}
      },
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const reqId = body.id || null;
      
      if (body.method === 'initialize') {
        return res.status(200).json({
          jsonrpc: "2.0",
          ...(reqId ? { id: reqId } : {}),
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { 
              tools: { listChanged: true }, 
              prompts: {}, 
              resources: {} 
            },
            serverInfo: { name: WORKER_NAME, version: WORKER_VERSION }
          }
        });
      }
      
      if (body.method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: "2.0",
          ...(reqId ? { id: reqId } : {}),
          result: { tools: TOOLS }
        });
      }
      
      if (body.method === 'tools/call') {
        const { name } = body.params || {};
        return res.status(200).json({
          jsonrpc: "2.0",
          ...(reqId ? { id: reqId } : {}),
          result: {
            content: [{ type: 'text', text: `Simulated execution of ${name}` }],
            isError: false
          }
        });
      }
      
      if (body.method === 'prompts/list') {
        return res.status(200).json({
          jsonrpc: "2.0",
          ...(reqId ? { id: reqId } : {}),
          result: { prompts: [] }
        });
      }
      
      if (body.method === 'resources/list') {
        return res.status(200).json({
          jsonrpc: "2.0",
          ...(reqId ? { id: reqId } : {}),
          result: { resources: [] }
        });
      }
      
      // Fallback
      return res.status(200).json({
        status: "success",
        agent: WORKER_NAME,
        receivedAt: new Date().toISOString(),
        response: { success: true, message: "Command received", data: body }
      });
    } catch (e) {
      return res.status(400).json({ status: "error", message: "Failed to process request" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
