require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan'); // For logging HTTP requests
const mongoose = require('mongoose');
const moment = require('moment'); // For handling date operations
const app = express();
const port = process.env.PORT || 3000;
const Player = require('./db/schemas/User');
const cors = require('cors');

// MongoDB connection string
const mongoURI = process.env.MONGO_URI; // Replace with your MongoDB URI
console.log('mongoURI666', mongoURI);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Visitor schema
const visitorSchema = new mongoose.Schema({
  totalVisitors: { type: Number, default: 0 },
  todayVisitors: { type: Number, default: 0 },
  lastVisitDate: { type: String, default: moment().format('YYYY-MM-DD') }, // Store the last visit date
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Initialize the visitor counter if not present
async function initializeVisitorCounter() {
  let visitor = await Visitor.findOne();
  if (!visitor) {
    visitor = new Visitor();
    await visitor.save();
  }
}
initializeVisitorCounter();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
// Endpoint to fetch and update visitor count
app.get('/visitor-count', async (req, res) => {
  const currentDate = moment().format('YYYY-MM-DD');
  let visitor = await Visitor.findOne();

  // Reset today's visitor count if the date has changed
  if (visitor.lastVisitDate !== currentDate) {
    visitor.todayVisitors = 0;
    visitor.lastVisitDate = currentDate;
  }

  // Increment counts
  visitor.todayVisitors += 1;
  visitor.totalVisitors += 1;

  // Save changes to the database
  await visitor.save();

  // Respond with the counts
  res.json({
    totalVisitors: visitor.totalVisitors,
    todayVisitors: visitor.todayVisitors,
  });
});

app.get('/api/top-players', async (req, res) => {
  const players = await Player.find().sort({ score: -1 }).limit(100);
  res.json(players);
});

app.get('/api/rank', async (req, res) => {
  const { score } = req.query;
  const rank = await Player.countDocuments({ score: { $gt: score } }) + 1;
  res.json({ rank });
});
// Save score endpoint with name check
app.post('/api/save-score', async (req, res) => {
  const { name, score } = req.body;

  // Check if the name already exists in the database
  const existingPlayer = await Player.findOne({ name });
  
  if (existingPlayer) {
      return res.status(400).json({ message: 'Name already exists. Please choose a different name.' });
  }

  // If name is unique, save the new player
  const player = new Player({ name, score });
  await player.save();
  
  res.status(200).json({ message: 'Score added to global ranking!' });
});


// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
// For local development only: Use app.listen to start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;  // Needed for Vercel to work properly
