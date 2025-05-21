
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { MarketingJob } from './marketingJobsData';

interface JobApplicationDialogProps {
  job: MarketingJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobApplicationDialog = ({ job, open, onOpenChange }: JobApplicationDialogProps) => {
  if (!job) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>
        
        <JobApplicationForm 
          job={job} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationDialog;
