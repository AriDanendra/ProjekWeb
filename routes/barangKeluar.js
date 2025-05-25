const express = require('express');
const router = express.Router();
const BarangKeluar = require('../models/barangKeluar');
const Barang = require('../models/barang');

// GET semua barang keluar
router.get('/', async (req, res) => {
  const data = await BarangKeluar.findAll({ include: Barang });
  res.json(data);
});

// POST tambah barang keluar & update stok
router.post('/', async (req, res) => {
  const { kode_barang, jumlah } = req.body;
  const barang = await Barang.findByPk(kode_barang);
  if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
  if (barang.stok < jumlah) return res.status(400).json({ message: 'Stok tidak cukup' });

  barang.stok -= jumlah;
  await barang.save();
  const keluar = await BarangKeluar.create(req.body);
  res.json(keluar);
});

module.exports = router;
