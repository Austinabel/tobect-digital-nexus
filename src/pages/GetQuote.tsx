
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { services } from '@/data/services';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, ArrowRight, Zap, Battery, SolarPanel, Cctv, CircleDollarSign } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define product categories and items
const productCategories = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    icon: <SolarPanel className="h-5 w-5" />,
    items: [
      { id: 1, name: 'Premium 500W Monocrystalline Panel', price: 250000 },
      { id: 2, name: 'Commercial 1KW Solar Array', price: 520000 },
      { id: 3, name: 'Portable 100W Solar Panel', price: 65000 }
    ]
  },
  {
    id: 'batteries',
    name: 'Batteries',
    icon: <Battery className="h-5 w-5" />,
    items: [
      { id: 4, name: 'Lithium 5kWh Battery Bank', price: 750000 },
      { id: 5, name: 'Deep Cycle Gel Battery 200Ah', price: 180000 },
      { id: 6, name: 'Advanced LiFePO4 Battery 100Ah', price: 350000 }
    ]
  },
  {
    id: 'inverters',
    name: 'Inverters',
    icon: <Zap className="h-5 w-5" />,
    items: [
      { id: 7, name: '5kW Hybrid Inverter', price: 650000 },
      { id: 8, name: '2kW Pure Sine Wave Inverter', price: 230000 },
      { id: 9, name: '10kW Three-Phase Inverter', price: 1200000 }
    ]
  },
  {
    id: 'cctv',
    name: 'CCTV Cameras',
    icon: <Cctv className="h-5 w-5" />,
    items: [
      { id: 10, name: '4K Dome Security Camera', price: 45000 },
      { id: 11, name: 'Wireless Home Security Camera Set', price: 120000 },
      { id: 12, name: 'AI-Powered PTZ Camera', price: 85000 }
    ]
  },
  {
    id: 'generators',
    name: 'Solar Generators',
    icon: <CircleDollarSign className="h-5 w-5" />,
    items: [
      { id: 13, name: 'Portable 1500Wh Solar Generator', price: 380000 },
      { id: 14, name: '3000W Home Backup System', price: 720000 },
      { id: 15, name: 'Commercial 5kW Solar Generator', price: 1500000 }
    ]
  }
];

// Define form schema for digital services
const digitalFormSchema = z.object({
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
const salesFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  address: z.string().min(5, { message: "Delivery address is required" }),
  productCategory: z.string().min(1, { message: "Please select a product category" }),
  productId: z.string().min(1, { message: "Please select a product" }),
  quantity: z.string().transform(val => Number(val)).refine(val => val >= 1, {
    message: "Quantity must be at least 1"
  }),
  installation: z.boolean().optional(),
  additionalInfo: z.string().optional(),
});

const GetQuote = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("digital");

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('product');
    const categoryId = params.get('category');
    const section = params.get('section');
    
    if (section === 'sales') {
      setActiveTab('sales');
      if (categoryId) {
        setSelectedCategory(categoryId);
        salesForm.setValue('productCategory', categoryId);
      }
      if (productId) {
        salesForm.setValue('productId', productId);
      }
    }
  }, [location]);
  
  // Set up form with validation for digital services
  const digitalForm = useForm<z.infer<typeof digitalFormSchema>>({
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
  
  // Set up form with validation for product sales
  const salesForm = useForm<z.infer<typeof salesFormSchema>>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      productCategory: "",
      productId: "",
      quantity: "1",
      installation: true,
      additionalInfo: "",
    },
  });

  // Digital services submit handler
  const onDigitalSubmit = (values: z.infer<typeof digitalFormSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      console.log("Digital form values:", values);
      setIsSubmitting(false);
      toast({
        title: "Digital Service Quote Request Submitted",
        description: "We'll get back to you within 24-48 hours.",
      });
      digitalForm.reset();
    }, 1500);
  };
  
  // Product sales submit handler
  const onSalesSubmit = (values: z.infer<typeof salesFormSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      console.log("Sales form values:", values);
      setIsSubmitting(false);
      toast({
        title: "Product Order Request Submitted",
        description: "We'll contact you shortly to confirm your order.",
      });
      salesForm.reset();
    }, 1500);
  };
  
  // Format price in Naira
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-tobecatGray-900 mb-4 animate-fade-in">
              Get a <span className="text-tobecatBlue-600">Quote</span>
            </h1>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Tell us what you're looking for and we'll provide you with a customized solution.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 h-14 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger 
                  value="digital" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tobecatBlue-600 data-[state=active]:to-tobecatBlue-500 data-[state=active]:text-white rounded-md text-sm md:text-base py-3 transition-all"
                >
                  Digital Services
                </TabsTrigger>
                <TabsTrigger 
                  value="sales" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tobecatBlue-600 data-[state=active]:to-tobecatBlue-500 data-[state=active]:text-white rounded-md text-sm md:text-base py-3 transition-all"
                >
                  Product Purchase
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="digital" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-tobecatBlue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
                
                <Form {...digitalForm}>
                  <form onSubmit={digitalForm.handleSubmit(onDigitalSubmit)} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={digitalForm.control}
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
                        control={digitalForm.control}
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
                        control={digitalForm.control}
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
                        control={digitalForm.control}
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
                      control={digitalForm.control}
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
                      control={digitalForm.control}
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
                      control={digitalForm.control}
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
                                control={digitalForm.control}
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
                      control={digitalForm.control}
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
                      control={digitalForm.control}
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
            </TabsContent>

            <TabsContent value="sales" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-tobecatBlue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-20"></div>
                
                <Form {...salesForm}>
                  <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={salesForm.control}
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
                        control={salesForm.control}
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
                        control={salesForm.control}
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
                        control={salesForm.control}
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
                        control={salesForm.control}
                        name="productCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Category*</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCategory(value);
                                salesForm.setValue('productId', '');
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
                        control={salesForm.control}
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
                        control={salesForm.control}
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
                        control={salesForm.control}
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
                      control={salesForm.control}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GetQuote;
