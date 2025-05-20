import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Signup = () => {
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Sign Up</h1>
            <p className="text-xl text-tobecatGray-600">Create an account to get started</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-tobecatGray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-tobecatGray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-tobecatGray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-tobecatGray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Email"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-tobecatGray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-tobecatGray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Password"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Sign Up
                </button>
                <a className="inline-block align-baseline font-bold text-sm text-tobecatBlue-600 hover:text-tobecatBlue-800" href="#">
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Signup;
