// 👉 Mengimpor class Sequelize dari package sequelize. Ini adalahclass utama yang digunakan untuk membuat koneksi ke database danmengelola ORM.
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('db_inventory', 'root', '', {
 host: 'localhost',
 dialect: 'mysql'
});
module.exports = sequelize;