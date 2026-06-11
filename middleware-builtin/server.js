const express = require('express');
const app = express();

function usernameMiddleware(req, res, next) {
  req.username = req.headers['x-username'] || null;
  next();
}

app.use(express.json());

app.post('/', usernameMiddleware, (req, res) => {
  const subjects = req.body;
  if (!Array.isArray(subjects)) {
    return res.status(400).json({ error: 'body must be a JSON array' });
  }
  if (!subjects.every(item => typeof item === 'string')) {
    return res.status(400).json({ error: 'all array elements must be strings' });
  }
  const authLine = req.username
    ? `You are authenticated as ${req.username}.`
    : 'You are not authenticated.';
  const subjectLine = `You have requested information about ${subjects.length} subjects: ${subjects.join(', ')}.`;
  res.type('text').send(`${authLine}\n${subjectLine}`);
});

// Catches body-parser parse errors and returns a consistent JSON 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'body must be valid JSON' });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
