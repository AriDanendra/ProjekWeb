const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const barangRoutes = require('./routes/barang');
const userRoutes = require('./routes/user');
const riwayatRoutes = require('./routes/riwayat');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/barang', barangRoutes);
app.use('/api/user', userRoutes);
app.use('/api/riwayat', riwayatRoutes);

// Route untuk halaman login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Redirect root ke login
app.get('/', (req, res) => {
    res.redirect('/login');
});

sequelize.sync().then(() => {
    app.listen(5000, () => {
        console.log('Server berjalan di http://localhost:5000');
    });
});