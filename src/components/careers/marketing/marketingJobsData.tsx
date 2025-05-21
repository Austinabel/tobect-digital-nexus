
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import React from 'react';

export interface MarketingJob {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  iconName: string;
  iconColor: string;
}

// Helper function to get the appropriate icon component in MarketingCareers.tsx
export function getJobIcon(iconName: string, color: string): React.ReactNode {
  switch (iconName) {
    case 'TrendingUp':
      return <TrendingUp className={`h-8 w-8 text-${color}`} />;
    case 'Users':
      return <Users className={`h-8 w-8 text-${color}`} />;
    case 'BarChart3':
      return <BarChart3 className={`h-8 w-8 text-${color}`} />;
    default:
      return <TrendingUp className={`h-8 w-8 text-${color}`} />;
  }
}

export const marketingJobs: MarketingJob[] = [
  {
    id: 1,
    title: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    experience: '2-3 years',
    description: 'We are seeking a Digital Marketing Specialist to develop and implement digital marketing strategies across multiple platforms. The ideal candidate is experienced in SEO, SEM, social media marketing, and digital advertising campaigns.',
    responsibilities: [
      'Develop and execute digital marketing strategies to increase online presence',
      'Manage SEO/SEM campaigns and optimize website performance',
      'Create and manage content for social media platforms',
      'Analyze campaign performance metrics and prepare reports',
      'Stay updated with the latest digital marketing trends and technologies',
    ],
    requirements: [
      'Bachelor\'s degree in Marketing, Digital Media, or related field',
      'At least 2 years of experience in digital marketing',
      'Proficiency with Google Analytics, Google Ads, and social media platforms',
      'Strong analytical skills with a data-driven approach',
      'Excellent communication and project management skills',
    ],
    iconName: 'TrendingUp',
    iconColor: 'emerald-500',
  },
  {
    id: 2,
    title: 'Social Media Manager',
    department: 'Marketing',
    location: 'Lagos, Nigeria (Remote Available)',
    type: 'Full-time',
    experience: '1-3 years',
    description: 'We are looking for a creative Social Media Manager to join our team. The successful candidate will be responsible for developing and implementing our social media strategy to increase brand awareness and engagement.',
    responsibilities: [
      'Create and publish engaging content across all social media platforms',
      'Monitor and respond to audience comments and messages',
      'Develop and manage social media campaigns and promotions',
      'Track social media KPIs and provide regular performance reports',
      'Stay current with social media trends and platform updates',
    ],
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      'Proven experience as a Social Media Manager or similar role',
      'In-depth knowledge of Facebook, Twitter, Instagram, LinkedIn, and emerging platforms',
      'Experience with social media management tools',
      'Strong copywriting and visual communication skills',
    ],
    iconName: 'Users',
    iconColor: 'blue-500',
  },
  {
    id: 3,
    title: 'Content Marketing Specialist',
    department: 'Marketing',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    experience: '2+ years',
    description: 'We are seeking a talented Content Marketing Specialist to create compelling content that attracts and engages our target audience. This role is perfect for someone who is passionate about storytelling and creating value through content.',
    responsibilities: [
      'Develop content strategy aligned with short-term and long-term marketing targets',
      'Create various types of content including blog posts, emails, whitepapers, and website copy',
      'Collaborate with design and web development teams to optimize content for SEO',
      'Edit and proofread content before publication',
      'Measure and analyze content performance metrics',
    ],
    requirements: [
      'Bachelor\'s degree in Marketing, Journalism, English, or related field',
      'At least 2 years of experience in content marketing or content creation',
      'Excellent writing and editing skills with attention to detail',
      'Understanding of SEO principles and content optimization techniques',
      'Portfolio demonstrating content creation abilities',
    ],
    iconName: 'BarChart3',
    iconColor: 'purple-500',
  },
];
