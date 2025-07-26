const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyzeRoute = require('./routes/analyze');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/analyze', analyzeRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 VibeCheck Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 VibeCheck Backend running on http://localhost:${PORT}`);
});