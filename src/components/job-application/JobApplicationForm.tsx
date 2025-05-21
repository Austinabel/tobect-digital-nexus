
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { formSchema } from './schema';
import { uploadResume } from './utils/fileUpload';
import PersonalInfoFields from './PersonalInfoFields';
import ResumeUploadField from './ResumeUploadField';
import CoverLetterField from './CoverLetterField';
import PortfolioField from './PortfolioField';

export default function JobApplicationForm({ job, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      portfolioUrl: '',
    },
  });

  const handleResumeChange = (file) => {
    setResumeFile(file);
  };

  const onSubmit = async (data) => {
    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload the resume file to Supabase Storage
      const resumeUrl = await uploadResume(resumeFile, data.fullName);
      
      // Insert the job application data into the database
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_title: job.title,
          department: job.department,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          cover_letter: data.coverLetter,
          portfolio_url: data.portfolioUrl || null,
          resume_url: resumeUrl,
          status: 'New',
        });
        
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Application Submitted",
        description: "Your job application has been received. We will contact you soon!",
      });
      
      onClose();
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your application. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInfoFields control={form.control} />
          
          <ResumeUploadField onFileChange={handleResumeChange} />
          
          <CoverLetterField control={form.control} />
          
          <PortfolioField control={form.control} />
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
