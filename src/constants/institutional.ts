
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
  
  // Departments
  departments: {
    engineering: [
      "Computer Science & Engineering",
      "Electronics & Communication Engineering", 
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Biomedical Engineering",
      "Petroleum Engineering",
      "Artificial Intelligence & Data Science"
    ],
    artsScience: [
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

export const DEPARTMENT_CODES = {
  // Engineering
  "CSE": "Computer Science & Engineering",
  "ECE": "Electronics & Communication Engineering", 
  "EEE": "Electrical & Electronics Engineering",
  "MECH": "Mechanical Engineering",
  "BME": "Biomedical Engineering",
  "PE": "Petroleum Engineering",
  "AIDS": "Artificial Intelligence & Data Science",
  
  // Arts & Science
  "CS": "Computer Science",
  "CORP": "Corporate Secretaryship",
  "AF": "Accounting & Finance", 
  "BCOM": "Commerce (General)",
  "BBA": "Business Administration",
  
  // Administration
  "ADMIN": "Administration"
} as const;
