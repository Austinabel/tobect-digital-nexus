import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { Package, ShoppingCart, Ticket, Receipt, FileText } from "lucide-react";

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

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      const newProduct = {
        name: data.name,
        category: data.category,
        price: parseInt(data.price),
        stock: parseInt(data.stock),
        description: data.description,
        image_url: data.image_url || null,
      };
      
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Product Added",
        description: `${data.name} has been added to your product catalog.`,
      });
      
      form.reset();
      setIsSheetOpen(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
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

  // Format currency in Naira
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tobecatGray-900">Products Management</h2>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white">
              Add New Product
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
              <SheetDescription>
                Fill in the details to add a new product to your inventory.
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
                      <FormControl>
                        <Input placeholder="Solar Panels" {...field} />
                      </FormControl>
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
                        <Input placeholder="High-efficiency monocrystalline solar panel..." {...field} />
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
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
                >
                  Add Product
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
                    <TableHead>ID</TableHead>
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
                      <TableCell className="font-medium">{product.id.substring(0, 8)}...</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatNaira(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
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
