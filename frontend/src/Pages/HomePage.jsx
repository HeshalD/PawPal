import React from "react";
import { Link } from "react-router-dom";
import logo from "../Components/Nav/logo.jpg"; // your logo path
import { SponsorsAPI, toImageUrl } from "../services/api";

function HomePage() {
  const [ads, setAds] = React.useState([]);
  const [currentAd, setCurrentAd] = React.useState(0);
  const [loadingAds, setLoadingAds] = React.useState(false);
  const aboutRef = React.useRef(null);
  const servicesRef = React.useRef(null);
  const contactRef = React.useRef(null);

  const handleNavClick = (target) => (e) => {
    e.preventDefault();
    if (target === 'home') {
      window.location.reload();
      return;
    }
    const map = {
      about: aboutRef,
      services: servicesRef,
      contact: contactRef,
    };
    const ref = map[target];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoadingAds(true);
        const { data } = await SponsorsAPI.homepageActiveAds();
        if (isMounted) setAds(data.sponsors || []);
      } catch (_) {
        if (isMounted) setAds([]);
      } finally {
        if (isMounted) setLoadingAds(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  React.useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const t = setInterval(() => {
      setCurrentAd((i) => (i + 1) % ads.length);
    }, 5000);
    return () => clearInterval(t);
  }, [ads]);
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-white">

      {/* Header (Locked) */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <img src={logo} alt="Pawpal Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold text-gray-800">Pawpal</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" onClick={handleNavClick('home')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Home</a>
              <a href="#about" onClick={handleNavClick('about')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">About</a>
              <a href="#services" onClick={handleNavClick('services')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Services</a>
              <a href="#contact" onClick={handleNavClick('contact')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow w-full">
        <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-white py-20 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-100 rounded-full opacity-25 animate-bounce"></div>
          <div className="pointer-events-none select-none absolute bottom-0 left-0 w-40 sm:w-56 md:w-72 lg:w-80 xl:w-96">
            <img src="/hero/left-dog.png" alt="Left banner pet" className="w-full h-auto drop-shadow-2xl" />
          </div>
          <div className="pointer-events-none select-none absolute -bottom-4 -right-2 sm:-right-3 md:-right-12 w-44 sm:w-60 md:w-80 lg:w-[22rem] xl:w-[26rem]">
            <img src="/hero/right-dog.png" alt="Right banner pet" className="w-full h-auto drop-shadow-2xl opacity-90" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center animate-pulse border-8 border-white">
                <img src={logo} alt="Pawpal Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* Hero Text */}
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to Pawpal
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive digital companion for exceptional pet care, management, and wellness solutions
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <button className="px-10 py-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Get Started Today
              </button>
              <button className="px-10 py-4 border-2 border-purple-400 hover:bg-purple-50 text-purple-600 font-bold rounded-xl transition-all duration-300 hover:border-purple-600">
                <Link to="/login">Login</Link>
              </button>
              <button className="px-10 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Link to="/register">Register Now</Link>
              </button>
            </div>
          </div>
        </section>

        {/* About Pet Care Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Comprehensive Pet Care Excellence</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                At Pawpal, we understand that pets are not just animals – they're beloved family members who deserve the highest standard of care, love, and attention throughout their lives.
              </p>
            </div>

            {/* Main Sponsor Ad Banner */}
            {(ads && ads.length > 0) && (
              <div className="mb-16">
                <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl border border-pink-100 bg-white w-full">
                  <div className="relative mx-auto w-[300px] h-[100px] sm:w-[600px] sm:h-[200px] md:w-[900px] md:h-[300px] lg:w-[1200px] lg:h-[400px]">
                    <img
                      src={toImageUrl(ads[currentAd]?.adImagePath)}
                      alt={(ads[currentAd]?.companyName || ads[currentAd]?.sponsorName || "Sponsor Ad") + " banner"}
                      className="w-full h-full object-contain bg-white"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 text-left">
                      <div className="text-white font-semibold text-base">
                        {ads[currentAd]?.companyName || ads[currentAd]?.sponsorName}
                      </div>
                    </div>
                  </div>
                  {ads.length > 1 && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-white">
                      {ads.map((_, i) => (
                        <span
                          key={i}
                          onClick={() => setCurrentAd(i)}
                          className={`h-2.5 w-2.5 rounded-full cursor-pointer ${i === currentAd ? 'bg-pink-600' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {loadingAds && <div className="text-gray-500 mt-2 text-center">Loading ads...</div>}
              </div>
            )}

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl border border-pink-100 hover:shadow-lg transition-shadow">
                  <h3 ref={aboutRef} className="text-2xl font-bold text-gray-800 mb-4">🏥 Advanced Healthcare Management</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our state-of-the-art healthcare management system ensures your pets receive timely medical attention, vaccination tracking, health monitoring, and preventive care. We maintain comprehensive medical records, schedule regular check-ups, and provide emergency care coordination with certified veterinarians.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Smart Pet Profiling</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Create detailed digital profiles for each pet including breed-specific care requirements, dietary preferences, behavioral patterns, exercise needs, and medical history. Our intelligent system provides personalized care recommendations based on your pet's unique characteristics and needs.
                  </p>
                </div>
              </div>

              {/* Right Content */}
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl border border-pink-100 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🤝 Ethical Adoption Services</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We facilitate responsible pet adoption through comprehensive screening processes, matching compatible pets with loving families, and providing ongoing support for successful transitions. Our adoption program ensures every pet finds their perfect forever home.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">💝 Community Support Network</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Join our vibrant community of pet lovers, access donation programs for pets in need, and participate in educational workshops. We believe in building strong support networks that benefit both pets and their human companions.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-3xl shadow-lg border border-gray-100">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Pawpal?</h3>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                  We combine cutting-edge technology with genuine compassion to deliver unparalleled pet care services that prioritize your pet's health, happiness, and overall well-being.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-white">💼</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">Professional Expertise</h4>
                  <p className="text-gray-600">Certified veterinarians and pet care specialists with years of experience in animal healthcare and welfare.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-white">🔒</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">Secure & Reliable</h4>
                  <p className="text-gray-600">Your pet's information is protected with enterprise-level security and backed up across multiple secure servers.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-white">⭐</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">24/7 Support</h4>
                  <p className="text-gray-600">Round-the-clock assistance for emergencies, questions, and guidance from our dedicated support team.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Cards Section */}
        <section ref={servicesRef} className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Core Services</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🐾</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-pink-600 transition-colors">Pet Management</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Comprehensive pet profile management with health tracking, behavioral monitoring, and personalized care recommendations.</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-100 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🏥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">Healthcare Management</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Advanced medical record keeping, vaccination scheduling, and direct veterinarian consultation services.</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-pink-600 transition-colors">Adoption Services</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Ethical pet adoption facilitation with thorough screening and ongoing support for successful placements.</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-100 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">💝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">Donation Platform</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Secure donation management system supporting pets in need and funding critical care programs.</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-200 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🛍️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-pink-600 transition-colors">Pet Shop</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Curated selection of premium pet supplies, food, toys, and accessories with convenient online ordering.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (Locked) */}
      <footer ref={contactRef} className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Pawpal Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-bold">Pawpal</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Dedicated to providing exceptional pet care services and building stronger bonds between pets and their families.
              </p>
              <div className="flex space-x-4">
                <span className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">📧</span>
                <span className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">📱</span>
                <span className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">🌐</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-pink-400">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Adoption</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-purple-400">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p>📧 pawpal@example.com</p>
                <p>📞 +94 123 456 789</p>
                <p>📍 Colombo, Sri Lanka</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
            <p>&copy; 2025 Pawpal. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

