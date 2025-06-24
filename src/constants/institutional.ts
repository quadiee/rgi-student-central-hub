
export const INSTITUTION = {
  name: "Rajiv Gandhi College of Engineering",
  shortName: "RGCE",
  tagline: "25+ Years of Excellence",
  
  // Location Details
  address: {
    full: "Nemili, Sriperumbudur - 602 105, Chennai, Tamil Nadu, India",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "602 105"
  },
  
  // Contact Information
  contact: {
    emails: ["gresrgce@gmail.com", "admissionsrgce@gmail.com"],
    phones: ["044-46017034", "9444207399", "9941416496"],
    website: "www.rgce.edu.in"
  },
  
  // Academic Information
  academic: {
    affiliation: "Anna University, Chennai, Tamil Nadu, India",
    approvals: ["NCTE, New Delhi"],
    promotedBy: "Shri Balaji Educational Trust",
    tneaCode: "1212",
    establishedYear: "1998"
  },
  
  // Departments - Updated to match current database schema
  departments: {
    engineering: [
      "Computer Science & Engineering", // CSE
      "Electronics & Communication Engineering", // ECE 
      "Electrical & Electronics Engineering", // EEE
      "Mechanical Engineering", // MECH
      "Civil Engineering", // CIVIL
      "Information Technology" // IT
    ],
    artsScience: [
      // These will be added when database schema is updated
      "Computer Science",
      "Corporate Secretaryship", 
      "Accounting & Finance",
      "Commerce (General)",
      "Business Administration"
    ]
  },
  
  // Industry Partners (from brochure)
  industryPartners: [
    "TCS", "HCL", "Lenovo", "Infosys", "Wipro", "Cognizant",
    "Tech Mahindra", "Accenture", "IBM", "Microsoft"
  ]
} as const;

// Updated to match current database schema
export const DEPARTMENT_CODES = {
  // Current Engineering Departments
  "CSE": "Computer Science & Engineering",
  "ECE": "Electronics & Communication Engineering", 
  "EEE": "Electrical & Electronics Engineering",
  "MECH": "Mechanical Engineering",
  "CIVIL": "Civil Engineering",
  "IT": "Information Technology",
  
  // Administration
  "ADMIN": "Administration"
} as const;
