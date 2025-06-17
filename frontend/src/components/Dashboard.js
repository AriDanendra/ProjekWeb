import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import { BsBoxSeam, BsBoxes, BsCurrencyDollar, BsExclamationTriangle } from 'react-icons/bs';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const API_URL = 'http://localhost:5000/api/barang';
const RIWAYAT_URL = 'http://localhost:5000/api/riwayat';

const Dashboard = () => {
  const [barang, setBarang] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStok, setTotalStok] = useState(0);
  const [totalNilai, setTotalNilai] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [grafikGabungan, setGrafikGabungan] = useState([]);

  const loadData = async () => {
    try {
      const [barangRes, riwayatRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(RIWAYAT_URL),
      ]);
      setBarang(barangRes.data);
      setRiwayat(riwayatRes.data);
      calculateTotals(barangRes.data);
      generateGrafik(barangRes.data, riwayatRes.data);
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

  const generateGrafik = (barangData, riwayatData) => {
    const masuk = {};
    const keluar = {};

    riwayatData.forEach(item => {
      const date = new Date(item.tanggal);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const jumlah = item.jumlah || 0;

      if (item.jenis_transaksi === 'MASUK') {
        masuk[key] = (masuk[key] || 0) + jumlah;
      } else if (item.jenis_transaksi === 'KELUAR') {
        keluar[key] = (keluar[key] || 0) + jumlah;
      }
    });

    const allKeys = Array.from(new Set([...Object.keys(masuk), ...Object.keys(keluar)]));
    allKeys.sort(); // Sort ascendingly by 'YYYY-MM'

    const grafik = allKeys.map(key => {
      const [year, month] = key.split('-');
      const label = new Date(year, month - 1).toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric'
      });
      return {
        bulan: label,
        masuk: masuk[key] || 0,
        keluar: keluar[key] || 0,
      };
    });

    setGrafikGabungan(grafik);
  };

  useEffect(() => {
    loadData();
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

  const barangMasukTerbaru = riwayat
    .filter(item => item.jenis_transaksi === 'MASUK')
    .slice(0, 5);

  const barangKeluarTerbaru = riwayat
    .filter(item => item.jenis_transaksi === 'KELUAR')
    .slice(0, 5);

  const getBarangByKode = (kode) => barang.find(b => b.kode_barang === kode) || {};

  return (
    <div className="main-content">
      <div className="topbar">
        <h5 className="mb-0">Dashboard Gudang</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        {/* Statistik */}
        <div className="card-box">
          <div className="card card-blue">
            <div className="d-flex align-items-center">
              <div className="me-3"><BsBoxSeam size={32} /></div>
              <div><h6>Total Barang</h6><h3>{barang.length}</h3></div>
            </div>
          </div>

          <div className="card card-green">
            <div className="d-flex align-items-center">
              <div className="me-3"><BsBoxes size={32} /></div>
              <div><h6>Total Stok</h6><h3>{totalStok}</h3></div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: '#ff9800' }}>
            <div className="d-flex align-items-center">
              <div className="me-3"><BsCurrencyDollar size={32} /></div>
              <div><h6>Total Nilai</h6><h3>Rp {totalNilai.toLocaleString('id-ID')}</h3></div>
            </div>
          </div>

          <div className="card card-red">
            <div className="d-flex align-items-center">
              <div className="me-3"><BsExclamationTriangle size={32} /></div>
              <div><h6>Stok Rendah</h6><h3>{lowStockItems}</h3></div>
            </div>
          </div>
        </div>

        {/* Grafik Gabungan */}
        <div className="mb-5">
          <h5 className="mb-3">Grafik Barang Masuk & Keluar per Bulan</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grafikGabungan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="masuk" fill="#4CAF50" name="Masuk" />
              <Bar dataKey="keluar" fill="#f44336" name="Keluar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Barang Masuk Terakhir */}
        <div className="mb-4">
          <h5 className="mb-3">Barang Masuk Terakhir</h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-success">
                <tr>
                  <th>Kode Barang</th>
                  <th>Namaa Barang</th>
                  <th>Lokasi</th>
                  <th>Jumlah</th>
                  <th>Stok Sebelum</th>
                  <th>Stok Sesudah</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {barangMasukTerbaru.map((item, idx) => {
                  const detail = getBarangByKode(item.kode_barang);
                  return (
                    <tr key={idx}>
                      <td>{item.kode_barang}</td>
                      <td>{detail.nama_barang || '-'}</td>
                      <td>{detail.lokasi || '-'}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.stok_sebelum}</td>
                      <td>{item.stok_sesudah}</td>
                      <td>{item.tanggal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Barang Keluar Terakhir */}
        <div className="mb-4">
          <h5 className="mb-3">Barang Keluar Terakhir</h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-danger">
                <tr>
                  <th>Kode Barang</th>
                  <th>Nama Barang</th>
                  <th>Lokasi</th>
                  <th>Jumlah</th>
                  <th>Stok Sebelum</th>
                  <th>Stok Sesudah</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {barangKeluarTerbaru.map((item, idx) => {
                  const detail = getBarangByKode(item.kode_barang);
                  return (
                    <tr key={idx}>
                      <td>{item.kode_barang}</td>
                      <td>{detail.nama_barang || '-'}</td>
                      <td>{detail.lokasi || '-'}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.stok_sebelum}</td>
                      <td>{item.stok_sesudah}</td>
                      <td>{item.tanggal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Barang dengan Stok Rendah */}
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
                  const hargaTotal = (item.harga || 0) * (item.stok || 0);
                  return (
                    <tr key={item.kode_barang}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.lokasi || '-'}</td>
                      <td className="text-danger fw-bold">
                        {item.stok} (Low)
                      </td>
                      <td>Rp {item.harga.toLocaleString('id-ID')}</td>
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
