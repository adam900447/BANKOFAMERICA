require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://brooks42:Vika42697@cluster0.dcatazd.mongodb.net/banking?appName=Cluster0';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Connect to MongoDB ──
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── User Schema ──
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  token:     { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ── Transaction Schema ──
const transactionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:        { type: String, enum: ['credit', 'debit'] },
  amount:      { type: Number },
  description: { type: String },
  date:        { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// ── Helpers ──
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ── Routes ──
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword(password)
    });

    return res.json({ success: true, message: 'Account created successfully.', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== hashPassword(password))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    await user.save();

    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    return res.json({ success: true, transactions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not load transactions.' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});