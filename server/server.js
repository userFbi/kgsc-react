const express = require('express');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Google Public DNS

const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
