import { StreamingTextResponse } from 'ai';

export const runtime = 'edge';

function getChatBackendUrl(): string {
  let rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let normalized = rawBase.replace(/\/+$/, '');
  if (!normalized.endsWith('/api/v1') && !normalized.endsWith('/api')) {
    normalized = `${normalized}/api/v1`;
  }
  return `${normalized}/ai/chat`;
}

export async function POST(req: Request) {
  try {
    const { messages, conversation_id, active_skill } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    
    let authHeader = req.headers.get('authorization') || '';
    if (!authHeader || authHeader === 'Bearer' || authHeader === 'Bearer null' || authHeader === 'Bearer undefined') {
      authHeader = 'Bearer dev-token-usr-dev-01';
    }

    const backendEndpoint = getChatBackendUrl();

    // Forward request to FastAPI authoritative AI intelligence layer
    const backendResponse = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        conversation_id,
        message: lastMessage,
        active_skill,
        stream: true,
      }),
    });


    if (!backendResponse.ok) {
      const errData = await backendResponse.json().catch(() => ({ detail: backendResponse.statusText }));
      const errorMsg = typeof errData.detail === 'string' ? errData.detail : (errData.detail?.[0]?.msg || `AI Service Error (${backendResponse.status})`);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }


    // Parse SSE stream from FastAPI backend and transform into AI SDK text stream
    const reader = backendResponse.body?.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === 'text-delta' && data.content) {
                  controller.enqueue(new TextEncoder().encode(data.content));
                } else if (data.type === 'tool-call') {
                  // Tool call event indicator
                  const tname = data.tool_call?.tool_name || 'tool';
                  // Send subtle indicator if needed
                }
              } catch (e) {
                // Ignore parse errors on stream boundary
              }
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
