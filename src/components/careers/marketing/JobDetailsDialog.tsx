
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase } from 'lucide-react';

interface JobDetailsDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

const JobDetailsDialog = ({ job, open, onOpenChange, onApply }: JobDetailsDialogProps) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {job.department}
            </Badge>
            <Badge variant="outline" className="border-gray-300">
              {job.type}
            </Badge>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>{job.experience} experience</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p className="text-gray-700">{job.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Key Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {job.responsibilities.map((responsibility: string, idx: number) => (
                <li key={idx}>{responsibility}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {job.requirements.map((requirement: string, idx: number) => (
                <li key={idx}>{requirement}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                onOpenChange(false);
                onApply();
              }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
            >
              Apply For This Position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
