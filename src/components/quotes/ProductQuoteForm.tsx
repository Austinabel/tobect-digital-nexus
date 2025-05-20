
import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salesFormSchema, SalesFormValues } from './QuoteFormSchemas';
import { generateQuoteId } from './QuoteIdGenerator';
import { formatPrice, getSelectedProduct, productCategories } from './ProductCategoriesData';

interface ProductQuoteFormProps {
  onSubmitSuccess: (data: any) => void;
}

const ProductQuoteForm = ({ onSubmitSuccess }: ProductQuoteFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Set up form with validation for product sales
  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      productCategory: "",
      productId: "",
      quantity: 1,
      installation: true,
      additionalInfo: "",
    },
  });

  // Product sales submit handler
  const onSubmit = async (values: SalesFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a unique quote ID
      const quoteId = generateQuoteId("product");
      
      // Find product details
      const selectedProduct = getSelectedProduct(values.productCategory, values.productId);
      
      // Prepare data for Supabase
      const quoteData = {
        type: "product",
        quote_id: quoteId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        product_category: values.productCategory,
        product: selectedProduct ? selectedProduct.name : values.productId,
        quantity: values.quantity,
        installation: values.installation || false,
        additional_info: values.additionalInfo || null,
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
      
      console.log("Product quote submitted:", quoteData);
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
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-20"></div>
      
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Street Name, City, State" 
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
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Category*</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                      form.setValue('productId', '');
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="animate-fade-in">
                      {productCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            {category.icon}
                            <span className="ml-2">{category.name}</span>
                          </div>
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
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger className="border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300">
                        <SelectValue placeholder={selectedCategory ? "Select a product" : "Select a category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="animate-fade-in">
                      {selectedCategory && productCategories
                        .find(cat => cat.id === selectedCategory)?.items
                        .map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex justify-between w-full">
                              <span>{product.name}</span>
                              <span className="text-tobecatBlue-600 font-medium">{formatPrice(product.price)}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity*</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
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
              name="installation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-tobecatBlue-300 text-tobecatBlue-600 focus:ring-tobecatBlue-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include Professional Installation
                    </FormLabel>
                    <FormDescription>
                      Our experts will install your product for an additional fee
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific requirements or questions about the product?"
                    className="min-h-[100px] border-tobecatBlue-200 focus:border-tobecatBlue-400 focus:ring-tobecatBlue-300 transition-all"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white py-6 text-lg transition-transform hover:scale-[1.01] shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Place Order Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProductQuoteForm;
