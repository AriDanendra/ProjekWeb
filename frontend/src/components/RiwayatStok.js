// src/components/RiwayatStok.js
import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/barang';
const RIWAYAT_URL = 'http://localhost:5000/api/riwayat';

const RiwayatStok = () => {
  const [riwayatData, setRiwayatData] = useState([]);
  const [selectedBarangRiwayat, setSelectedBarangRiwayat] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const navigate = useNavigate();

  const loadRiwayat = async () => {
    try {
      const response = await axios.get(RIWAYAT_URL);
      setRiwayatData(response.data);
    } catch (error) {
      alert('Gagal memuat riwayat: ' + error.message);
    }
  };

  const loadRiwayatByBarang = async (kodeBarang) => {
    try {
      const response = await axios.get(`${API_URL}/${kodeBarang}/riwayat`);
      setSelectedBarangRiwayat({
        kode_barang: kodeBarang,
        data: response.data
      });
    } catch (error) {
      alert('Gagal memuat riwayat barang: ' + error.message);
    }
  };

  const loadBarangList = async () => {
    try {
      const response = await axios.get(API_URL);
      setBarangList(response.data);
    } catch (error) {
      alert('Gagal memuat daftar barang: ' + error.message);
    }
  };

  useEffect(() => {
    loadRiwayat();
    loadBarangList();
  }, []);

  const formatTanggal = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="main-content">
      <div className="topbar">
        <h5 className="mb-0">Riwayat Stok</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        <div className="mb-3">
          {selectedBarangRiwayat && (
            <Button 
              variant="secondary" 
              onClick={() => setSelectedBarangRiwayat(null)}
              className="me-2"
            >
              Kembali ke Semua Riwayat
            </Button>
          )}
          
          {!selectedBarangRiwayat && (
            <div className="mb-3">
              <h6>Filter Riwayat:</h6>
              <select 
                className="form-select"
                onChange={(e) => {
                  if (e.target.value) {
                    loadRiwayatByBarang(e.target.value);
                  }
                }}
              >
                <option value="">-- Pilih Barang --</option>
                {barangList.map(item => (
                  <option key={item.kode_barang} value={item.kode_barang}>
                    {item.kode_barang} - {item.nama_barang}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="fw-bold">
            {selectedBarangRiwayat 
              ? `Riwayat Stok Barang: ${selectedBarangRiwayat.kode_barang}` 
              : 'Semua Riwayat Stok'}
          </span>
        </div>

        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-info">
              <tr>
                <th>Tanggal</th>
                <th>Kode Barang</th>
                <th>Jenis Transaksi</th>
                <th>Jumlah</th>
                <th>Stok Sebelum</th>
                <th>Stok Sesudah</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {(selectedBarangRiwayat ? selectedBarangRiwayat.data : riwayatData).length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Tidak ada data riwayat</td>
                </tr>
              ) : (
                (selectedBarangRiwayat ? selectedBarangRiwayat.data : riwayatData).map((item) => (
                  <tr key={item.id}>
                    <td>{formatTanggal(item.tanggal)}</td>
                    <td>{item.kode_barang}</td>
                    <td>
                      <span className={`badge ${item.jenis_transaksi === 'MASUK' ? 'bg-success' : 'bg-danger'}`}>
                        {item.jenis_transaksi}
                      </span>
                    </td>
                    <td>{item.jumlah}</td>
                    <td>{item.stok_sebelum}</td>
                    <td>{item.stok_sesudah}</td>
                    <td>{item.keterangan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatStok;