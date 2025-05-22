
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Ticket as TicketIcon, Receipt, FileText, MessageSquare } from 'lucide-react';
import ProductsTable from './products/ProductsTable';
import ProductFormManager from './products/ProductFormManager';
import OrdersTab from './products/OrdersTab';
import TicketsTab from './products/TicketsTab';
import TransactionsTab from './products/TransactionsTab';
import ReportsTab from './products/ReportsTab';
import ReviewsTab from './products/ReviewsTab';
import { Product, Order, Ticket, Transaction } from '@/types/product';
import { ProductImage } from "@/types/productImages";
import { ProductFormValues } from './products/ProductForm';
import { fetchProductImages } from './products/ProductImageService';
import { deleteProduct, prepareProductForEdit } from './products/ProductOperations';

// Mock data for orders, tickets, and transactions (we'll replace these with real data later)
const mockOrders: Order[] = [
  { id: "ORD-2023-001", date: "2023-05-15", customer: "John Smith", items: 2, total: 430000, status: "Delivered" },
  { id: "ORD-2023-002", date: "2023-05-18", customer: "Emily Johnson", items: 3, total: 625000, status: "Processing" },
  { id: "ORD-2023-003", date: "2023-05-20", customer: "Michael Brown", items: 1, total: 250000, status: "Shipped" },
  { id: "ORD-2023-004", date: "2023-05-22", customer: "Sarah Davis", items: 4, total: 820000, status: "Pending" },
];

// Mock data for support tickets
const mockTickets: Ticket[] = [
  { id: "TKT-2023-001", date: "2023-05-16", customer: "John Smith", subject: "Installation Query", status: "Open" },
  { id: "TKT-2023-002", date: "2023-05-18", customer: "Emily Johnson", subject: "Product Warranty", status: "Closed" },
  { id: "TKT-2023-003", date: "2023-05-21", customer: "Michael Brown", subject: "Technical Support", status: "In Progress" },
  { id: "TKT-2023-004", date: "2023-05-23", customer: "Sarah Davis", subject: "Order Issue", status: "Open" },
];

// Mock data for transactions
const mockTransactions: Transaction[] = [
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
  const [categories] = useState<string[]>([
    'Solar Panels',
    'Batteries',
    'Inverters',
    'CCTV Cameras',
    'Solar Generators',
    'All in Ones'
  ]);
  const [initialFormValues, setInitialFormValues] = useState<ProductFormValues | undefined>(undefined);

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

  const handleEditProduct = async (product: Product) => {
    setInitialFormValues(prepareProductForEdit(product));
    setEditingProductId(product.id);
    setIsEditing(true);
    
    // Fetch product images for the selected product
    try {
      const images = await fetchProductImages(product.id);
      setProductImages(images);
    } catch (error) {
      console.error("Error fetching product images:", error);
      setProductImages([]);
    }
    
    setIsSheetOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    const success = await deleteProduct(id);
    
    if (success) {
      toast({
        title: "Product Deleted",
        description: "The product has been removed from your catalog.",
      });
      
      fetchProducts(); // Refresh the product list
    } else {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };
  
  const resetForm = () => {
    setInitialFormValues(undefined);
    setIsEditing(false);
    setEditingProductId(null);
    setProductImages([]);
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tobecatGray-900">Products Management</h2>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white"
              onClick={() => setIsSheetOpen(true)}
            >
              Add New Product
            </Button>
          </SheetTrigger>
        </Sheet>
      </div>
      
      <ProductFormManager
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        isEditing={isEditing}
        editingProductId={editingProductId}
        fetchProducts={fetchProducts}
        resetForm={resetForm}
        productImages={productImages}
        setProductImages={setProductImages}
        initialFormValues={initialFormValues}
        categories={categories}
      />
      
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
            <TicketIcon size={18} />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <Receipt size={18} />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <MessageSquare size={18} />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
            <FileText size={18} />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4 pt-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ProductsTable 
              products={products}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4 pt-2">
          <OrdersTab orders={mockOrders} />
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4 pt-2">
          <TicketsTab tickets={mockTickets} />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4 pt-2">
          <TransactionsTab transactions={mockTransactions} />
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-4 pt-2">
          <ReviewsTab />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 pt-2">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsManager;
