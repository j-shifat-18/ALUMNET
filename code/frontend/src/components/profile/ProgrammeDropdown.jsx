"use client";

import ComboBox from "@/components/ui/ComboBox";

const ProgrammeDropdown = ({ selectedDepartment, onSelect, value }) => {
  const departmentProgrammes = {
    "Computer Science and Engineering (CSE)": [
      "B.Sc. in CSE",
      "B.Sc. in SWE",
      "M.Sc. in CSE",
      "M.Engg. in CSE",
      "M.Sc. in CSA",
      "PhD in CSE"
    ],
    "Electrical and Electronic Engineering (EEE)": [
      "B.Sc. in EEE",
      "M.Sc. in EEE",
      "M.Engg. in EEE",
      "PhD in EEE"
    ],
    "Civil and Environmental Engineering (CEE)": [
      "B.Sc. in CEE",
      "M.Sc. in CEE",
      "M.Engg. in CEE",
      "PhD in CEE"
    ],
    "Mechanical and Production Engineering (MPE)": [
      "B.Sc. in ME",
      "B.Sc. in IPE",
      "M.Sc. in ME",
      "M.Engg. in ME",
      "PhD in ME"
    ],
    "Technical and Vocational Education (TVE)": [
      "B.Sc. in TE",
      "M.Sc. in TE",
      "PGD in TE",
      "PhD in TE"
    ],
    "Natural Sciences (NSc)": [
      "NSc"
    ],
    "Business and Technology Management (BTM)": [
      "BBA in TM"
    ]
  };

  const programmesOptions = selectedDepartment 
    ? departmentProgrammes[selectedDepartment] || [] 
    : [];

  const handleSelect = (option) => {
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div>
      <ComboBox 
        options={programmesOptions} 
        placeholder={selectedDepartment ? "Select Your Programme" : "Please select a department first"} 
        value={value}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ProgrammeDropdown;
