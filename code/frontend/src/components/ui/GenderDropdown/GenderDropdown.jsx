"use client";

import ComboBox from "../combo-box";

const GenderDropdown = ({ onSelect, selectedGender }) => {
  const genderOptions = ["Male", "Female"];

  const handleSelect = (option) => {
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="">
      <ComboBox
        options={genderOptions}
        placeholder="Select Gender"
        value={selectedGender}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default GenderDropdown;