'use client';

import React from 'react';
import styles from '../../styles/ColorSelector.module.css';

import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import { COLOR_OPTIONS } from '@/lib/constants';


const ColorSelector: React.FC = () => {
  const { selectedColor, setSelectedColor, selectedPoints } = useGraphPaper();

  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColor(event.target.value);
  };

  return (
    <div className={styles.colorSelectorContainer}>
      <label htmlFor="colorSelect">Select Color: </label>
      <select
        id="colorSelect"
        value={selectedColor}
        onChange={handleColorChange}
        className={styles.colorDropdown}
      >
        {COLOR_OPTIONS.map((colorOption) => (
          <option key={colorOption.value} value={colorOption.value}>
            {colorOption.label}
          </option>
        ))}
      </select>
      <div
        className={styles.selectedColorPreview}
        style={{ backgroundColor: selectedColor }}
      >
      
    </div>
    </div>

  );
};

export default ColorSelector;