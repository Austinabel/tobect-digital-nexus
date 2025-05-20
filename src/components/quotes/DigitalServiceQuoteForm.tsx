
import React, { useState } from 'react';
import { services } from '@/data/services';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
import { digitalFormSchema, DigitalFormValues } from './QuoteFormSchemas';
import { generateQuoteId } from './QuoteIdGenerator';

interface DigitalServiceQuoteFormProps {
  onSubmitSuccess: (data: any) => void;
}

const DigitalServiceQuoteForm = ({ onSubmitSuccess }: DigitalServiceQuoteFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with validation for digital services
  const form = useForm<DigitalFormValues>({
    resolver: zodResolver(digitalFormSchema),
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

  // Digital services submit handler
  const onSubmit = async (values: DigitalFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a unique quote ID
      const quoteId = generateQuoteId("digital");
      
      // Prepare data for Supabase
      const quoteData = {
        type: "digital",
        quote_id: quoteId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        company: values.company || null,
        budget: values.budget,
        primary_service: values.primaryService,
        additional_services: values.additionalServices || [],
        timeframe: values.timeframe,
        project_details: values.projectDetails,
        status: "New",
        date: new Date().toISOString()
      };
      
      // Insert data into Supabase
      const { error } = await supabase.from('quotes').insert(quoteData);
      
      if (error) {
        console.error("Error submitting quote:", error);
        toast({
          title: "Error",
          description: "There was a problem submitting your request. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Digital quote submitted:", quoteData);
      onSubmitSuccess(quoteData);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-tobecatBlue-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
      
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
            {isSubmitting ? "Submitting..." : "Submit Digital Service Quote Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DigitalServiceQuoteForm;
