
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin'
          }
        }
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully! You can now login.",
        });
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 flex-grow bg-gradient-to-b from-tobecatBlue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Button>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-tobecatGray-900">
                Admin Signup
              </h1>
              <p className="text-tobecatGray-600 mt-2">
                Create an admin account
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
                
                <form onSubmit={handleSignup} className="space-y-4">
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
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-tobecatGray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border border-tobecatBlue-200 rounded focus:border-tobecatBlue-400 focus:ring-2 focus:ring-tobecatBlue-200 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 hover:from-tobecatBlue-700 hover:to-tobecatBlue-600 text-white transition-transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    <Lock size={16} className="mr-2" /> {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="mt-4 text-sm text-gray-600 text-center">
                  <p>Already have an account?</p>
                  <button 
                    onClick={() => navigate('/admin')} 
                    className="text-tobecatBlue-600 hover:underline mt-1"
                  >
                    Login Here
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
