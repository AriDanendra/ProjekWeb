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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const lokasiOptions = ['Rak 1', 'Rak 2', 'Rak 3', 'Rak 4'];

  const resetFormData = () => {
    setFormData({
      kode_barang: '',
      nama_barang: '',
      lokasi: '',
      harga: '',
      stok: 0
    });
    setErrorKode('');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2500);
  };

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
      [id]: value
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
      const dataToSubmit = {
        ...formData,
        harga: parseInt(formData.harga) || 0,
        stok: 0
      };
      await axios.post(API_URL, dataToSubmit);
      setShowAddModal(false);
      resetFormData();
      await loadBarang();
      showSuccess('Barang berhasil ditambahkan!');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      lokasi: item.lokasi || '',
      harga: item.harga?.toString() || '',
      stok: item.stok || 0
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        harga: parseInt(formData.harga) || 0
      };
      await axios.put(`${API_URL}/${formData.kode_barang}`, dataToSubmit);
      setShowEditModal(false);
      resetFormData();
      await loadBarang();
      showSuccess('Barang berhasil diperbarui!');
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
      showSuccess('Barang berhasil dihapus!');
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
        <Button variant="success" onClick={() => { setShowAddModal(true); resetFormData(); }}>
          + Tambah Barang
        </Button>

        <div className="table-responsive mt-3">
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

      {/* Modal Tambah */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); resetFormData(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Barang</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAdd}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Kode Barang</Form.Label>
              <Form.Control
                type="text"
                id="kode_barang"
                value={formData.kode_barang}
                onChange={handleInputChange}
                isInvalid={!!errorKode}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errorKode}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Barang</Form.Label>
              <Form.Control
                type="text"
                id="nama_barang"
                value={formData.nama_barang}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lokasi</Form.Label>
              <Form.Select
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
            </Form.Group>

            <Form.Group>
              <Form.Label>Harga (Rp)</Form.Label>
              <Form.Control
                type="number"
                id="harga"
                value={formData.harga ?? ''}
                onChange={handleInputChange}
                min="0"
                placeholder="Contoh: 1500000"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowAddModal(false); resetFormData(); }}>
              Batal
            </Button>
            <Button variant="success" type="submit">Simpan</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Edit */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetFormData(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Barang</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Kode Barang</Form.Label>
              <Form.Control type="text" id="kode_barang" value={formData.kode_barang} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Barang</Form.Label>
              <Form.Control type="text" id="nama_barang" value={formData.nama_barang} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lokasi</Form.Label>
              <Form.Select id="lokasi" value={formData.lokasi} onChange={handleInputChange} required>
                <option value="">-- Pilih Lokasi --</option>
                {lokasiOptions.map((lok, index) => (
                  <option key={index} value={lok}>{lok}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Harga (Rp)</Form.Label>
              <Form.Control
                type="number"
                id="harga"
                value={formData.harga ?? ''}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowEditModal(false); resetFormData(); }}>
              Batal
            </Button>
            <Button variant="warning" type="submit">Update</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin menghapus barang ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sukses */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Berhasil</Modal.Title>
        </Modal.Header>
        <Modal.Body><p className="mb-0">{successMessage}</p></Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Oke
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataBarang;
