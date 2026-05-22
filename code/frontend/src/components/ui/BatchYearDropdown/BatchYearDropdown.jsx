'use client';

import ComboBox from "../combo-box";

const BatchYearDropdown = ({ role, onSelect }) => {
  const getYears = () => {
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

  const yearOptions = getYears();

  const handleSelect = (option) => {
    console.log("Selected batch year:", option);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="">
      <ComboBox 
        options={yearOptions} 
        placeholder="Select Your Batch Year" 
        onSelect={handleSelect} 
      />
    </div>
  );
};

export default BatchYearDropdown;
