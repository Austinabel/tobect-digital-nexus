
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminTabs from '@/components/admin/AdminTabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Mock admin authentication (in a real app, use proper auth system)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hard-coded check (replace with real auth)
    if (email === 'admin@example.com' && password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          {!isAuthenticated ? (
            <div className={`max-w-md mx-auto transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-tobecatGray-900">
                  Admin Login
                </h1>
                <p className="text-tobecatGray-600 mt-2">
                  Login to manage your website content
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 border border-tobecatBlue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-tobecatAccent-purple rounded-full filter blur-3xl opacity-20"></div>
                
                <div className="relative z-10">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded animate-fade-in">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-tobecatBlue-200 rounded focus:border-tobecatBlue-400 focus:ring-2 focus:ring-tobecatBlue-200 focus:outline-none transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-tobecatBlue-200 rounded focus:border-tobecatBlue-400 focus:ring-2 focus:ring-tobecatBlue-200 focus:outline-none transition-all"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white transition-transform hover:scale-[1.02]"
                    >
                      <Lock size={16} className="mr-2" /> Login
                    </Button>
                  </form>
                  
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    <p>Demo credentials:</p>
                    <p>Email: admin@example.com</p>
                    <p>Password: admin123</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-tobecatGray-900">
                  Admin Dashboard
                </h1>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAuthenticated(false)}
                  className="border-tobecatBlue-300 text-tobecatBlue-600 hover:bg-tobecatBlue-50 transition-transform hover:scale-105"
                >
                  <Unlock size={16} className="mr-2" /> Logout
                </Button>
              </div>
              
              <AdminTabs />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
