// src/components/RiwayatStok.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:5000/api/barang';
const RIWAYAT_URL = 'http://localhost:5000/api/riwayat';

const RiwayatStok = () => {
  const [riwayatData, setRiwayatData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [barangList, setBarangList] = useState([]);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [barangRes, riwayatRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(RIWAYAT_URL),
      ]);
      setBarangList(barangRes.data);
      setRiwayatData(riwayatRes.data);
      setFilteredData(riwayatRes.data);
    } catch (error) {
      alert('Gagal memuat data: ' + error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = (barang, tanggal) => {
    let data = [...riwayatData];
    if (barang) {
      data = data.filter(item => item.kode_barang === barang);
    }
    if (tanggal) {
      data = data.filter(item => item.tanggal === tanggal);
    }
    setFilteredData(data);
  };

  useEffect(() => {
    handleFilter(selectedBarang, selectedTanggal);
  }, [selectedBarang, selectedTanggal, riwayatData]);

  const formatTanggal = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Riwayat Stok Barang", 14, 10);
    const rows = filteredData.map(item => [
      formatTanggal(item.tanggal),
      item.kode_barang,
      item.jenis_transaksi,
      item.jumlah,
      item.stok_sebelum,
      item.stok_sesudah,
      item.keterangan || '-'
    ]);

    autoTable(doc, {
      head: [['Tanggal', 'Kode Barang', 'Jenis', 'Jumlah', 'Sebelum', 'Sesudah', 'Keterangan']],
      body: rows,
    });

    doc.save('riwayat-stok.pdf');
  };

  return (
    <div className="main-content">
      <div className="topbar d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Riwayat Stok</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper mt-3">
        <div className="mb-3">
          <Row className="gy-2 gx-3 align-items-end">
            <Col xs={12} md={4}>
              <Form.Group controlId="filterBarang">
                <Form.Label>Filter Barang</Form.Label>
                <Form.Select
                  value={selectedBarang}
                  onChange={(e) => setSelectedBarang(e.target.value)}
                >
                  <option value="">-- Semua Barang --</option>
                  {barangList.map((barang) => (
                    <option key={barang.kode_barang} value={barang.kode_barang}>
                      {barang.kode_barang} - {barang.nama_barang}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group controlId="filterTanggal">
                <Form.Label>Filter Tanggal</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedBarang('');
                    setSelectedTanggal('');
                  }}
                >
                  Reset Filter
                </Button>
                {filteredData.length > 0 && (
                  <Button variant="danger" onClick={handleExportPDF}>
                    Ekspor PDF
                  </Button>
                )}
              </div>
            </Col>
          </Row>
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Tidak ada data riwayat</td>
                </tr>
              ) : (
                filteredData.map(item => (
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
