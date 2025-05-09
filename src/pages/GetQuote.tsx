
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { services } from '@/data/services';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define form schema
const formSchema = z.object({
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

const GetQuote = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      budget: "<500000",
      primaryService: "",
      additionalServices: [],
      timeframe: "1-3months",
      projectDetails: "",
    },
  });

  // Submit handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      console.log("Form values:", values);
      setIsSubmitting(false);
      toast({
        title: "Quote Request Submitted",
        description: "We'll get back to you within 24-48 hours.",
      });
      form.reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-tobecatGray-900 mb-4 animate-fade-in">
              Get a <span className="text-tobecatBlue-600">Quote</span>
            </h1>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Tell us about your project and we'll provide you with a customized quote 
              tailored to your specific business needs.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 border border-tobecatBlue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-tobecatAccent-purple rounded-full filter blur-3xl opacity-20"></div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Smith" 
                              {...field} 
                              className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john@example.com" 
                              {...field} 
                              className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+234 123 456 7890" 
                              {...field} 
                              className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Company Inc." 
                              {...field} 
                              className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                            />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Budget Range* (in Naira ₦)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="<500000" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Less than ₦500,000
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="500000-2000000" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  ₦500,000 - ₦2,000,000
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="2000000-5000000" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  ₦2,000,000 - ₦5,000,000
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="5000000-10000000" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  ₦5,000,000 - ₦10,000,000
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="10000000+" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Above ₦10,000,000
                                </FormLabel>
                              </FormItem>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Service*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="animate-fade-in">
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                {service.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalServices"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Additional Services</FormLabel>
                          <FormDescription>
                            Select any additional services you're interested in
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {services.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="additionalServices"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={service.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.id.toString())}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], service.id.toString()])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== service.id.toString()
                                                )
                                              )
                                        }}
                                        className="border-tobecatBlue-300 text-tobecatBlue-600 focus:ring-tobecatBlue-300"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {service.title}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Project Timeframe*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="asap" className="border-tobecatBlue-300 text-tobecatBlue-600" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  As soon as possible
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="1-3months" className="border-tobecatBlue-300 text-tobecatBlue-600" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  1-3 months
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="3-6months" className="border-tobecatBlue-300 text-tobecatBlue-600" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  3-6 months
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="6months+" className="border-tobecatBlue-300 text-tobecatBlue-600" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  6+ months
                                </FormLabel>
                              </FormItem>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Details*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your project and any specific requirements..."
                            className="min-h-[120px] border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white py-6 text-lg transition-transform hover:scale-[1.01] shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GetQuote;
