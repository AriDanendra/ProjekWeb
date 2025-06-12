import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DataBarang from './components/DataBarang';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import BarangMasuk from './components/BarangMasuk';
import BarangKeluar from './components/BarangKeluar';
import RiwayatStok from './components/RiwayatStok';

function App() {
  // Anda bisa menambahkan logika autentikasi di sini
  // const isAuthenticated = false; // Contoh: bisa dari state atau context

  return (
    <Router>
      <Routes>
        {/* Route default akan mengarahkan ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route
          path="/login"
          element={<Login />}
        />
        
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        
        <Route
          path="/data-barang"
          element={
            <Layout>
              <DataBarang />
            </Layout>
          }
        />
        
        <Route
          path="/barang-masuk"
          element={
            <Layout>
              <BarangMasuk />
            </Layout>
          }
        />

        <Route
          path="/barang-keluar"
          element={
            <Layout>
              <BarangKeluar />
            </Layout>
          }
        />

        <Route
          path="/riwayat-stok"
          element={
            <Layout>
              <RiwayatStok />
            </Layout>
          }
        />
        
        {/* Anda bisa menambahkan protected route nanti */}
      </Routes>
    </Router>
  );
}

export default App;