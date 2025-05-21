
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, TrendingUp, Briefcase, Users, BarChart3 } from 'lucide-react';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';

const marketingJobs = [
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
    icon: <TrendingUp className="h-8 w-8 text-emerald-500" />,
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
    icon: <Users className="h-8 w-8 text-blue-500" />,
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
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
  },
];

export default function MarketingCareers() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyFormOpen, setApplyFormOpen] = useState(false);
  
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };
  
  const handleApply = (job) => {
    setSelectedJob(job);
    setDialogOpen(false);
    setApplyFormOpen(true);
  };
  
  return (
    <section id="marketing-careers" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Marketing Careers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our innovative marketing team and help shape the digital presence of brands across Nigeria and beyond. We're looking for creative minds that can drive engagement and results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketingJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  {job.icon}
                </div>
                <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {job.department}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300">
                    {job.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{job.experience} experience</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleViewDetails(job)}
                >
                  View Details
                </Button>
                <Button 
                  onClick={() => handleApply(job)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedJob && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedJob.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {selectedJob.department}
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  {selectedJob.type}
                </Badge>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{selectedJob.experience} experience</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {selectedJob.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {selectedJob.requirements.map((requirement, idx) => (
                    <li key={idx}>{requirement}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    setDialogOpen(false);
                    setApplyFormOpen(true);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                >
                  Apply For This Position
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      <Dialog open={applyFormOpen} onOpenChange={setApplyFormOpen}>
        {selectedJob && (
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Apply for {selectedJob.title}
              </DialogTitle>
            </DialogHeader>
            
            <JobApplicationForm 
              job={selectedJob} 
              onClose={() => setApplyFormOpen(false)} 
            />
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
