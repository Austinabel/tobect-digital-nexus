
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDescription } from '@/components/ui/form';

const ResumeUploadField = ({ onFileChange }) => {
  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="resume">Upload Resume (PDF, DOC, DOCX)</Label>
      <Input
        id="resume"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeChange}
        className="cursor-pointer"
      />
      <FormDescription>
        Upload your resume in PDF, DOC, or DOCX format (max 5MB)
      </FormDescription>
    </div>
  );
};

export default ResumeUploadField;
