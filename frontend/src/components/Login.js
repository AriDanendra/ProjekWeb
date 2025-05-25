// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWarehouse } from 'react-icons/fa'; // Import the warehouse icon

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan password harus diisi!');
      setShowError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user');
      const users = await response.json();
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Username atau password salah!');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Terjadi kesalahan saat login');
      setShowError(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
    // eslint-disable-next-line
  }, [username, password]);

  return (
    <div style={{
      backgroundColor: '#55b98e',
      fontFamily: 'monospace',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '300px',
        textAlign: 'center',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <FaWarehouse 
            style={{
              color: '#2d9583',
              fontSize: '40px',
              marginBottom: '10px'
            }} 
          />
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2d9583',
            fontFamily: 'monospace'
          }}>
            STOKRAPI
          </div>
        </div>
        
        {showError && (
          <div style={{
            color: '#e74c3c',
            marginBottom: '15px',
            fontSize: '13px'
          }}>
            {errorMessage}
          </div>
        )}
        
        <label style={{
          fontSize: '14px',
          display: 'block',
          textAlign: 'left',
          marginTop: '10px'
        }}>
          Username
        </label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            margin: '10px 0',
            border: 'none',
            borderBottom: '2px solid #2d9583',
            fontFamily: 'monospace'
          }}
          placeholder="Masukkan username"
        />
        
        <label style={{
          fontSize: '14px',
          display: 'block',
          textAlign: 'left',
          marginTop: '10px'
        }}>
          Password
        </label>
        <input 
          type={showPassword ? 'text' : 'password'} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            margin: '10px 0',
            border: 'none',
            borderBottom: '2px solid #2d9583',
            fontFamily: 'monospace'
          }}
          placeholder="Masukkan password"
        />
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '15px 0'
        }}>
          <input 
            type="checkbox" 
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{
              width: 'auto',
              marginRight: '8px'
            }}
          />
          <label 
            htmlFor="showPassword"
            style={{
              margin: 0
            }}
          >
            Show Password
          </label>
        </div>
        
        <button 
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#55b98e',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: '10px'
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Login;