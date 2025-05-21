
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const PortfolioField = ({ control }) => {
  return (
    <FormField
      control={control}
      name="portfolioUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Portfolio/LinkedIn URL (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="https://..." {...field} />
          </FormControl>
          <FormDescription>
            Share your portfolio website or LinkedIn profile
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PortfolioField;
