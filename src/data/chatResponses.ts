export interface ChatResponseData {
  [key: string]: string | ((query: string) => string);
}

export const chatResponses: ChatResponseData = {
  "What are the available courses at Caritas University?": 
    "Caritas University offers a wide range of undergraduate programs across various faculties:\n\n• **Faculty of Natural Sciences**: Computer Science, Mathematics, Physics, Chemistry, Biology\n\n• **Faculty of Management Sciences**: Accounting, Business Administration, Economics\n\n• **Faculty of Social Sciences**: Mass Communication, Political Science, Psychology\n\n• **Faculty of Law**: Corporate Law, Civil Law, Criminal Law\n\n• **Faculty of Engineering**: Computer Engineering, Electrical Engineering, Mechanical Engineering\n\nEach program is designed to meet international standards while maintaining our commitment to academic excellence and moral education.",
  
  "How can I improve my study habits?": 
    "Here are proven strategies to enhance your academic performance:\n\n• **The Pomodoro Technique**: Study in focused 25-minute blocks with 5-minute breaks\n\n• **Active Recall**: Test yourself instead of passive reading\n\n• **Mind Mapping**: Create visual connections between concepts\n\n• **Spaced Repetition**: Review material at increasing intervals\n\n• **Study Groups**: Form or join study groups for collaborative learning\n\n• **Note-Taking Methods**: Try the Cornell method or concept mapping\n\n• **Regular Reviews**: Schedule weekly review sessions\n\n• **Resource Utilization**: Take advantage of library resources and academic databases",
  
  "Tell me about the library resources": 
    "Caritas University Library offers extensive resources for academic success:\n\n• **Digital Databases**: Access to JSTOR, IEEE, and other academic databases\n\n• **E-Books Collection**: Over 50,000 academic e-books\n\n• **Research Guides**: Subject-specific research assistance\n\n• **Study Spaces**: Individual and group study areas\n\n• **Online Catalogs**: Easy access to all library materials\n\n• **Research Support**: Librarians available for research consultation\n\n• **24/7 Online Access**: Remote access to digital resources\n\n• **Interlibrary Loan**: Access materials from partner institutions",
  
  "What can you tell me about Caritas University?": 
    "Caritas University is a private Catholic institution founded in 2005, located in Enugu, Nigeria. It was established by the Catholic Diocese of Enugu and is known for its commitment to academic excellence and moral education.\n\nThe university offers a wide range of undergraduate and postgraduate programs across various faculties including Natural Sciences, Management Sciences, Social Sciences, Law, and Engineering.\n\nThe university's motto is 'Scientia Potestas Est' which means 'Knowledge is Power', emphasizing the importance of education in empowering individuals and communities.",
  
  "What's the current academic calendar?": 
    "I don't have access to the current real-time academic calendar for Caritas University. For the most up-to-date information about the academic calendar, including semester start and end dates, examination periods, and holidays, please visit the official Caritas University website or contact the Registrar's office.\n\nTypically, the academic year at Nigerian universities consists of two semesters, with the first semester usually running from September/October to January/February, and the second semester from February/March to June/July, but this can vary.",
  
  "What are some effective study techniques for university students?": 
    "Here are some effective study techniques for university students:\n\n• **Spaced Repetition**: Instead of cramming, spread your studying over several short periods. This helps with long-term retention.\n\n• **Active Recall**: Test yourself on the material instead of just re-reading it. Try to recall information without looking at your notes.\n\n• **The Pomodoro Technique**: Study in focused 25-minute intervals with 5-minute breaks in between. After four sessions, take a longer break.\n\n• **Create Mind Maps**: Visualize connections between different concepts to better understand and remember them.\n\n• **Teach Someone Else**: Explaining concepts to others helps solidify your understanding.\n\n• **Use Multiple Resources**: Don't rely on just one textbook or set of notes. Diversify your learning materials.\n\n• **Join or Form Study Groups**: Collaborative learning can provide new perspectives and motivation.\n\n• **Take Effective Notes**: Don't just copy what's on the board or slides. Summarize in your own words and highlight key points.\n\n• **Manage Your Time**: Create a study schedule and stick to it. Prioritize difficult subjects when you're most alert.\n\n• **Take Care of Your Health**: Good sleep, regular exercise, and proper nutrition are essential for optimal brain function.",
  
  "How do I write a good thesis or dissertation?": 
    "Writing a good thesis or dissertation involves several key steps:\n\n• **Choose a Relevant Topic**: Select something you're passionate about that also contributes to your field of study.\n\n• **Develop a Clear Research Question**: Your research question should be specific, measurable, and significant.\n\n• **Create a Detailed Outline**: Plan your structure before writing to ensure logical flow and completeness.\n\n• **Conduct Thorough Research**: Use credible, peer-reviewed sources and keep detailed notes.\n\n• **Write a Strong Literature Review**: Analyze existing research to show how your work fits into and contributes to the field.\n\n• **Use Appropriate Methodology**: Clearly describe and justify your research methods.\n\n• **Present Results Objectively**: Let the data speak for itself before adding your interpretation.\n\n• **Discuss Implications**: Explain what your findings mean for the field and future research.\n\n• **Write a Compelling Introduction and Conclusion**: These sections should bookend your work effectively.\n\n• **Revise Thoroughly**: Edit for content, clarity, and consistency before checking grammar and formatting.\n\n• **Follow Formatting Guidelines**: Adhere strictly to your department's formatting requirements.\n\n• **Work Closely with Your Supervisor**: Regular consultations can keep you on track and provide valuable feedback.",
  
  "What does it take to become a 5.0 GPA student?": 
    "Achieving a perfect 5.0 GPA requires dedication and strategic approaches:\n\n• **Consistent Study Habits**: Develop and maintain a regular study schedule rather than cramming before exams.\n\n• **Active Class Participation**: Engage in lectures, ask questions, and participate in discussions to deepen your understanding.\n\n• **Effective Time Management**: Balance your academic work with other responsibilities and activities.\n\n• **Strategic Course Selection**: When possible, choose courses that align with your strengths and interests.\n\n• **Use All Available Resources**: Take advantage of office hours, tutoring services, study groups, and academic resources.\n\n• **Take Detailed Notes**: Develop a note-taking system that works for you and review notes regularly.\n\n• **Prioritize Understanding Over Memorization**: Focus on truly understanding concepts rather than just memorizing facts.\n\n• **Develop Strong Relationships with Professors**: They can provide valuable guidance and may be more willing to help you succeed.\n\n• **Practice Good Health Habits**: Ensure adequate sleep, regular exercise, and proper nutrition.\n\n• **Set High Personal Standards**: Challenge yourself to excel in all assignments, not just the heavily weighted ones.\n\n• **Learn from Mistakes**: Use feedback on assignments and exams to improve your understanding and performance.\n\n• **Stay Motivated**: Keep your long-term goals in mind to help maintain motivation during challenging periods.",
  
  "default": (query: string) => {
    return `I understand you're asking about "${query}". As your academic assistant, I aim to provide accurate information about Caritas University, study techniques, and academic resources. Please try asking about:\n\n• Available courses and programs\n• Study techniques and tips\n• Library resources and facilities\n• Academic calendar and schedules\n• Research guidance and support`;
  }
};

export const findResponse = (query: string): string => {
  const normalizedQuery = query.toLowerCase();
  
  for (const key in chatResponses) {
    if (key.toLowerCase() === normalizedQuery) {
      const response = chatResponses[key];
      return typeof response === 'function' ? response(query) : response;
    }
  }
  
  const keywordMap: { [key: string]: string } = {
    "caritas university": "What can you tell me about Caritas University?",
    "about caritas": "What can you tell me about Caritas University?",
    "university": "What can you tell me about Caritas University?",
    "calendar": "What's the current academic calendar?",
    "academic calendar": "What's the current academic calendar?",
    "schedule": "What's the current academic calendar?",
    "study": "What are some effective study techniques for university students?",
    "studying": "What are some effective study techniques for university students?",
    "study techniques": "What are some effective study techniques for university students?",
    "study tips": "What are some effective study techniques for university students?",
    "thesis": "How do I write a good thesis or dissertation?",
    "dissertation": "How do I write a good thesis or dissertation?",
    "research": "How do I write a good thesis or dissertation?",
    "gpa": "What does it take to become a 5.0 GPA student?",
    "5.0": "What does it take to become a 5.0 GPA student?",
    "top grades": "What does it take to become a 5.0 GPA student?",
    "good grades": "What does it take to become a 5.0 GPA student?"
  };
  
  for (const keyword in keywordMap) {
    if (normalizedQuery.includes(keyword)) {
      const key = keywordMap[keyword];
      const response = chatResponses[key];
      return typeof response === 'function' ? response(query) : response;
    }
  }
  
  const defaultResponse = chatResponses["default"];
  return typeof defaultResponse === 'function' ? defaultResponse(query) : defaultResponse;
};
