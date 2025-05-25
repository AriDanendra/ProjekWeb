const express = require('express');
const router = express.Router();
const Barang = require('../models/barang');

// GET semua data barang
router.get('/', async (req, res) => {
  const data = await Barang.findAll();
  res.json(data);
});

// POST tambah barang baru
router.post('/', async (req, res) => {
  const data = await Barang.create(req.body);
  res.json(data);
});

// PUT update data barang
router.put('/:kode_barang', async (req, res) => {
  await Barang.update(req.body, { where: { kode_barang: req.params.kode_barang } });
  res.json({ message: 'Updated' });
});

// DELETE hapus barang
router.delete('/:kode_barang', async (req, res) => {
  await Barang.destroy({ where: { kode_barang: req.params.kode_barang } });
  res.json({ message: 'Deleted' });
});

module.exports = router;
