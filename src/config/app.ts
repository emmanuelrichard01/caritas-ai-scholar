/**
 * Application Configuration
 * 
 * Centralized config that replaces all hardcoded brand values.
 * The `university` object provides defaults; in Phase 2 these will be
 * overridden dynamically from the `universities` table per tenant.
 */

export const APP_CONFIG = {
  /** Default brand identity — overridden per university in multi-tenant mode */
  brand: {
    name: 'Caritas AI',
    tagline: 'Your AI Study Companion',
    description: 'AI-powered academic assistance for better learning outcomes.',
    supportEmail: 'support@caritasai.com',
    copyright: `© ${new Date().getFullYear()} Caritas AI. All rights reserved.`,
  },

  /** Feature flags — toggle entire feature routes */
  features: {
    chat: true,
    dashboard: true,
    courseAssistant: true,
    studyPlanner: true,
    gpaCalculator: true,
    researchAssistant: true,
    history: true,
  },

  /** Default university config — replaced by DB row in multi-tenant mode */
  university: {
    name: 'Caritas University',
    slug: 'caritas',
    primaryColor: '#dc2626',
    gradingScale: 5.0,     // Nigerian grading standard
    semesterSystem: 'two',  // 'two' | 'three' | 'quarter'
  },

  /** AI provider defaults */
  ai: {
    defaultProvider: 'google' as const,
    fallbackProvider: 'openrouter' as const,
    maxQueryLength: 5000,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    supportedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },

  /** Route paths — single source of truth */
  routes: {
    home: '/',
    auth: '/auth',
    dashboard: '/dashboard',
    chat: '/chat',
    gpaCalculator: '/gpa-calculator',
    studyPlanner: '/study-planner',
    courseAssistant: '/course-assistant',
    researchAssistant: '/research-assistant',
    history: '/history',
  },
} as const;

/** Type for the brand config — useful for components that accept brand props */
export type BrandConfig = typeof APP_CONFIG.brand;

/** Type for feature flags */
export type FeatureFlags = typeof APP_CONFIG.features;
