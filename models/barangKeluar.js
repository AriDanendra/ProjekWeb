const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Barang = require('./barang');

const BarangKeluar = sequelize.define('BarangKeluar', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  kode_barang: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jumlah: DataTypes.INTEGER,
  tanggal: DataTypes.DATEONLY,
  keterangan: DataTypes.STRING
}, {
  freezeTableName: true
});

Barang.hasMany(BarangKeluar, { foreignKey: 'kode_barang' });
BarangKeluar.belongsTo(Barang, { foreignKey: 'kode_barang' });

module.exports = BarangKeluar;
