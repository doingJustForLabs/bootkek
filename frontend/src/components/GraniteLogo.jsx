// src/components/GraniteLogo.jsx
import React from 'react';
// Change this line:
import LogoSvg from 'assets/granite-logo-cropped.svg?react'; // Import as default

const GraniteLogo = ({ style, className }) => (
    <LogoSvg style={style} className={className} />
);

export default GraniteLogo;