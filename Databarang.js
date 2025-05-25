const API_URL = 'http://localhost:5000/api/barang';

const tambahForm = document.getElementById('tambahForm');
const editForm = document.getElementById('editForm');
const barangTable = document.getElementById('barangTable');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let deleteTargetId = null;

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function loadBarang() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    barangTable.innerHTML = '';

    if (data.length === 0) {
      barangTable.innerHTML = `<tr><td colspan="8" class="text-center">Tidak ada data barang</td></tr>`;
      return;
    }

    data.forEach(barang => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${barang.kode_barang}</td>
        <td>${barang.nama_barang}</td>
        <td>${barang.lokasi || '-'}</td>
        <td>${barang.harga ? barang.harga.toLocaleString('id-ID') : '-'}</td>
        <td>${barang.stok || '-'}</td>
        <td>${formatDate(barang.tanggal_masuk)}</td>
        <td>${formatDate(barang.tanggal_keluar)}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn" data-id="${barang.kode_barang}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${barang.kode_barang}" data-bs-toggle="modal" data-bs-target="#hapusModal">Hapus</button>
        </td>
      `;
      barangTable.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        deleteTargetId = e.target.getAttribute('data-id');
      });
    });
  } catch (error) {
    alert('Gagal memuat data: ' + error.message);
  }
}

tambahForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const barangData = {
    kode_barang: document.getElementById('kode_barang').value.trim(),
    nama_barang: document.getElementById('nama_barang').value.trim(),
    lokasi: document.getElementById('lokasi').value.trim(),
    harga: parseInt(document.getElementById('harga').value) || 0,
    stok: parseInt(document.getElementById('stok').value) || 0,
    tanggal_masuk: document.getElementById('tanggal_masuk').value || null,
    tanggal_keluar: document.getElementById('tanggal_keluar').value || null
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barangData)
    });

    if (!response.ok) throw new Error('Gagal menambah barang');
    tambahForm.reset();
    bootstrap.Modal.getInstance(document.getElementById('tambahModal')).hide();
    await loadBarang();
    alert('Data berhasil ditambahkan!');
  } catch (error) {
    alert(error.message);
  }
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const kode = document.getElementById('edit_kode_barang').value;

  const barangData = {
    nama_barang: document.getElementById('edit_nama_barang').value.trim(),
    lokasi: document.getElementById('edit_lokasi').value.trim(),
    harga: parseInt(document.getElementById('edit_harga').value) || 0,
    stok: parseInt(document.getElementById('edit_stok').value) || 0,
    tanggal_masuk: document.getElementById('edit_tanggal_masuk').value || null,
    tanggal_keluar: document.getElementById('edit_tanggal_keluar').value || null
  };

  try {
    const response = await fetch(`${API_URL}/${kode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barangData)
    });

    if (!response.ok) throw new Error('Gagal mengedit barang');
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    await loadBarang();
    alert('Data berhasil diperbarui!');
  } catch (error) {
    alert(error.message);
  }
});

function handleEdit(e) {
  const row = e.target.closest('tr');
  const cells = row.querySelectorAll('td');
  const [kode, nama, lokasi, harga, stok, masuk, keluar] = [...cells].map(cell => cell.textContent);

  document.getElementById('edit_kode_barang').value = kode;
  document.getElementById('edit_nama_barang').value = nama;
  document.getElementById('edit_lokasi').value = lokasi === '-' ? '' : lokasi;
  document.getElementById('edit_harga').value = harga === '-' ? '' : harga.replace(/\./g, '');
  document.getElementById('edit_stok').value = stok === '-' ? '' : stok;

  if (masuk !== '-') {
    const [d, m, y] = masuk.split('/');
    document.getElementById('edit_tanggal_masuk').value = `${y}-${m}-${d}`;
  } else {
    document.getElementById('edit_tanggal_masuk').value = '';
  }

  if (keluar !== '-') {
    const [d, m, y] = keluar.split('/');
    document.getElementById('edit_tanggal_keluar').value = `${y}-${m}-${d}`;
  } else {
    document.getElementById('edit_tanggal_keluar').value = '';
  }

  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deleteTargetId) return;

  try {
    const response = await fetch(`${API_URL}/${deleteTargetId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Gagal menghapus data');
    await loadBarang();
    bootstrap.Modal.getInstance(document.getElementById('hapusModal')).hide();
    alert('Data berhasil dihapus!');
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('cancelTambah').addEventListener('click', () => tambahForm.reset());
document.getElementById('cancelEdit').addEventListener('click', () => editForm.reset());

document.addEventListener('DOMContentLoaded', loadBarang);
