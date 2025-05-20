
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">About Tobecat</h1>
            <p className="text-xl text-tobecatGray-600">Your trusted partner in digital transformation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-tobecatGray-900">Our Story</h2>
              <p className="text-tobecatGray-700 mb-4">
                Founded in 2020, Tobecat began with a simple mission: to provide affordable, high-quality IT solutions to businesses of all sizes. What started as a small team of passionate developers and designers has grown into a full-service digital agency.
              </p>
              <p className="text-tobecatGray-700 mb-4">
                We believe in combining technical expertise with creative thinking to deliver solutions that not only meet but exceed our clients' expectations. Our team's diverse background allows us to approach problems from multiple angles, resulting in innovative solutions that drive real business results.
              </p>
              <p className="text-tobecatGray-700">
                Today, we're proud to serve clients across Nigeria and beyond, helping them navigate the complexities of the digital landscape and achieve their business goals.
              </p>
            </div>
            <div className="bg-tobecatGray-200 h-96 rounded-lg flex items-center justify-center">
              <p className="text-tobecatGray-500 text-lg">Company Image</p>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-tobecatGray-900">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-tobecatBlue-600">Excellence</h3>
                <p className="text-tobecatGray-700">We strive for excellence in everything we do, constantly pushing boundaries and exceeding expectations.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-tobecatBlue-600">Innovation</h3>
                <p className="text-tobecatGray-700">We embrace new technologies and creative approaches to solve complex problems.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-tobecatBlue-600">Integrity</h3>
                <p className="text-tobecatGray-700">We operate with transparency and honesty, building lasting relationships based on trust.</p>
              </div>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-tobecatGray-900">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-32 h-32 bg-tobecatGray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-1 text-tobecatGray-900">Team Member {index}</h3>
                  <p className="text-tobecatBlue-600 mb-3">Position Title</p>
                  <p className="text-tobecatGray-700 text-sm">Short bio description about this team member and their expertise.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default AboutUs;
