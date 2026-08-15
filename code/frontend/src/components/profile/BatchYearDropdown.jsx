'use client';

import ComboBox from "@/components/ui/ComboBox";

const BatchYearDropdown = ({ role, value, onSelect }) => {
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
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="w-full">
      <ComboBox 
        options={yearOptions} 
        placeholder={"Select Your Batch Year"} 
        value={value}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default BatchYearDropdown;
