const express = require('express');
const app = express();

function usernameMiddleware(req, res, next) {
  req.username = req.headers['x-username'] || null;
  next();
}

function jsonArrayMiddleware(req, res, next) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'body must be valid JSON' });
    }
    if (!Array.isArray(parsed)) {
      return res.status(400).json({ error: 'body must be a JSON array' });
    }
    if (!parsed.every(item => typeof item === 'string')) {
      return res.status(400).json({ error: 'all array elements must be strings' });
    }
    req.body = parsed;
    next();
  });
}

app.post('/', usernameMiddleware, jsonArrayMiddleware, (req, res) => {
  const authLine = req.username
    ? `You are authenticated as ${req.username}.`
    : 'You are not authenticated.';
  const subjectLine = `You have requested information about ${req.body.length} subjects: ${req.body.join(', ')}.`;
  res.type('text').send(`${authLine}\n${subjectLine}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
