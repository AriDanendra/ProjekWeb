import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/barang';

const BarangMasuk = () => {
  const [barang, setBarang] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '',
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [stokToAdd, setStokToAdd] = useState(1);
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
        const { tanggal_keluar, ...rest } = item;
        return rest;
      });
      setBarang(filteredData);
      // Sort by tanggal_masuk descending
      const sortedBarangMasuk = filteredData
        .filter(item => item.tanggal_masuk)
        .sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk));
      setBarangMasuk(sortedBarangMasuk);
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
      const selectedItem = barang.find(item => item.kode_barang === formData.kode_barang);
      if (!selectedItem) throw new Error('Barang tidak ditemukan');

      // Validate the date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.tanggal);
      
      if (selectedDate > today) {
        throw new Error('Tanggal tidak boleh lebih dari hari ini');
      }

      const updateData = {
        ...selectedItem,
        stok: (selectedItem.stok || 0) + stokToAdd,
        tanggal_masuk: formData.tanggal
      };

      await axios.put(`${API_URL}/${formData.kode_barang}`, {
        ...updateData,
        keterangan: formData.keterangan || `Penambahan stok masuk ${stokToAdd} unit`,
      });

      setShowAddModal(false);
      setFormData({
        kode_barang: '',
        keterangan: '',
        tanggal: new Date().toISOString().split('T')[0] // Reset to today's date
      });
      setStokToAdd(1);

      await loadData();
      showNotification('Barang masuk berhasil dicatat!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
        <Button variant="success" onClick={() => setShowAddModal(true)} className="mb-3">
          + Tambah Barang Masuk
        </Button>

        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-success">
              <tr>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Lokasi</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Tanggal Masuk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangMasuk.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Tidak ada data barang masuk</td>
                </tr>
              ) : (
                barangMasuk.map((item) => (
                  <tr key={item.kode_barang}>
                    <td>{item.kode_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.lokasi || '-'}</td>
                    <td>{`Rp ${(item.harga || 0).toLocaleString('id-ID')}`}</td>
                    <td>{item.stok || 0}</td>
                    <td>{formatTanggal(item.tanggal_masuk)}</td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm"
                        onClick={() => navigate(`/riwayat-stok/${item.kode_barang}`)}
                      >
                        Lihat Riwayat
                      </Button>
                    </td>
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

            <Form.Group controlId="tanggal" className="mb-3">
              <Form.Label>Tanggal Masuk</Form.Label>
              <Form.Control
                type="date"
                value={formData.tanggal}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                required
              />
              <Form.Text className="text-muted">
                Pilih tanggal sesuai tanggal barang masuk
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="keterangan" className="mb-3">
              <Form.Label>Keterangan (Opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.keterangan}
                onChange={handleInputChange}
                placeholder="Contoh: Pembelian dari supplier A"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowAddModal(false);
              setFormData({
                kode_barang: '',
                keterangan: '',
                tanggal: new Date().toISOString().split('T')[0]
              });
              setStokToAdd(1);
            }}>
              Batal
            </Button>
            <Button variant="success" type="submit">Simpan</Button>
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

export default BarangMasuk;