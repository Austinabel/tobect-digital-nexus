
import { z } from 'zod';

// Define form schema for digital services
export const digitalFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  company: z.string().optional(),
  budget: z.enum(["<500000", "500000-2000000", "2000000-5000000", "5000000-10000000", "10000000+"]),
  primaryService: z.string().min(1, { message: "Please select a primary service" }),
  additionalServices: z.array(z.string()).optional(),
  timeframe: z.enum(["asap", "1-3months", "3-6months", "6months+"]),
  projectDetails: z.string().min(10, { message: "Please provide some project details" }),
});

// Define form schema for product sales
export const salesFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  address: z.string().min(5, { message: "Delivery address is required" }),
  productCategory: z.string().min(1, { message: "Please select a product category" }),
  productId: z.string().min(1, { message: "Please select a product" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
  installation: z.boolean().optional(),
  additionalInfo: z.string().optional(),
});

export type DigitalFormValues = z.infer<typeof digitalFormSchema>;
export type SalesFormValues = z.infer<typeof salesFormSchema>;
