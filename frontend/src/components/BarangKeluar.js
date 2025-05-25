// src/components/BarangKeluar.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/barang';

const BarangKeluar = () => {
  const [barang, setBarang] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '',
    tanggal_keluar: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [stokToReduce, setStokToReduce] = useState(1);

  const loadData = async () => {
    try {
      const response = await axios.get(API_URL);
      const filteredData = response.data.map(item => {
        const { tanggal_masuk, ...rest } = item;
        return rest;
      });
      setBarang(filteredData);
      setBarangKeluar(filteredData.filter(item => item.tanggal_keluar));
    } catch (error) {
      alert('Gagal memuat data: ' + error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleStokChange = (e) => {
    setStokToReduce(parseInt(e.target.value) || 1);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      // Find the selected item
      const selectedItem = barang.find(item => item.kode_barang === formData.kode_barang);
      
      if (!selectedItem) {
        throw new Error('Barang tidak ditemukan');
      }

      // Validate stock
      if ((selectedItem.stok || 0) < stokToReduce) {
        throw new Error('Stok tidak mencukupi');
      }

      // Prepare update data
      const updateData = {
        ...selectedItem,
        stok: (selectedItem.stok || 0) - stokToReduce,
        tanggal_keluar: formData.tanggal_keluar
      };

      // Update the item
      await axios.put(`${API_URL}/${formData.kode_barang}`, updateData);
      
      setShowAddModal(false);
      setFormData({
        kode_barang: '',
        tanggal_keluar: new Date().toISOString().split('T')[0]
      });
      setStokToReduce(1);
      await loadData();
      alert('Barang keluar berhasil dicatat!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="main-content">
      <div className="topbar">
        <h5 className="mb-0">Barang Keluar</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        <Button variant="danger" onClick={() => setShowAddModal(true)}>
          + Catat Barang Keluar
        </Button>

        <div className="table-responsive mt-3">
          <Table striped bordered hover>
            <thead className="table-danger">
              <tr>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Lokasi</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Tanggal Keluar</th>
              </tr>
            </thead>
            <tbody>
              {barangKeluar.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Tidak ada data barang keluar</td>
                </tr>
              ) : (
                barangKeluar.map((item) => (
                  <tr key={item.kode_barang}>
                    <td>{item.kode_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.lokasi || '-'}</td>
                    <td>{`Rp ${(item.harga || 0).toLocaleString('id-ID')}`}</td>
                    <td>{item.stok || 0}</td>
                    <td>{item.tanggal_keluar || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Catat Barang Keluar */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Catat Barang Keluar</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAdd}>
          <Modal.Body>
            <Form.Group controlId="kode_barang" className="mb-3">
              <Form.Label>Pilih Barang</Form.Label>
              <Form.Control
                as="select"
                value={formData.kode_barang}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Pilih Barang --</option>
                {barang.map(item => (
                  <option key={item.kode_barang} value={item.kode_barang}>
                    {item.kode_barang} - {item.nama_barang} (Stok: {item.stok || 0})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="tanggal_keluar" className="mb-3">
              <Form.Label>Tanggal Keluar</Form.Label>
              <Form.Control
                type="date"
                value={formData.tanggal_keluar}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="stok" className="mb-3">
              <Form.Label>Jumlah Stok yang Dikeluarkan</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={stokToReduce}
                onChange={handleStokChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="danger" type="submit">
              Catat Keluar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BarangKeluar;