
# CARITAS AI - Educational AI Assistant

## Overview

CARITAS AI is a comprehensive educational AI assistant designed to help students with their academic needs. The application leverages multiple AI models to provide personalized learning experiences and academic support through an intuitive interface.

## Features

### 🤖 AI-Powered Assistance

- **Multi-Model Intelligence**: Integrates with Google's Gemini models, OpenAI's GPT, and OpenRouter for diverse AI capabilities
- **Context-Aware Responses**: AI understands the context of your questions and previous interactions
- **Document Processing**: Upload and analyze course materials for targeted learning assistance

### 📚 Learning Tools

- **Course Tutor**: Upload course materials and get AI assistance with understanding concepts
  - Supports multiple file formats (PDF, DOCX, PPTX, TXT)
  - Intelligent document analysis and contextual question answering
  - Generates study materials like flashcards and summaries

- **Study Planner**: Create personalized study schedules and get tips for effective learning
  - AI-generated study plans based on your schedule and goals
  - Customizable study sessions with time management features
  - Progress tracking and adaptive recommendations

- **Research Assistant**: Find academic resources and information for your projects
  - Academic search capabilities with credible source filtering
  - Summarization of research papers and articles
  - Citation assistance in multiple formats

- **GPA Calculator**: Calculate and track your academic progress
  - Calculate weighted and unweighted GPA
  - Track progress across semesters
  - Set academic goals and receive achievement tracking

### 🔒 Security & User Experience

- **Secure Authentication**: Powered by Supabase for reliable user management
  - Email/password authentication
  - OAuth integration with Google
  - Persistent session management

- **Personal Dashboard**: Track your history and manage your data
  - Access chat history and previous interactions
  - View quick stats on usage and activity
  - Manage uploaded documents and created study materials

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
  - Adaptive layout adjusts to your screen size
  - Dark and light mode support
  - Accessibility-focused interface

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state and React Context for local state
- **Routing**: React Router for navigation

### Backend
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: PostgreSQL hosted on Supabase
- **Storage**: Supabase Storage for document uploads
- **API Layer**: Supabase Edge Functions for secure serverless operations

### AI Integration
- **Google AI**: Gemini models for general knowledge and language tasks
- **OpenAI**: GPT models for complex reasoning and content generation
- **OpenRouter**: Alternative AI engine for fallback and specialized tasks

## Getting Started

### Prerequisites
- Node.js v16+
- npm or yarn
- Supabase account (for backend services)
- API keys for AI providers

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/caritas-ai.git
   cd caritas-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_AI_KEY=your_google_ai_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_OPENROUTER_KEY=your_openrouter_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations in the `supabase/migrations` directory
3. Configure storage buckets for document uploads
4. Set up authentication providers in the Supabase dashboard
5. Deploy the Edge Functions in the `supabase/functions` directory

## Best Practices

- **Rate Limiting**: The application implements client-side rate limiting to prevent API abuse
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Security**: Row-level security policies are implemented in the database
- **Performance**: Lazy loading, component optimization, and efficient state management

## Contributing

We welcome contributions to improve CARITAS AI! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the amazing backend platform
- [Shadcn UI](https://ui.shadcn.com/) for beautiful React components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tool
- All contributors who have helped shape this project

## Contact

If you have any questions or feedback, please reach out to us at [email@example.com](mailto:email@example.com).
