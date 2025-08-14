# CARITAS AI Scholar

<div align="center">

![CARITAS AI Scholar](https://img.shields.io/badge/CARITAS-AI%20Scholar-blue?style=for-the-badge&logo=graduation-cap)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**An intelligent academic companion that empowers students with AI-driven assistance for better learning outcomes and academic success.**

[🚀 Live Demo](https://caritas-ai-scholar.vercel.app) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing) • [💬 Support](#support)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🌐 Deployment](#-deployment)
- [🗄️ Database Schema](#️-database-schema)
- [🔧 Configuration](#-configuration)
- [📊 Key Features](#-key-features)
- [🎯 Performance](#-performance)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🎯 Core Capabilities

| Feature | Description | Status |
|---------|-------------|---------|
| **🤖 AI Chat Assistant** | Intelligent conversational AI for instant academic help | ✅ Active |
| **📚 Course Assistant** | Upload materials and generate study aids (summaries, flashcards, quizzes) | ✅ Active |
| **📅 Study Planner** | AI-powered personalized study scheduling with intelligent optimization | ✅ Enhanced |
| **📊 GPA Calculator** | Track and calculate your academic performance | ✅ Active |
| **🔍 Research Assistant** | AI-powered academic research and citation help | ✅ Active |
| **📈 Analytics Dashboard** | Personalized learning analytics and real-time progress tracking | ✅ Active |

### 🌟 Advanced Features

- **📋 Smart Study Planning**: Generates optimal study schedules based on deadlines, priorities, and learning patterns
- **💾 Plan Persistence**: Save, load, and manage multiple personalized study plans with cloud sync
- **📄 Document Processing**: Upload PDFs, DOCX files for automatic analysis and content extraction
- **🎯 Study Tools Generation**: Auto-creates flashcards, quizzes, and summaries from uploaded materials
- **📊 Real-time Analytics**: Track learning progress and study habits with live dashboard updates
- **📱 Mobile-First Design**: Fully responsive design optimized for all devices (320px+)
- **🌙 Theme Support**: Dark/light mode with system preference detection
- **⚡ Production Ready**: Fully configured for deployment with CORS support and optimizations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **Styling**: Tailwind CSS with custom design system
- **Components**: Shadcn/UI (customizable component library)
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query + Zustand
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React

### Backend & Services
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth (multiple providers supported)
- **API**: Supabase Edge Functions (Deno runtime)
- **File Storage**: Supabase Storage with automatic optimization
- **AI Integration**: 
  - OpenAI (GPT models)
  - Google AI (Gemini)
  - OpenRouter (multiple model access)

### Development & Deployment
- **Package Manager**: npm/yarn
- **Deployment**: Vercel (optimized for production)
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Built-in error tracking and analytics

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase account** ([Sign up](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/caritas-ai-scholar.git
   cd caritas-ai-scholar
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🌐 Deployment

### Vercel (Recommended)

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/caritas-ai-scholar)

**Manual Deployment:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   
   In your Vercel dashboard, add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Alternative Platforms

**Netlify:**
```bash
npm run build
# Upload the dist/ folder to Netlify
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

The application uses Supabase PostgreSQL with the following core tables:

### Primary Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `profiles` | User profile information | Auth integration, preferences |
| `chat_history` | AI conversation history | Message threading, context |
| `study_plans` | Personalized study schedules | AI-generated, user customizable |
| `materials` | Uploaded course materials | File metadata, processing status |
| `segments` | Processed document segments | Vector embeddings, searchable |
| `flashcards` | Generated study flashcards | AI-created from materials |
| `quizzes` | Practice quiz questions | Adaptive difficulty |
| `summaries` | AI-generated content summaries | Key concepts extraction |

### Database Features
- **Row Level Security (RLS)**: Data isolation per user
- **Real-time Subscriptions**: Live updates across devices
- **Vector Search**: Semantic search capabilities
- **Automatic Backups**: Point-in-time recovery
- **Performance Optimization**: Indexed queries and caching

## 🔧 Configuration

### Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Database Migration**
   ```bash
   # Run the included SQL migrations
   npx supabase db push
   ```

3. **Authentication Setup**
   - Enable email authentication
   - Configure OAuth providers (optional)
   - Set up email templates

4. **Edge Functions Deployment**
   ```bash
   # Deploy AI processing functions
   npx supabase functions deploy
   ```

### AI API Configuration

Set up the following secrets in your Supabase Edge Functions:

```bash
# Required API keys
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set GOOGLE_AI_KEY=your_google_ai_key
supabase secrets set OPENROUTER_KEY=your_openrouter_key
supabase secrets set SERPER_API_KEY=your_serper_key
```

### CORS Configuration

The project includes optimized CORS settings for:
- Supabase API communication
- Edge Functions integration
- Real-time subscriptions
- File upload/download operations

## 📊 Key Features

### 🧠 AI Study Planner

The enhanced study planner provides:

- **Dynamic Scheduling**: AI calculates optimal study duration based on deadlines and workload
- **Subject Prioritization**: Intelligent ranking based on deadlines and difficulty
- **Workload Distribution**: Even distribution of study sessions across available time
- **Progress Tracking**: Visual completion tracking with analytics
- **Plan Management**: Save, load, and manage multiple study plans
- **Automatic Cleanup**: Expired subjects are automatically removed

### 📚 Course Assistant

Advanced document processing capabilities:

- **Multi-format Support**: PDF, DOCX, TXT files
- **Content Extraction**: Smart text extraction with formatting preservation
- **AI Analysis**: Automatic key concept identification
- **Study Tools Generation**: 
  - Interactive flashcards
  - Practice quizzes with explanations
  - Comprehensive summaries
- **Material Library**: Organized storage with search functionality

### 🤖 AI Chat Integration

Intelligent conversational assistance:

- **Context Awareness**: Understands your academic subjects and materials
- **Multi-model Support**: Leverages multiple AI providers for best results
- **Conversation Memory**: Maintains context across sessions
- **Smart Suggestions**: Provides relevant prompts and guidance

### 📈 Analytics Dashboard

Comprehensive learning insights:

- **Real-time Metrics**: Live updates of study progress
- **Visual Analytics**: Charts and graphs for progress tracking
- **Learning Patterns**: AI-identified study habits and recommendations
- **Performance Insights**: Detailed analysis of academic performance

## 🎯 Performance

### Optimization Features

- **Code Splitting**: Automatic route-based bundling
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic compression and WebP conversion
- **API Caching**: Smart caching with TanStack Query
- **Mobile Performance**: Optimized bundle sizes for mobile devices
- **Progressive Loading**: Skeleton states and smooth transitions

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Mobile Performance Score**: 90+
- **Desktop Performance Score**: 95+

## 🔒 Security

### Security Measures

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure JWT-based authentication
- **Input Validation**: Client and server-side validation
- **CORS Protection**: Properly configured cross-origin policies
- **API Rate Limiting**: Protection against abuse
- **Data Encryption**: End-to-end encryption for sensitive data
- **Secure Headers**: Content Security Policy and security headers

### Privacy & Data Protection

- **GDPR Compliant**: Privacy-first design
- **Data Minimization**: Only collect necessary data
- **User Control**: Full control over data deletion
- **Secure Storage**: Encrypted storage for all user data

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting
- Keep pull requests focused and atomic

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📊 Analytics & Monitoring

### Built-in Analytics

- **User Engagement**: Track feature usage and user interactions
- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Automatic error reporting and debugging
- **Usage Statistics**: Detailed insights into app usage patterns

### Monitoring Tools

- **Real-time Dashboards**: Live monitoring of app health
- **Alert System**: Automatic notifications for critical issues
- **Performance Insights**: Detailed performance analysis
- **User Behavior Analytics**: Understanding user patterns

## 🎨 Customization

### Theming System

- **Design Tokens**: Semantic color and spacing system
- **Component Variants**: Extensible component library
- **Responsive Design**: Mobile-first breakpoint system
- **Dark/Light Mode**: Automatic theme switching
- **Custom Branding**: Easy brand customization

### Customization Options

```css
/* Custom color palette */
:root {
  --primary: your-primary-color;
  --secondary: your-secondary-color;
  --accent: your-accent-color;
}
```

## 🆘 Support

### Getting Help

- **Documentation**: Comprehensive guides and tutorials
- **Community**: Join our Discord community
- **Issues**: Report bugs on GitHub
- **Email Support**: support@caritas-ai.com

### Resources

- [📖 Full Documentation](https://docs.caritas-ai.com)
- [💬 Discord Community](https://discord.gg/caritas-ai)
- [🐛 Bug Reports](https://github.com/your-username/caritas-ai-scholar/issues)
- [💡 Feature Requests](https://github.com/your-username/caritas-ai-scholar/discussions)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Built With

- [Lovable](https://lovable.dev) - AI-powered web development platform
- [Shadcn/UI](https://ui.shadcn.com) - Beautiful and accessible UI components
- [Lucide](https://lucide.dev) - Beautiful and consistent icons
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Vercel](https://vercel.com) - Platform for frontend developers

### Special Thanks

- Open source community for amazing tools and libraries
- Beta testers for valuable feedback and suggestions
- Contributors who helped shape this project

---

<div align="center">

**CARITAS AI Scholar** - Empowering students with intelligent academic assistance 🎓

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)]()
[![Mobile](https://img.shields.io/badge/Mobile-Optimized-blue?style=for-the-badge)]()
[![Real-time](https://img.shields.io/badge/Real--time-Enabled-purple?style=for-the-badge)]()

**[🚀 Get Started](https://caritas-ai-scholar.vercel.app)** | **[📖 Documentation](#documentation)** | **[💬 Community](#support)**

Made with ❤️ by the CARITAS AI team

</div>