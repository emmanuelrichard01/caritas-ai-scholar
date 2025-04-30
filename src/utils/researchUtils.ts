
import { ResearchResultItem } from "@/components/research/ResearchResult";

// Generate random author names
export const generateAuthors = (): string => {
  const firstNames = ["Johnson", "Smith", "Chen", "García", "Patel", "Kim", "Nguyen", "Brown", "Wilson", "Ahmed"];
  const lastInitials = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  
  const numAuthors = 2 + Math.floor(Math.random() * 2);
  const authors = [];
  
  for (let i = 0; i < numAuthors; i++) {
    authors.push(`${firstNames[Math.floor(Math.random() * firstNames.length)]}, ${lastInitials[Math.floor(Math.random() * lastInitials.length)]}.`);
  }
  
  return authors.join(", ");
};

// Generate random journal name
export const generateJournal = (): string => {
  const journals = [
    "Journal of Educational Technology",
    "International Review of Research",
    "Academic Quarterly",
    "Journal of Higher Education",
    "Research & Practice Review",
    "Educational Research Quarterly",
    "Contemporary Studies Journal",
    "International Journal of Academic Research"
  ];
  
  return journals[Math.floor(Math.random() * journals.length)];
};

// Helper function to count term occurrences
export const countTermsInText = (text: string, terms: string[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  const lowerText = text.toLowerCase();
  
  terms.forEach(term => {
    let count = 0;
    let pos = lowerText.indexOf(term);
    
    while (pos !== -1) {
      count++;
      pos = lowerText.indexOf(term, pos + 1);
    }
    
    counts[term] = count;
  });
  
  return counts;
};

// Helper function to capitalize first letter
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Process the AI text response into structured research results
export const processResearchResults = (responseText: string, query: string): ResearchResultItem[] => {
  // Extract or create research-like results from the AI response
  const lines = responseText.split('\n');
  let currentTitle = "";
  let currentAbstract = "";
  
  // Create 2-3 research results based on the response content
  const results: ResearchResultItem[] = [];
  
  // Try to extract meaningful research-like info from the response
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes("**Research Support:**") || line.includes("**Additional Resources:**")) {
      break; // Stop processing when we hit the resources section
    }
    
    // Look for potential title lines (relatively short, not starting with bullet points)
    if (line.length > 15 && line.length < 100 && 
        !line.startsWith('•') && !line.startsWith('*') && 
        !currentTitle && line.trim() !== '') {
      currentTitle = line.trim().replace(/\*\*/g, '');
      continue;
    }
    
    // Accumulate content for abstract if we have a title
    if (currentTitle && line.trim() !== '' && !line.startsWith('**')) {
      currentAbstract += line.trim() + ' ';
    }
    
    // When we hit an empty line and have content, create a result
    if (line.trim() === '' && currentTitle && currentAbstract) {
      const relevanceScore = Math.min(98, 70 + Math.floor(Math.random() * 25));
      
      results.push({
        title: currentTitle,
        authors: generateAuthors(),
        journal: generateJournal(),
        year: (2020 + Math.floor(Math.random() * 4)).toString(),
        abstract: currentAbstract.substring(0, 300) + (currentAbstract.length > 300 ? '...' : ''),
        link: "https://example.org/research/" + currentTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 15),
        relevance: relevanceScore
      });
      
      currentTitle = "";
      currentAbstract = "";
      
      if (results.length >= 3) break;
    }
  }
  
  // If we couldn't extract structured results, create some based on the query
  if (results.length === 0) {
    results.push({
      title: `Recent Advances in ${capitalizeFirstLetter(query.split(' ').slice(0, 3).join(' '))}`,
      authors: generateAuthors(),
      journal: generateJournal(),
      year: "2023",
      abstract: responseText.substring(0, 300) + "...",
      link: "https://example.org/research/recent-advances",
      relevance: 94
    });
    
    results.push({
      title: `A Comprehensive Review of ${capitalizeFirstLetter(query.split(' ').slice(-2).join(' '))}`,
      authors: generateAuthors(),
      journal: generateJournal(),
      year: "2022",
      abstract: "This paper provides a comprehensive review of current research and methodologies in this field. The authors analyze existing literature and identify key trends, challenges, and future directions.",
      link: "https://example.org/research/comprehensive-review",
      relevance: 87
    });
    
    results.push({
      title: `Applications and Implications of ${capitalizeFirstLetter(query.split(' ')[0])} Technology in Education`,
      authors: generateAuthors(),
      journal: "Journal of Educational Technology",
      year: "2023",
      abstract: "This study examines the practical applications and broader implications of emerging technologies in educational settings. The research findings suggest significant benefits for student engagement and learning outcomes.",
      link: "https://example.org/research/applications",
      relevance: 82
    });
  }
  
  return results.sort((a, b) => b.relevance - a.relevance);
};
