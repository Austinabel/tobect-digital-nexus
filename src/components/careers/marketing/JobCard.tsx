
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
import { MapPin, Briefcase } from 'lucide-react';
import { MarketingJob, getJobIcon } from './marketingJobsData';

interface JobCardProps {
  job: MarketingJob;
  onViewDetails: (job: MarketingJob) => void;
  onApply: (job: MarketingJob) => void;
}

const JobCard = ({ job, onViewDetails, onApply }: JobCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-4">
          {getJobIcon(job.iconName, job.iconColor)}
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
          onClick={() => onViewDetails(job)}
        >
          View Details
        </Button>
        <Button 
          onClick={() => onApply(job)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
        >
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
