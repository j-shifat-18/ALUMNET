/**
 * Department and program acronym mappings for IUT.
 *
 * Mappings:
 * - SWE: Software Engineering
 * - CSE: Computer Science and Engineering
 * - CEE: Civil & Environmental Engineering
 * - ME: Mechanical Engineering
 * - IPE: Industrial & Production Engineering
 * - MPE: Mechanical and Production Engineering (parent dept for ME & IPE)
 * - BTM: Business Technology Management
 * - EEE: Electrical & Electronic Engineering
 * - TVE: Technical & Vocational Education
 * - NSc: Natural Sciences
 */

const acronymMap: Record<string, string[]> = {
  // Software Engineering — SWE
  swe: [
    "Software Engineering",
    "SWE",
    "Software",
  ],
  "software engineering": [
    "Software Engineering",
    "SWE",
    "Software",
  ],

  // Computer Science and Engineering — CSE
  cse: [
    "Computer Science and Engineering",
    "Computer Science & Engineering",
    "Computer Science",
    "CSE",
    "Software Engineering",
    "SWE",
  ],
  "computer science and engineering": [
    "Computer Science and Engineering",
    "Computer Science & Engineering",
    "Computer Science",
    "CSE",
    "Software Engineering",
    "SWE",
  ],
  "computer science & engineering": [
    "Computer Science and Engineering",
    "Computer Science & Engineering",
    "Computer Science",
    "CSE",
    "Software Engineering",
    "SWE",
  ],

  // Civil & Environmental Engineering — CEE
  cee: [
    "Civil and Environmental Engineering",
    "Civil & Environmental Engineering",
    "Civil Engineering",
    "CEE",
    "CE",
  ],
  ce: [
    "Civil and Environmental Engineering",
    "Civil & Environmental Engineering",
    "Civil Engineering",
    "CEE",
    "CE",
  ],
  "civil & environmental engineering": [
    "Civil and Environmental Engineering",
    "Civil & Environmental Engineering",
    "Civil Engineering",
    "CEE",
    "CE",
  ],
  "civil and environmental engineering": [
    "Civil and Environmental Engineering",
    "Civil & Environmental Engineering",
    "Civil Engineering",
    "CEE",
    "CE",
  ],
  "civil engineering": [
    "Civil and Environmental Engineering",
    "Civil & Environmental Engineering",
    "Civil Engineering",
    "CEE",
    "CE",
  ],

  // Mechanical Engineering — ME
  me: [
    "Mechanical Engineering",
    "ME",
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
  ],
  "mechanical engineering": [
    "Mechanical Engineering",
    "ME",
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
  ],

  // Industrial & Production Engineering — IPE
  ipe: [
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "Industrial Production Engineering",
    "IPE",
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
  ],
  "industrial and production engineering": [
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "Industrial Production Engineering",
    "IPE",
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
  ],
  "industrial & production engineering": [
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "Industrial Production Engineering",
    "IPE",
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
  ],

  // Department of Mechanical and Production Engineering — MPE
  mpe: [
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
    "Mechanical Engineering",
    "ME",
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "IPE",
    "Mechanical and Chemical Engineering",
    "Mechanical & Chemical Engineering",
    "MCE",
  ],
  "mechanical and production engineering": [
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
    "Mechanical Engineering",
    "ME",
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "IPE",
  ],
  "mechanical & production engineering": [
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
    "Mechanical Engineering",
    "ME",
    "Industrial and Production Engineering",
    "Industrial & Production Engineering",
    "IPE",
  ],
  // Legacy MCE compatibility
  mce: [
    "Mechanical and Production Engineering",
    "Mechanical & Production Engineering",
    "MPE",
    "Mechanical Engineering",
    "ME",
    "Mechanical and Chemical Engineering",
    "Mechanical & Chemical Engineering",
    "MCE",
  ],

  // Business Technology Management — BTM
  btm: [
    "Business Technology Management",
    "Business and Technology Management",
    "Business & Technology Management",
    "BTM",
    "Business Administration",
    "BBA",
  ],
  "business technology management": [
    "Business Technology Management",
    "Business and Technology Management",
    "Business & Technology Management",
    "BTM",
    "Business Administration",
    "BBA",
  ],
  "business and technology management": [
    "Business Technology Management",
    "Business and Technology Management",
    "Business & Technology Management",
    "BTM",
    "Business Administration",
    "BBA",
  ],
  "business & technology management": [
    "Business Technology Management",
    "Business and Technology Management",
    "Business & Technology Management",
    "BTM",
    "Business Administration",
    "BBA",
  ],
  bba: [
    "Business Administration",
    "BBA",
    "Business Technology Management",
    "Business and Technology Management",
    "BTM",
  ],

  // Electrical & Electronic Engineering — EEE
  eee: [
    "Electrical and Electronic Engineering",
    "Electrical & Electronic Engineering",
    "Electrical and Electronics Engineering",
    "Electrical Engineering",
    "EEE",
  ],
  "electrical and electronic engineering": [
    "Electrical and Electronic Engineering",
    "Electrical & Electronic Engineering",
    "Electrical and Electronics Engineering",
    "Electrical Engineering",
    "EEE",
  ],
  "electrical & electronic engineering": [
    "Electrical and Electronic Engineering",
    "Electrical & Electronic Engineering",
    "Electrical and Electronics Engineering",
    "Electrical Engineering",
    "EEE",
  ],

  // Technical & Vocational Education — TVE
  tve: [
    "Technical and Vocational Education",
    "Technical & Vocational Education",
    "Technical Vocational Education",
    "TVE",
  ],
  "technical and vocational education": [
    "Technical and Vocational Education",
    "Technical & Vocational Education",
    "Technical Vocational Education",
    "TVE",
  ],
  "technical & vocational education": [
    "Technical and Vocational Education",
    "Technical & Vocational Education",
    "Technical Vocational Education",
    "TVE",
  ],

  // Department of Natural Sciences — NSc
  nsc: [
    "Natural Sciences",
    "Department of Natural Sciences",
    "NSc",
    "NS",
  ],
  ns: [
    "Natural Sciences",
    "Department of Natural Sciences",
    "NSc",
    "NS",
  ],
  "natural sciences": [
    "Natural Sciences",
    "Department of Natural Sciences",
    "NSc",
    "NS",
  ],
};

export const getDepartmentTerms = (department: string): string[] => {
  const trimmed = department.trim();
  const lower = trimmed.toLowerCase();

  return acronymMap[lower] || [trimmed];
};
