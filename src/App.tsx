
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Products from './pages/Products';
import Blog from './pages/Blog';
import Testimonials from './pages/Testimonials';
import Portfolio from './pages/Portfolio';
import Careers from './pages/Careers';
import AdminPanel from './pages/AdminPanel';
import Signup from './pages/Signup';
import GetQuote from './pages/GetQuote';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import { Toaster } from './components/ui/toaster';
import { ProductProvider } from './context/ProductContext';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <ProductProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/quote" element={<GetQuote />} />
          <Route path="/get-quote" element={<GetQuote />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
        <Toaster />
      </Router>
    </ProductProvider>
  );
}

export default App;
