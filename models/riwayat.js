const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Riwayat = sequelize.define('Riwayat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kode_barang: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jenis_transaksi: DataTypes.STRING, // 'MASUK' atau 'KELUAR'
  jumlah: DataTypes.INTEGER,
  stok_sebelum: DataTypes.INTEGER,
  stok_sesudah: DataTypes.INTEGER,
  tanggal: DataTypes.DATEONLY,
  keterangan: DataTypes.STRING
}, {
  freezeTableName: true
});

module.exports = Riwayat;