const express = require('express');
const router = express.Router();
const Riwayat = require('../models/riwayat');

// GET semua riwayat
router.get('/', async (req, res) => {
  const data = await Riwayat.findAll({
    order: [['tanggal', 'DESC'], ['createdAt', 'DESC']]
  });
  res.json(data);
});

// GET riwayat berdasarkan tanggal
router.get('/:tanggal', async (req, res) => {
  const data = await Riwayat.findAll({
    where: { tanggal: req.params.tanggal },
    order: [['createdAt', 'DESC']]
  });
  res.json(data);
});

module.exports = router;