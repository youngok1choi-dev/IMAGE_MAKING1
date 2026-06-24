export const config = {
  runtime: 'edge', // Edge Runtime 사용 (빠른 응답 속도, Vercel 권장)
};

export default async function handler(req) {
  // CORS 처리 (OPTIONS 요청)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { messages, system, apiKey: clientApiKey } = body;

    const apiKey = clientApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API 키가 필요합니다. 환경 변수를 설정하거나 요청에 포함해주세요.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // 최신 Sonnet 모델 (혹은 claude-3-sonnet-20240229)
        max_tokens: 1000,
        temperature: 0.7,
        system: system,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API Error:', response.status, errorData);
      return new Response(JSON.stringify({ error: `Claude API Error: ${response.status}`, details: errorData }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
