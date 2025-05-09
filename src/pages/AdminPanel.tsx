
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminTabs from '@/components/admin/AdminTabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <div className="pt-24 md:pt-28 pb-16 flex-grow">
        <div className="container mx-auto px-4 md:px-6">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-tobecatGray-900">
                  Admin Login
                </h1>
                <p className="text-tobecatGray-600 mt-2">
                  Login to manage your website content
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
                      className="w-full p-2 border border-gray-300 rounded"
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
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white"
                  >
                    Login
                  </Button>
                </form>
                
                <div className="mt-4 text-sm text-gray-600 text-center">
                  <p>Demo credentials:</p>
                  <p>Email: admin@example.com</p>
                  <p>Password: admin123</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-tobecatGray-900">
                  Admin Dashboard
                </h1>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAuthenticated(false)}
                >
                  Logout
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
