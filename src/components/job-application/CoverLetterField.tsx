
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const CoverLetterField = ({ control }) => {
  return (
    <FormField
      control={control}
      name="coverLetter"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cover Letter</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Briefly tell us why you're a good fit for this position..."
              className="min-h-[150px] resize-y"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CoverLetterField;
