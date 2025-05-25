// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import { BsBoxSeam, BsBoxes, BsCurrencyDollar, BsExclamationTriangle, BsBoxArrowRight } from 'react-icons/bs';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/barang';

const Dashboard = () => {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStok, setTotalStok] = useState(0);
  const [totalNilai, setTotalNilai] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  const loadBarang = async () => {
    try {
      const response = await axios.get(API_URL);
      setBarang(response.data);
      calculateTotals(response.data);
      setLoading(false);
    } catch (error) {
      setError('Gagal memuat data: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const calculateTotals = (data) => {
    let stok = 0;
    let nilai = 0;
    let lowStock = 0;

    data.forEach((item) => {
      const h = item.harga || 0;
      const s = item.stok || 0;
      stok += s;
      nilai += h * s;
      if (s < 5) lowStock++;
    });

    setTotalStok(stok);
    setTotalNilai(nilai);
    setLowStockItems(lowStock);
  };

  useEffect(() => {
    loadBarang();
    // eslint-disable-next-line
  }, []);
  

  if (loading) {
    return (
      <div className="main-content">
        <div className="topbar">
          <h5 className="mb-0">Dashboard Gudang</h5>
          <div className="admin d-flex align-items-center gap-2">
            <AvatarInisial nama="Admin" />
            <span>Admin</span>
          </div>
        </div>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="topbar">
          <h5 className="mb-0">Dashboard Gudang</h5>
          <div className="admin d-flex align-items-center gap-2">
            <AvatarInisial nama="Admin" />
            <span>Admin</span>
          </div>
        </div>
        <div className="alert alert-danger m-3" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  // Barang masuk terakhir (5 terbaru)
  const recentItems = [...barang]
    .sort((a, b) => new Date(b.tanggal_masuk || 0) - new Date(a.tanggal_masuk || 0))
    .slice(0, 5);

  // Barang keluar terakhir (5 terbaru)
  const recentOutItems = [...barang]
    .filter(item => item.tanggal_keluar)
    .sort((a, b) => new Date(b.tanggal_keluar || 0) - new Date(a.tanggal_keluar || 0))
    .slice(0, 5);

  return (
    <div className="main-content">
      {/* Topbar - matching DataBarang.js */}
      <div className="topbar">
        <h5 className="mb-0">Dashboard Gudang</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        {/* Statistik Cards */}
        <div className="card-box">
          <div className="card card-blue">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <BsBoxSeam size={32} />
              </div>
              <div>
                <h6>Total Barang</h6>
                <h3>{barang.length}</h3>
              </div>
            </div>
          </div>

          <div className="card card-green">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <BsBoxes size={32} />
              </div>
              <div>
                <h6>Total Stok</h6>
                <h3>{totalStok}</h3>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: '#ff9800' }}>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <BsCurrencyDollar size={32} />
              </div>
              <div>
                <h6>Total Nilai</h6>
                <h3>Rp {totalNilai.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>

          <div className="card card-red">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <BsExclamationTriangle size={32} />
              </div>
              <div>
                <h6>Stok Rendah</h6>
                <h3>{lowStockItems}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Barang Masuk Terakhir */}
        <div className="mb-4">
          <h5 className="mb-3">Barang Masuk Terakhir</h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-success">
                <tr>
                  <th>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th>Lokasi</th>
                  <th>Stok</th>
                  <th>Harga Satuan</th>
                  <th>Harga Total</th>
                  <th>Tanggal Masuk</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map(item => {
                  const hargaSatuan = item.harga || 0;
                  const stok = item.stok || 0;
                  const hargaTotal = hargaSatuan * stok;
                  
                  return (
                    <tr key={item.kode_barang}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.lokasi || '-'}</td>
                      <td className={stok < 5 ? 'text-danger fw-bold' : ''}>
                        {stok} {stok < 5 && '(Low)'}
                      </td>
                      <td>Rp {hargaSatuan.toLocaleString('id-ID')}</td>
                      <td>Rp {hargaTotal.toLocaleString('id-ID')}</td>
                      <td>{item.tanggal_masuk || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Barang Keluar Terakhir */}
        <div className="mb-4">
          <h5 className="mb-3">
            Barang Keluar Terakhir
          </h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-danger">
                <tr>
                  <th>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th>Lokasi</th>
                  <th>Stok</th>
                  <th>Harga Satuan</th>
                  <th>Tanggal Keluar</th>
                </tr>
              </thead>
              <tbody>
                {recentOutItems.map(item => {
                  const hargaSatuan = item.harga || 0;
                  const stok = item.stok || 0;
                  
                  return (
                    <tr key={item.kode_barang}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.lokasi || '-'}</td>
                      <td className={stok < 5 ? 'text-danger fw-bold' : ''}>
                        {stok} {stok < 5 && '(Low)'}
                      </td>
                      <td>Rp {hargaSatuan.toLocaleString('id-ID')}</td>
                      <td>{item.tanggal_keluar || '-'}</td>
                    </tr>
                  );
                })}
                {recentOutItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Tidak ada data barang keluar
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Daftar Barang dengan Stok Rendah */}
        <div>
          <h5 className="mb-3">Barang dengan Stok Rendah (&lt;5)</h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-success">
                <tr>
                  <th>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th>Lokasi</th>
                  <th>Stok</th>
                  <th>Harga Satuan</th>
                  <th>Harga Total</th>
                </tr>
              </thead>
              <tbody>
                {barang.filter(item => (item.stok || 0) < 5).map(item => {
                  const hargaSatuan = item.harga || 0;
                  const stok = item.stok || 0;
                  const hargaTotal = hargaSatuan * stok;
                  
                  return (
                    <tr key={item.kode_barang}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.lokasi || '-'}</td>
                      <td className="text-danger fw-bold">
                        {stok} (Low)
                      </td>
                      <td>Rp {hargaSatuan.toLocaleString('id-ID')}</td>
                      <td>Rp {hargaTotal.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
                {barang.filter(item => (item.stok || 0) < 5).length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Tidak ada barang dengan stok rendah
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;