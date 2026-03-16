

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'od-IN', name: 'Odia' }
];

export const SUPPORTED_SPEAKERS = [
  ...['shubh', 'aditya', 'rahul', 'rohan', 'amit', 'dev', 'ratan', 'varun', 'manan', 'sumit', 'kabir', 'aayan', 'ashutosh', 'advait', 'anand', 'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'mohit', 'rehan', 'soham'].map(name => ({ id: name, name: name.charAt(0).toUpperCase() + name.slice(1), gender: 'Male' })),
  ...['ritu', 'priya', 'neha', 'pooja', 'simran', 'kavya', 'ishita', 'shreya', 'roopa', 'amelia', 'sophia', 'tanya', 'shruti', 'suhani', 'kavitha', 'rupali'].map(name => ({ id: name, name: name.charAt(0).toUpperCase() + name.slice(1), gender: 'Female' }))
];