
import React, { useState } from 'react';
import { ArrowRight, Globe, Users, Code, Palette, MessageSquare, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const OpenPositions = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  const departments = [
    { id: 'all', name: 'All Departments', icon: <Globe className="w-5 h-5" /> },
    { id: 'development', name: 'Development', icon: <Code className="w-5 h-5" /> },
    { id: 'design', name: 'Design', icon: <Palette className="w-5 h-5" /> },
    { id: 'marketing', name: 'Marketing', icon: <LineChart className="w-5 h-5" /> },
    { id: 'customer', name: 'Customer Support', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'management', name: 'Management', icon: <Users className="w-5 h-5" /> },
  ];

  const jobListings = [
    {
      title: "Full Stack Developer",
      department: "development",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description: "We are looking for a skilled Full Stack Developer who is comfortable with both front-end and back-end development to join our growing team.",
    },
    {
      title: "UI/UX Designer",
      department: "design",
      location: "Remote",
      type: "Full-time",
      description: "We are seeking a creative UI/UX Designer to design and deliver user-centric design solutions for our web and mobile applications.",
    },
    {
      title: "Customer Support Specialist",
      department: "customer",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description: "We are looking for a Customer Support Specialist to serve as the primary point of contact for our customers.",
    },
    {
      title: "Front-End Developer",
      department: "development",
      location: "Remote",
      type: "Full-time",
      description: "We are seeking a talented Front-End Developer to help us create beautiful and functional web interfaces.",
    },
    {
      title: "Project Manager",
      department: "management",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description: "We are looking for an experienced Project Manager to lead our development projects from inception to completion.",
    },
    {
      title: "Graphic Designer",
      department: "design",
      location: "Lagos, Nigeria",
      type: "Contract",
      description: "We are seeking a creative Graphic Designer to create visual concepts for our clients' branding and marketing materials.",
    },
  ];

  const handleViewDetails = () => {
    toast({
      title: "Coming Soon",
      description: "This position is coming soon. Please check back later or apply for our Marketing positions.",
    });
  };

  const handleSpeculativeApplication = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is coming soon. Please apply to our available positions for now.",
    });
  };
  
  return (
    <section id="open-positions" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
        
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveTab(dept.id)}
              className={`inline-flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                activeTab === dept.id
                ? 'bg-tobecatBlue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <span className="mr-2">{dept.icon}</span>
              {dept.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobListings
          .filter(job => activeTab === 'all' || job.department === activeTab)
          .map((job, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.location}</p>
                </div>
                <span className="bg-tobecatBlue-100 text-tobecatBlue-800 text-xs font-medium rounded-full px-2.5 py-1">
                  {job.type}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{job.description}</p>
              <div className="mt-auto pt-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleViewDetails}
                >
                  <span>View Details</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Don't see a role that matches your skills?</p>
          <Button 
            onClick={handleSpeculativeApplication}
            variant="outline"
            className="border-tobecatBlue-500 text-tobecatBlue-600 hover:bg-tobecatBlue-50"
          >
            Send Speculative Application
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OpenPositions;
