import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { Package, ShoppingCart, Ticket, Receipt, FileText, Image } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "../product/ImageUploader";
import { ProductImage } from "@/types/productImages";

// Form schema for adding new products
const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(2, { message: "Category is required." }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a number",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Stock must be a number",
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  image_url: z.string().optional(),
});

// Type for product data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url?: string;
}

// Mock data for orders, tickets, and transactions (we'll replace these with real data later)
const mockOrders = [
  { id: "ORD-2023-001", date: "2023-05-15", customer: "John Smith", items: 2, total: 430000, status: "Delivered" },
  { id: "ORD-2023-002", date: "2023-05-18", customer: "Emily Johnson", items: 3, total: 625000, status: "Processing" },
  { id: "ORD-2023-003", date: "2023-05-20", customer: "Michael Brown", items: 1, total: 250000, status: "Shipped" },
  { id: "ORD-2023-004", date: "2023-05-22", customer: "Sarah Davis", items: 4, total: 820000, status: "Pending" },
];

// Mock data for support tickets
const mockTickets = [
  { id: "TKT-2023-001", date: "2023-05-16", customer: "John Smith", subject: "Installation Query", status: "Open" },
  { id: "TKT-2023-002", date: "2023-05-18", customer: "Emily Johnson", subject: "Product Warranty", status: "Closed" },
  { id: "TKT-2023-003", date: "2023-05-21", customer: "Michael Brown", subject: "Technical Support", status: "In Progress" },
  { id: "TKT-2023-004", date: "2023-05-23", customer: "Sarah Davis", subject: "Order Issue", status: "Open" },
];

// Mock data for transactions
const mockTransactions = [
  { id: "TRX-2023-001", date: "2023-05-15", type: "Payment", amount: 430000, method: "Credit Card", status: "Completed" },
  { id: "TRX-2023-002", date: "2023-05-18", type: "Refund", amount: 45000, method: "Bank Transfer", status: "Completed" },
  { id: "TRX-2023-003", date: "2023-05-20", type: "Payment", amount: 250000, method: "PayPal", status: "Pending" },
  { id: "TRX-2023-004", date: "2023-05-22", type: "Payment", amount: 820000, method: "Bank Transfer", status: "Completed" },
];

const ProductsManager = () => {
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Solar Panels',
    'Batteries',
    'Inverters',
    'CCTV Cameras',
    'Solar Generators',
    'All in Ones'
  ]);

  // Form for adding new products
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
    },
  });

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProductImages = async (productId: string) => {
    try {
      // Need to use fetch directly as Supabase client doesn't know about the new table yet
      const { data, error } = await supabase
        .rpc('get_product_images', { p_product_id: productId })
        .returns<ProductImage[]>();

      if (error) {
        throw error;
      }
      
      if (data) {
        setProductImages(data);
        return data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching product images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product images",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleEditProduct = async (product: Product) => {
    form.reset({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      image_url: product.image_url || "",
    });
    setEditingProductId(product.id);
    setIsEditing(true);
    
    // Fetch product images
    try {
      // Directly fetch images through REST API since Supabase client doesn't know about new table
      const response = await fetch(`https://xyrdhogqwhlpbfftgokj.supabase.co/rest/v1/product_images?product_id=eq.${product.id}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA'
        }
      });
      const images = await response.json() as ProductImage[];
      setProductImages(images);
    } catch (error) {
      console.error("Error fetching product images:", error);
      setProductImages([]);
    }
    
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      const productData = {
        name: data.name,
        category: data.category,
        price: parseInt(data.price),
        stock: parseInt(data.stock),
        description: data.description,
        image_url: data.image_url || null,
      };
      
      let result;
      let newProductId: string | null = null;
      
      if (isEditing && editingProductId) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProductId);
          
        if (result.error) throw result.error;
        
        toast({
          title: "Product Updated",
          description: `${data.name} has been updated.`,
        });
        
        newProductId = editingProductId;
      } else {
        // Add new product
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
          
        if (result.error) throw result.error;
        
        if (result.data && result.data.length > 0) {
          newProductId = result.data[0].id;
        }
        
        toast({
          title: "Product Added",
          description: `${data.name} has been added to your product catalog.`,
        });
      }
      
      // If we have images and a product ID, we need to update the product_id for each image
      if (productImages.length > 0 && newProductId) {
        try {
          // Update product_id for each image through REST API
          for (const image of productImages) {
            await fetch(`https://xyrdhogqwhlpbfftgokj.supabase.co/rest/v1/product_images?id=eq.${image.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ product_id: newProductId })
            });
          }
        } catch (error) {
          console.error("Error updating product_id for images:", error);
        }
      }
      
      form.reset();
      setIsSheetOpen(false);
      setIsEditing(false);
      setEditingProductId(null);
      setProductImages([]);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      // Delete associated images through REST API
      await fetch(`https://xyrdhogqwhlpbfftgokj.supabase.co/rest/v1/product_images?product_id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmRob2dxd2hscGJmZnRnb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzI2MTEsImV4cCI6MjA2MzM0ODYxMX0.aK2o3zBR9ioNmON5ae9yG-_MJuYBEYej9pf8151XOZA',
          'Prefer': 'return=minimal'
        }
      });
      
      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Product Deleted",
        description: "The product has been removed from your catalog.",
      });
      
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };
  
  const resetForm = () => {
    form.reset({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
    });
    setIsEditing(false);
    setEditingProductId(null);
    setProductImages([]);
  };

  const handleOpenSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    
    // Set the primary image URL as the product image_url
    const primaryImage = images.find(img => img.is_primary);
    if (primaryImage) {
      form.setValue('image_url', primaryImage.url);
    } else if (images.length > 0) {
      form.setValue('image_url', images[0].url);
    }
  };

  // Format currency in Naira
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tobecatGray-900">Products Management</h2>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button 
              onClick={handleOpenSheet}
              className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
            >
              Add New Product
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto w-full max-w-2xl">
            <SheetHeader>
              <SheetTitle>{isEditing ? "Edit Product" : "Add New Product"}</SheetTitle>
              <SheetDescription>
                {isEditing 
                  ? "Update the details of your existing product." 
                  : "Fill in the details to add a new product to your inventory."}
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Solar Panel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Price (₦)</FormLabel>
                        <FormControl>
                          <Input placeholder="250000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="High-efficiency monocrystalline solar panel..." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <>
                          <Input 
                            type="hidden" 
                            {...field} 
                          />
                          {editingProductId && (
                            <ImageUploader 
                              productId={editingProductId} 
                              onImagesChange={handleImagesChange}
                              existingImages={productImages}
                            />
                          )}
                          {!editingProductId && (
                            <div className="text-sm text-gray-500 mb-2">
                              Save the product first to upload images.
                            </div>
                          )}
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
                >
                  {isEditing ? "Update Product" : "Add Product"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b pb-0 mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <Package size={18} />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <ShoppingCart size={18} />
            Orders
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <Ticket size={18} />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <Receipt size={18} />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <FileText size={18} />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No products found. Add your first product!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <div className="w-12 h-12 rounded overflow-hidden border">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded overflow-hidden border flex items-center justify-center bg-gray-100">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatNaira(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{formatNaira(order.total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell>{ticket.customer}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Respond</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{formatNaira(transaction.amount)}</TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-500 mb-2">Reports Module</h3>
              <p className="text-gray-400">Sales and inventory reports coming soon</p>
              <Button variant="outline" className="mt-4">Generate Sample Report</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsManager;
