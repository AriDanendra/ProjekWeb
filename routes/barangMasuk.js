const express = require('express');
const router = express.Router();
const BarangMasuk = require('../models/barangmasuk');
const Barang = require('../models/barang');

// GET semua barang masuk
router.get('/', async (req, res) => {
  const data = await BarangMasuk.findAll({ include: Barang });
  res.json(data);
});

// POST tambah barang masuk & update stok
router.post('/', async (req, res) => {
  const { kode_barang, jumlah } = req.body;
  const barang = await Barang.findByPk(kode_barang);
  if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

  barang.stok += jumlah;
  await barang.save();
  const masuk = await BarangMasuk.create(req.body);
  res.json(masuk);
});

module.exports = router;
