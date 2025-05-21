
import { useState } from 'react';
import JobCard from './marketing/JobCard';
import JobDetailsDialog from './marketing/JobDetailsDialog';
import JobApplicationDialog from './marketing/JobApplicationDialog';
import { marketingJobs } from './marketing/marketingJobsData';

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
            <JobCard 
              key={job.id} 
              job={job} 
              onViewDetails={handleViewDetails}
              onApply={handleApply}
            />
          ))}
        </div>
      </div>
      
      <JobDetailsDialog
        job={selectedJob}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApply={() => {
          setDialogOpen(false);
          setApplyFormOpen(true);
        }}
      />
      
      <JobApplicationDialog
        job={selectedJob}
        open={applyFormOpen}
        onOpenChange={setApplyFormOpen}
      />
    </section>
  );
}
