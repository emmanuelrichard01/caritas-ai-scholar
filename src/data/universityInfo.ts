import { APP_CONFIG } from '@/config/app';

export const universityInfo = {
  name: APP_CONFIG.university.name,
  location: "Main Campus",
  founded: 2005,
  type: "Private University",
  motto: "Excellence and Service",
  website: `https://www.${APP_CONFIG.university.slug}.edu.ng/`,
  
  faculties: [
    {
      name: "Faculty of Medicine",
      departments: [
        "Medicine and Surgery",
        "Nursing Sciences",
        "Medical Laboratory Science",
        "Physiotherapy"
      ]
    },
    {
      name: "Faculty of Engineering",
      departments: [
        "Computer Engineering",
        "Electrical/Electronic Engineering",
        "Mechanical Engineering",
        "Civil Engineering"
      ]
    },
    {
      name: "Faculty of Natural Sciences",
      departments: [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology"
      ]
    },
    {
      name: "Faculty of Management and Social Sciences",
      departments: [
        "Business Administration",
        "Economics",
        "Political Science",
        "Mass Communication",
        "Psychology"
      ]
    },
    {
      name: "Faculty of Law",
      departments: [
        "Common Law",
        "Civil Law",
        "International Law"
      ]
    },
    {
      name: "Faculty of Humanities",
      departments: [
        "English Language and Literature",
        "Philosophy",
        "History and International Studies",
        "Religious Studies"
      ]
    }
  ],
  
  facilities: [
    "Modern Library with Digital Resources",
    "Medical Centre and Teaching Hospital",
    "Engineering Workshops and Laboratories",
    "Computer Laboratory",
    "Student Hostels",
    "Sports Complex",
    "Chapel for Worship",
    "Conference Hall",
    "Cafeteria and Dining Hall"
  ],
  
  programs: {
    undergraduate: [
      "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
      "Bachelor of Engineering (B.Eng)",
      "Bachelor of Science (B.Sc)",
      "Bachelor of Laws (LL.B)",
      "Bachelor of Arts (B.A)",
      "Bachelor of Business Administration (BBA)"
    ],
    postgraduate: [
      "Master of Business Administration (MBA)",
      "Master of Science (M.Sc)",
      "Master of Laws (LL.M)",
      "Doctor of Philosophy (Ph.D)"
    ]
  },
  
  admissionRequirements: {
    undergraduate: [
      "SSCE/WAEC/NECO with minimum of 5 credits including English and Mathematics",
      "JAMB UTME with minimum score as prescribed by the university",
      "Post-UTME screening examination",
      "Medical examination for Medicine and related courses"
    ],
    postgraduate: [
      "First degree with minimum of Second Class Lower Division",
      "Relevant professional qualifications where applicable",
      "Entrance examination and interview",
      "Academic transcripts and certificates"
    ]
  },
  
  values: [
    "Academic Excellence",
    "Character Formation",
    "Service to Humanity",
    "Innovation and Research"
  ],
  
  contact: {
    address: `${APP_CONFIG.university.name}, Main Campus`,
    phone: "+234 000 000 000",
    email: `info@${APP_CONFIG.university.slug}.edu.ng`,
    registrar: `registrar@${APP_CONFIG.university.slug}.edu.ng`,
    admissions: `admissions@${APP_CONFIG.university.slug}.edu.ng`
  },
  
  accreditation: [
    "National Universities Commission (NUC)"
  ]
};
