// src/components/DataBarang.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import AvatarInisial from './AvatarInisial';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/barang';

const DataBarang = () => {
  const [barang, setBarang] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [errorKode, setErrorKode] = useState('');
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    lokasi: '',
    harga: '',
    stok: 0
  });
  const [totalStok, setTotalStok] = useState(0);
  const [totalNilai, setTotalNilai] = useState(0);

  const lokasiOptions = ['Rak 1', 'Rak 2','Rak 3', 'Rak 4'];

  const loadBarang = async () => {
    try {
      const response = await axios.get(API_URL);
      setBarang(response.data);
      calculateTotals(response.data);
    } catch (error) {
      alert('Gagal memuat data: ' + error.message);
    }
  };

  const calculateTotals = (data) => {
    let stok = 0;
    let nilai = 0;

    data.forEach((item) => {
      const h = item.harga || 0;
      const s = item.stok || 0;
      stok += s;
      nilai += h * s;
    });

    setTotalStok(stok);
    setTotalNilai(nilai);
  };

  useEffect(() => {
    loadBarang();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'kode_barang') setErrorKode('');
    setFormData({
      ...formData,
      [id]: id === 'harga' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const isKodeExist = barang.some(item => item.kode_barang === formData.kode_barang);
    if (isKodeExist) {
      setErrorKode('Kode barang sudah digunakan.');
      return;
    }

    try {
      setErrorKode('');
      const dataToSubmit = { ...formData, stok: 0 };
      await axios.post(API_URL, dataToSubmit);
      setShowAddModal(false);
      setFormData({
        kode_barang: '',
        nama_barang: '',
        lokasi: '',
        harga: '',
        stok: 0
      });
      await loadBarang();
      alert('Data berhasil ditambahkan!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      lokasi: item.lokasi || '',
      harga: item.harga || '',
      stok: item.stok || 0
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.kode_barang}`, formData);
      setShowEditModal(false);
      await loadBarang();
      alert('Data berhasil diperbarui!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await axios.delete(`${API_URL}/${deleteTargetId}`);
      setShowDeleteModal(false);
      await loadBarang();
      alert('Data berhasil dihapus!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="main-content">
      <div className="topbar">
        <h5 className="mb-0">Data Barang</h5>
        <div className="admin d-flex align-items-center gap-2">
          <AvatarInisial nama="Admin" />
          <span>Admin</span>
        </div>
      </div>

      <div className="container-wrapper">
        <Button variant="success" onClick={() => setShowAddModal(true)}>
          + Tambah Barang
        </Button>

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
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barang.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Tidak ada data barang</td>
                </tr>
              ) : (
                barang.map((item) => {
                  const hargaSatuan = item.harga || 0;
                  const stok = item.stok || 0;
                  const hargaTotal = hargaSatuan * stok;

                  return (
                    <tr key={item.kode_barang}>
                      <td>{item.kode_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{item.lokasi || '-'}</td>
                      <td>{stok}</td>
                      <td>{`Rp ${hargaSatuan.toLocaleString('id-ID')}`}</td>
                      <td>{`Rp ${hargaTotal.toLocaleString('id-ID')}`}</td>
                      <td>
                        <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>{' '}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.kode_barang)}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
              {barang.length > 0 && (
                <tr className="fw-bold bg-light">
                  <td colSpan="3" className="text-end">Total</td>
                  <td>{totalStok}</td>
                  <td>{`Rp ${barang.reduce((sum, item) => sum + (item.harga || 0), 0).toLocaleString('id-ID')}`}</td>
                  <td>{`Rp ${totalNilai.toLocaleString('id-ID')}`}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Tambah Barang */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Barang</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAdd}>
          <Modal.Body>
            <Form.Control
              type="text"
              className={`mb-1 ${errorKode ? 'is-invalid' : ''}`}
              id="kode_barang"
              placeholder="Kode Barang"
              value={formData.kode_barang}
              onChange={handleInputChange}
              required
            />
            {errorKode && <div className="text-danger mb-2">{errorKode}</div>}

            <Form.Control
              type="text"
              className="mb-2"
              id="nama_barang"
              placeholder="Nama Barang"
              value={formData.nama_barang}
              onChange={handleInputChange}
              required
            />

            <Form.Select
              className="mb-2"
              id="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Pilih Lokasi --</option>
              {lokasiOptions.map((lok, index) => (
                <option key={index} value={lok}>{lok}</option>
              ))}
            </Form.Select>

            <Form.Control
              type="number"
              className="mb-2"
              id="harga"
              placeholder="Harga"
              value={formData.harga}
              onChange={handleInputChange}
            />
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

      {/* Modal Edit Barang */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Barang</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            <Form.Control
              type="text"
              className="mb-2"
              id="kode_barang"
              placeholder="Kode Barang"
              value={formData.kode_barang}
              onChange={handleInputChange}
              readOnly
            />
            <Form.Control
              type="text"
              className="mb-2"
              id="nama_barang"
              placeholder="Nama Barang"
              value={formData.nama_barang}
              onChange={handleInputChange}
              required
            />
            <Form.Select
              className="mb-2"
              id="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Pilih Lokasi --</option>
              {lokasiOptions.map((lok, index) => (
                <option key={index} value={lok}>{lok}</option>
              ))}
            </Form.Select>
            <Form.Control
              type="number"
              className="mb-2"
              id="harga"
              placeholder="Harga"
              value={formData.harga}
              onChange={handleInputChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button variant="warning" type="submit">
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin ingin menghapus barang ini?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataBarang;
