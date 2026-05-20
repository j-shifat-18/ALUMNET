"use client";

import ComboBox from "../combo-box";

const DepartmentDropdown = ({ onSelect }) => {
  const sampleOptions = ["Mechanical and Production Engineering (MPE)", "Electrical and Electronic Engineering (EEE)", "Computer Science and Engineering (CSE)", "Civil and Environmental Engineering (CEE)", "Technical and Vocational Education (TVE)", "Business and Technology Management (BTM)", "Natural Sciences (NSc)"];
  
  const handleSelect = option => {
    console.log("Selected option:", option);
    if (onSelect) {
      onSelect(option);
    }
  };
  
  return <div className="">
      <ComboBox options={sampleOptions} placeholder="Select Your Department" onSelect={handleSelect} />
    </div>;
};

export default DepartmentDropdown;