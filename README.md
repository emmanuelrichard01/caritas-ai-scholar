
# CARITAS AI Scholar

CARITAS AI Scholar is an intelligent academic companion that empowers students with AI-driven assistance for better learning outcomes and academic success.

## 🚀 Features

### 📚 Core Features
- **AI Chat Assistant**: Intelligent conversational AI for instant academic help
- **Course Assistant**: Upload materials and generate study aids (summaries, flashcards, quizzes)
- **Study Planner**: AI-powered personalized study scheduling with intelligent optimization
- **GPA Calculator**: Track and calculate your academic performance
- **Research Assistant**: AI-powered academic research and citation help
- **Dashboard**: Personalized learning analytics and progress tracking

### 🎯 Key Capabilities
- **Smart Study Planning**: Generates optimal study schedules based on your preferences, deadlines, and learning patterns
- **Document Processing**: Upload PDFs, documents, and materials for automatic analysis
- **Study Tools Generation**: Auto-creates flashcards, quizzes, and summaries from your materials
- **Real-time Analytics**: Track your learning progress and study habits
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Customizable theme preferences

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **AI Integration**: OpenAI, Google AI, OpenRouter
- **State Management**: TanStack Query, Zustand
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React

## 📱 Mobile First Design

CARITAS AI Scholar is built with a mobile-first approach, ensuring:
- Responsive layouts for all screen sizes
- Touch-friendly interface elements
- Optimized performance on mobile devices
- Progressive Web App capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/caritas-ai-scholar.git
   cd caritas-ai-scholar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **profiles**: User profile information
- **chat_history**: Conversation history and interactions
- **materials**: Uploaded course materials
- **study_plans**: Personalized study schedules and plans
- **uploads**: File upload metadata
- **segments**: Processed document segments
- **flashcards**: Generated study flashcards
- **quizzes**: Generated practice quizzes
- **summaries**: AI-generated summaries

## 🔧 Configuration

### API Keys Required
Set up the following in your Supabase Edge Functions secrets:
- `OPENAI_API_KEY`: For OpenAI GPT models
- `GOOGLE_AI_KEY`: For Google Gemini AI
- `OPENROUTER_KEY`: For OpenRouter AI models
- `SERPER_API_KEY`: For web search capabilities

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL migrations from the `/supabase` folder
3. Set up authentication providers as needed
4. Configure Row Level Security (RLS) policies

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 📊 Features in Detail

### Study Planner
- **Intelligent Scheduling**: AI analyzes your subjects, deadlines, and preferences
- **Adaptive Planning**: Adjusts based on your progress and learning patterns
- **Multiple Study Modes**: Pomodoro, timeboxing, and flexible scheduling
- **Progress Tracking**: Visual analytics of your study habits and completion rates

### Course Assistant
- **Document Upload**: Support for PDFs, DOCX, and text files
- **Smart Processing**: Extracts key concepts and learning objectives
- **Study Aid Generation**: Creates flashcards, quizzes, and summaries automatically
- **Material Library**: Organized storage of all your course materials

### AI Chat
- **Contextual Help**: Understands your academic context and subjects
- **Multiple AI Models**: Leverages OpenAI, Google AI, and other providers
- **Conversation History**: Saves and organizes your chat interactions
- **Smart Suggestions**: Provides relevant prompts and conversation starters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@caritas-ai.com or join our Discord community.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered web development
- UI components from [Shadcn/UI](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)

---

**CARITAS AI Scholar** - Empowering students with intelligent academic assistance 🎓
