"use client";

import ComboBox from "@/components/ui/ComboBox";

const DepartmentDropdown = ({ onSelect, value }) => {
  const sampleOptions = [
    "Mechanical and Production Engineering (MPE)",
    "Electrical and Electronic Engineering (EEE)",
    "Computer Science and Engineering (CSE)",
    "Civil and Environmental Engineering (CEE)",
    "Technical and Vocational Education (TVE)",
    "Business and Technology Management (BTM)",
    "Natural Sciences (NSc)",
  ];

  const handleSelect = (option) => {
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div>
      <ComboBox
        options={sampleOptions}
        placeholder="Select Your Department"
        value={value}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default DepartmentDropdown;
