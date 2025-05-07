
# CARITAS AI - Educational AI Assistant

## Overview

CARITAS AI is a comprehensive educational AI assistant designed to help students with their academic needs. The application provides various tools and features to enhance the learning experience, including:

- **Course Tutor**: Upload course materials and documents for AI-assisted learning
- **Study Planner**: Create personalized study plans based on your schedule and goals
- **Research Assistant**: Find academic sources and research information
- **Assignment Helper**: Get guidance on assignments and projects
- **GPA Calculator**: Calculate your GPA and track academic progress

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **AI Integration**: Multiple AI providers including Google AI, OpenAI, and OpenRouter

## Features

### Authentication

The application provides a secure authentication system powered by Supabase, allowing users to:
- Sign up with email/password
- Sign in with Google (OAuth)
- Maintain persistent sessions
- View and edit their profile information

### AI Processing

CARITAS AI integrates with multiple AI providers to offer specialized assistance:
- **Google AI**: Powered by Gemini models for general knowledge queries
- **OpenAI**: Advanced processing for complex educational tasks
- **OpenRouter**: Alternative AI engine for diversified responses

### Course Tutor

Upload and analyze course materials:
- Support for multiple file formats (PDF, DOCX, PPTX, TXT)
- AI-powered document analysis
- Intelligent responses to questions about uploaded materials
- Flashcard generation for study sessions

### Study Planner

Create personalized study schedules:
- Set study goals and deadlines
- Receive AI-generated study plans
- Track progress and adjust plans as needed
- Get study tips and techniques

### Research Assistant

Find academic resources and information:
- Search for scholarly sources
- Get summaries of research topics
- Find citations and references
- Explore academic concepts

### History & Dashboard

Track your activity and manage your data:
- View past AI interactions
- See recent activities
- Access quick actions
- Manage uploaded documents

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Supabase:
   - Create a Supabase project
   - Set up authentication providers
   - Configure storage buckets
   - Add necessary environment variables

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The application requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key for advanced processing
- `GOOGLE_AI_KEY`: Google AI API key for Gemini models
- `OPENROUTER_KEY`: OpenRouter API key for alternative AI processing

## Project Structure

```
src/
├── components/         # UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Application pages
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── supabase/           # Supabase configurations and functions
```

## API and Edge Functions

The application uses Supabase Edge Functions for secure backend processing:

- `process-ai-query`: Handles complex AI queries with context
- `process-chat`: Processes simple chat interactions
- `analyze-documents`: Extracts and processes content from uploaded files

## Security Considerations

- Row-Level Security (RLS) policies are implemented for all database tables
- User authentication is required for accessing personal data
- API keys are securely stored and accessed only through Edge Functions
- File uploads are validated and securely stored

## Future Enhancements

- **Mobile Application**: Develop a mobile version for on-the-go learning
- **Collaborative Features**: Enable study groups and shared resources
- **Advanced Analytics**: Provide insights on learning patterns and progress
- **Offline Mode**: Allow for limited functionality without internet connection

## License

This project is licensed under the MIT License - see the LICENSE file for details.
