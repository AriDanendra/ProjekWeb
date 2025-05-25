// src/components/BarangMasuk.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/barang';

const BarangMasuk = () => {
  const [barang, setBarang] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '',
    tanggal_masuk: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [stokToAdd, setStokToAdd] = useState(1);

  const loadData = async () => {
    try {
      const response = await axios.get(API_URL);
      const filteredData = response.data.map(item => {
        const { tanggal_keluar, ...rest } = item;
        return rest;
      });
      setBarang(filteredData);
      setBarangMasuk(filteredData.filter(item => item.tanggal_masuk));
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
    setStokToAdd(parseInt(e.target.value) || 1);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      // Find the selected item
      const selectedItem = barang.find(item => item.kode_barang === formData.kode_barang);
      
      if (!selectedItem) {
        throw new Error('Barang tidak ditemukan');
      }

      // Prepare update data
      const updateData = {
        ...selectedItem,
        stok: (selectedItem.stok || 0) + stokToAdd,
        tanggal_masuk: formData.tanggal_masuk
      };

      // Update the item
      await axios.put(`${API_URL}/${formData.kode_barang}`, updateData);
      
      setShowAddModal(false);
      setFormData({
        kode_barang: '',
        tanggal_masuk: new Date().toISOString().split('T')[0]
      });
      setStokToAdd(1);
      await loadData();
      alert('Barang masuk berhasil dicatat!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="main-content">
      <div className="topbar">
        <h5 className="mb-0">Barang Masuk</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        <Button variant="success" onClick={() => setShowAddModal(true)}>
          + Tambah Barang Masuk
        </Button>

        <div className="table-responsive mt-3">
          <Table striped bordered hover>
            <thead className="table-success">
              <tr>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Lokasi</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Tanggal Masuk</th>
              </tr>
            </thead>
            <tbody>
              {barangMasuk.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Tidak ada data barang masuk</td>
                </tr>
              ) : (
                barangMasuk.map((item) => (
                  <tr key={item.kode_barang}>
                    <td>{item.kode_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.lokasi || '-'}</td>
                    <td>{`Rp ${(item.harga || 0).toLocaleString('id-ID')}`}</td>
                    <td>{item.stok || 0}</td>
                    <td>{item.tanggal_masuk || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Tambah Barang Masuk */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Barang Masuk</Modal.Title>
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

            <Form.Group controlId="tanggal_masuk" className="mb-3">
              <Form.Label>Tanggal Masuk</Form.Label>
              <Form.Control
                type="date"
                value={formData.tanggal_masuk}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="stok" className="mb-3">
              <Form.Label>Jumlah Stok yang Ditambahkan</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={stokToAdd}
                onChange={handleStokChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BarangMasuk;