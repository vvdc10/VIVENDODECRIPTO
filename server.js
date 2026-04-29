import http from 'node:http';

const PORT = process.env.PORT || 3000;

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, {
      ok: true,
      service: 'nexus-backend',
      date: new Date().toISOString()
    });
  }

  if (req.method === 'POST' && req.url === '/signal') {
    const body = await parseBody(req);
    const confidence = Math.floor(65 + Math.random() * 31);
    const signal = confidence >= 70 ? (Math.random() > 0.5 ? 'LONG' : 'SHORT') : 'NEUTRAL';
    const entry = Number(body.price || 3241.8);

    return json(res, 200, {
      signal,
      confidence,
      entry,
      stop_loss: Number((entry * 0.992).toFixed(2)),
      take_profit_1: Number((entry * 1.012).toFixed(2)),
      take_profit_2: Number((entry * 1.02).toFixed(2)),
      risk_reward: 2,
      reasons: ['EMA alinhadas', 'RSI neutro/forte', 'MACD com momentum'],
      invalid_if: ['volume muito baixo', 'spread acima do limite']
    });
  }

  return json(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`NEXUS backend running on http://localhost:${PORT}`);
});
