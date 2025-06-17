// src/components/BarangKeluar.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/barang';

const BarangKeluar = () => {
  const [barang, setBarang] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '',
    tanggal_keluar: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [stokToReduce, setStokToReduce] = useState('');
  const [stokError, setStokError] = useState('');

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  const navigate = useNavigate();

  const showNotification = (message) => {
    setNotifMessage(message);
    setShowNotifModal(true);
    setTimeout(() => {
      setShowNotifModal(false);
    }, 2000);
  };

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
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setStokToReduce(value);
      setStokError('');
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const selectedItem = barang.find(item => item.kode_barang === formData.kode_barang);
      if (!selectedItem) throw new Error('Barang tidak ditemukan');

      const jumlahKeluar = parseInt(stokToReduce);
      if (isNaN(jumlahKeluar) || jumlahKeluar < 1) {
        setStokError('Jumlah stok harus minimal 1');
        return;
      }

      if ((selectedItem.stok || 0) < jumlahKeluar) {
        setStokError('Stok tidak mencukupi');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set ke awal hari
      const selectedDate = new Date(formData.tanggal_keluar);
      selectedDate.setHours(0, 0, 0, 0); // Set ke awal hari
      if (selectedDate > today) {
        throw new Error('Tanggal tidak boleh lebih dari hari ini');
      }

      const updateData = {
        ...selectedItem,
        stok: (selectedItem.stok || 0) - jumlahKeluar,
        tanggal_keluar: formData.tanggal_keluar
      };

      await axios.put(`${API_URL}/${formData.kode_barang}`, {
        ...updateData,
        keterangan: formData.keterangan || `Pengurangan stok keluar ${jumlahKeluar} unit`
      });

      setShowAddModal(false);
      setFormData({
        kode_barang: '',
        tanggal_keluar: new Date().toISOString().split('T')[0],
        keterangan: ''
      });
      setStokToReduce('');
      setStokError('');

      await loadData();
      showNotification('Barang keluar berhasil dicatat!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const formatTanggal = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
        <Button variant="danger" onClick={() => setShowAddModal(true)} className="mb-3">
          + Catat Barang Keluar
        </Button>

        <div className="table-responsive">
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
                  <td colSpan="7" className="text-center">Tidak ada data barang keluar</td>
                </tr>
              ) : (
                barangKeluar.map((item) => (
                  <tr key={item.kode_barang}>
                    <td>{item.kode_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.lokasi || '-'}</td>
                    <td>{`Rp ${(item.harga || 0).toLocaleString('id-ID')}`}</td>
                    <td>{item.stok || 0}</td>
                    <td>{item.tanggal_keluar ? formatTanggal(item.tanggal_keluar) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Tambah Barang Keluar */}
      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        setFormData({
          kode_barang: '',
          tanggal_keluar: new Date().toISOString().split('T')[0],
          keterangan: ''
        });
        setStokToReduce('');
        setStokError('');
      }}>
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
                max={new Date().toISOString().split('T')[0]}
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
                isInvalid={!!stokError}
              />
              <Form.Control.Feedback type="invalid">
                {stokError}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="keterangan" className="mb-3">
              <Form.Label>Keterangan (Opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.keterangan}
                onChange={handleInputChange}
                placeholder="Contoh: Dipakai untuk proyek X"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowAddModal(false);
              setFormData({
                kode_barang: '',
                tanggal_keluar: new Date().toISOString().split('T')[0],
                keterangan: ''
              });
              setStokToReduce('');
              setStokError('');
            }}>
              Batal
            </Button>
            <Button variant="danger" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Notifikasi Sukses */}
      <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered backdrop="static">
        <Modal.Body className="text-center">
          <div className="text-success fw-bold fs-5">{notifMessage}</div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BarangKeluar;
