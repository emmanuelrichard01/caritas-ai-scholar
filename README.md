
# CARITAS AI Scholar

CARITAS AI Scholar is an intelligent academic companion that empowers students with AI-driven assistance for better learning outcomes and academic success.

## 🚀 Features

### 📚 Core Features
- **AI Chat Assistant**: Intelligent conversational AI for instant academic help
- **Course Assistant**: Upload materials and generate study aids (summaries, flashcards, quizzes)
- **Study Planner**: AI-powered personalized study scheduling with intelligent optimization and persistence
- **GPA Calculator**: Track and calculate your academic performance
- **Research Assistant**: AI-powered academic research and citation help
- **Dashboard**: Personalized learning analytics and real-time progress tracking

### 🎯 Key Capabilities
- **Smart Study Planning**: Generates optimal study schedules based on your preferences, deadlines, and learning patterns
- **Study Plan Persistence**: Save, load, and manage multiple personalized study plans
- **Document Processing**: Upload PDFs, documents, and materials for automatic analysis
- **Study Tools Generation**: Auto-creates flashcards, quizzes, and summaries from your materials
- **Real-time Analytics**: Track your learning progress and study habits with live updates
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Customizable theme preferences
- **Production Ready**: Fully configured for deployment on Vercel with CORS support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions, Real-time)
- **AI Integration**: OpenAI, Google AI, OpenRouter
- **State Management**: TanStack Query, Zustand
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel (Production Ready)

## 📱 Mobile First Design

CARITAS AI Scholar is built with a mobile-first approach, ensuring:
- Responsive layouts for all screen sizes (320px+)
- Touch-friendly interface elements
- Optimized performance on mobile devices
- Clean, distraction-free mobile UI
- Progressive Web App capabilities

## 🚀 Quick Start

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

## 🌐 Production Deployment

### Deploy to Vercel (Recommended)

This project is production-ready and optimized for Vercel deployment:

1. **One-Click Deploy to Vercel**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/caritas-ai-scholar)

2. **Manual Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy to Vercel
   vercel
   
   # Set environment variables in Vercel dashboard
   ```

3. **Environment Variables for Vercel**
   Set these in your Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the dist folder to Netlify
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **profiles**: User profile information
- **chat_history**: Conversation history and interactions
- **study_plans**: Personalized study schedules and plans (NEW)
- **materials**: Uploaded course materials
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
2. Run the SQL migrations from the project
3. Set up authentication providers as needed
4. Configure Row Level Security (RLS) policies
5. Enable real-time subscriptions for live updates

### CORS Configuration
The project includes proper CORS configuration for:
- Supabase API access
- Edge Functions communication
- Real-time subscriptions
- File uploads and processing

## 📊 Features in Detail

### AI Study Planner (Enhanced)
- **Intelligent Scheduling**: AI analyzes your subjects, deadlines, and preferences
- **Plan Persistence**: Save and manage multiple study plans
- **Adaptive Planning**: Adjusts based on your progress and learning patterns
- **Multiple Study Modes**: Pomodoro, timeboxing, and flexible scheduling
- **Progress Tracking**: Visual analytics of your study habits and completion rates
- **Real-time Updates**: Automatic synchronization across devices

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

### Dashboard (Enhanced)
- **Real-time Analytics**: Live updates of your learning progress
- **Personalized Insights**: AI-driven recommendations and insights
- **Activity Tracking**: Comprehensive overview of your study activities
- **Mobile Optimized**: Clean, responsive design for all devices

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic image compression and sizing
- **Caching**: Smart caching strategies for API responses
- **Mobile Performance**: Optimized bundle sizes for mobile devices

## 🔒 Security Features

- **Row Level Security**: Database-level security policies
- **Authentication**: Secure user authentication with Supabase Auth
- **CORS Protection**: Proper CORS configuration for secure API access
- **Input Validation**: Client and server-side input validation
- **API Rate Limiting**: Protection against abuse and excessive usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Analytics & Monitoring

The application includes built-in analytics for:
- User engagement tracking
- Feature usage statistics
- Performance monitoring
- Error tracking and reporting
- Real-time user activity

## 🎨 Customization

- **Theming**: Full dark/light mode support with system preference detection
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Component Library**: Extensible Shadcn/UI component system
- **Color Schemes**: Customizable color palettes and branding

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@caritas-ai.com or join our Discord community.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered web development
- UI components from [Shadcn/UI](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)

---

**CARITAS AI Scholar** - Empowering students with intelligent academic assistance 🎓

**Production Status**: ✅ Ready for deployment
**Mobile Optimized**: ✅ Fully responsive
**Real-time Features**: ✅ Live updates enabled
