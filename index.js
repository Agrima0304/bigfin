const express = require('express');
const bodyParser = require('body-parser');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3556;

app.use(bodyParser.json());

const swaggerDocs = YAML.load("swagger.yaml")
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

let players = [];

// POST /players – Creates a new entry for a player
app.post('/players', (req, res) => {
  const { id, name, country, score } = req.body;

  if (!id || !name || !country || !score) {
    return res.status(400).json({ error: 'All attributes are mandatory' });
  }

  if (name.length > 15) {
    return res.status(400).json({ error: 'Name should have a maximum of 15 characters' });
  }

  const player = { id, name, country, score };
  players.push(player);
  res.status(201).json(player);
});

// PUT /players/:id – Updates the player attributes. Only name and score can be updated
app.put('/players/:id', (req, res) => {
  const { id } = req.params;
  const { name, score } = req.body;

  const player = players.find(p => p.id === id);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  if (name) {
    player.name = name;
  }

  if (score !== undefined) {
    player.score = score;
  }

  res.json(player);
});

// DELETE /players/:id – Deletes the player entry
app.delete('/players/:id', (req, res) => {
  const { id } = req.params;

  players = players.filter(p => p.id !== id);

  res.json({ message: 'Player deleted successfully' });
});

// GET /players – Displays the list of all players in descending order
app.get('/players', (req, res) => {
  if (!Array.isArray(players)) {
    players = [];
  }

  const sortedPlayers = players.sort((a, b) => b.score - a.score);
  res.json(sortedPlayers);
});

// GET /players/rank/:val – Fetches the player ranked “val”
app.get('/players/rank/:val', (req, res) => {
  const { val } = req.params;
  const rankedPlayer = players[val - 1];

  if (!rankedPlayer) {
    return res.status(404).json({ error: 'Player not found for the given rank' });
  }

  res.json(rankedPlayer);
});

// GET /players/random – Fetches a random player
app.get('/players/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * players.length);
  const randomPlayer = players[randomIndex];
  res.json(randomPlayer);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
