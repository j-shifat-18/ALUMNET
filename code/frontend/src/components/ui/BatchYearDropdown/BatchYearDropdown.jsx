'use client';

import { useState } from 'react';
import ComboBox from "../combo-box";

const BatchYearDropdown = ({ role, onSelect }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const getYearRange = () => {
    if (role === 'ALUMNI') {
      const years = [];
      for (let year = 2020; year >= 1986; year--) {
        years.push(year.toString());
      }
      return years;
    } else if (role === 'STUDENT') {
      const years = [];
      for (let year = 2024; year >= 2021; year--) {
        years.push(year.toString());
      }
      return years;
    }
    return [];
  };

  const yearOptions = getYearRange();

  const handleSelect = (option) => {
    setSelectedYear(option);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="w-full">
      <ComboBox 
        options={yearOptions} 
        placeholder={!role ? "Select role first" : "Select Your Batch Year"} 
        onSelect={handleSelect}
      />
    </div>
  );
};

export default BatchYearDropdown;
