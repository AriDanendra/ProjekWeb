const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Barang = sequelize.define('Barang', {
  kode_barang: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  nama_barang: DataTypes.STRING,
  lokasi: DataTypes.STRING,
  harga: DataTypes.INTEGER,
  stok: DataTypes.INTEGER
}, {
  freezeTableName: true
});

module.exports = Barang;
