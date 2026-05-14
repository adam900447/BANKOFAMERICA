const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const transactionsFile = path.join(dataDir, 'transactions.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function readJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (error) {
    return [];
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const users = await readJson(usersFile);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const users = await readJson(usersFile);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeJson(usersFile, users);

  return res.json({ success: true, message: 'Account created successfully.', user: { name: newUser.name, email: newUser.email } });
});

app.get('/api/transactions', async (req, res) => {
  const transactions = await readJson(transactionsFile);
  return res.json({ success: true, transactions });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
