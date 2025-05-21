
import * as z from 'zod';

export const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(6, { message: 'Phone number is required' }),
  resume: z.any().optional(),
  coverLetter: z.string().min(50, { message: 'Cover letter should be at least 50 characters' }),
  portfolioUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});
