// src/components/AvatarInisial.js
import React from 'react';

const AvatarInisial = ({ nama = 'Admin', size = 35, bgColor = '#198754', textColor = '#fff' }) => {
  // Ambil inisial dari nama
  const getInisial = (name) => {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const inisial = getInisial(nama);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 2,
        fontWeight: 'bold',
        color: textColor,
        userSelect: 'none'
      }}
      title={nama}
    >
      {inisial}
    </div>
  );
};

export default AvatarInisial;
