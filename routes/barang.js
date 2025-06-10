const express = require('express');
const router = express.Router();
const Barang = require('../models/barang');
const Riwayat = require('../models/riwayat');

// GET semua data barang + tanggal masuk & keluar terakhir
router.get('/', async (req, res) => {
  const barangList = await Barang.findAll();

  const hasil = await Promise.all(barangList.map(async (barang) => {
    const masuk = await Riwayat.findOne({
      where: { kode_barang: barang.kode_barang, jenis_transaksi: 'MASUK' },
      order: [['tanggal', 'DESC']]
    });

    const keluar = await Riwayat.findOne({
      where: { kode_barang: barang.kode_barang, jenis_transaksi: 'KELUAR' },
      order: [['tanggal', 'DESC']]
    });

    return {
      ...barang.toJSON(),
      tanggal_masuk: masuk?.tanggal || null,
      tanggal_keluar: keluar?.tanggal || null
    };
  }));

  res.json(hasil);
});

// POST tambah barang baru
router.post('/', async (req, res) => {
  const barang = await Barang.create(req.body);

  await Riwayat.create({
    kode_barang: barang.kode_barang,
    jenis_transaksi: 'MASUK',
    jumlah: barang.stok,
    stok_sebelum: 0,
    stok_sesudah: barang.stok,
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: 'Stok awal'
  });

  res.json(barang);
});

// PUT update data barang + catat riwayat
// PUT update data barang
router.put('/:kode_barang', async (req, res) => {
  const barang = await Barang.findOne({ where: { kode_barang: req.params.kode_barang } });

  if (!barang) {
    return res.status(404).json({ message: 'Barang tidak ditemukan' });
  }

  // Jika ada perubahan stok
  if (req.body.stok !== undefined && req.body.stok !== barang.stok) {
    const jumlahPerubahan = req.body.stok - barang.stok;
    const jenisTransaksi = jumlahPerubahan > 0 ? 'MASUK' : 'KELUAR';

    // Gunakan tanggal dari body jika ada, kalau tidak pakai hari ini
    const tanggalTransaksi = req.body.tanggal_keluar || req.body.tanggal_masuk || new Date().toISOString().split('T')[0];

    await Riwayat.create({
      kode_barang: req.params.kode_barang,
      jenis_transaksi: jenisTransaksi,
      jumlah: Math.abs(jumlahPerubahan),
      stok_sebelum: barang.stok,
      stok_sesudah: req.body.stok,
      tanggal: tanggalTransaksi, // ← ini yang penting
      keterangan: req.body.keterangan || 'Perubahan stok'
    });
  }

  await Barang.update(req.body, { where: { kode_barang: req.params.kode_barang } });
  res.json({ message: 'Updated' });
});

// DELETE hapus barang
router.delete('/:kode_barang', async (req, res) => {
  await Barang.destroy({ where: { kode_barang: req.params.kode_barang } });
  res.json({ message: 'Deleted' });
});

// GET riwayat per barang
router.get('/:kode_barang/riwayat', async (req, res) => {
  const riwayat = await Riwayat.findAll({
    where: { kode_barang: req.params.kode_barang },
    order: [['tanggal', 'DESC']]
  });
  res.json(riwayat);
});

module.exports = router;
