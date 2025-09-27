import React, { useEffect } from "react";

export default function PawPal() {
  useEffect(() => {
    const scrollTopBtn = document.getElementById("scrollTop");

    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.remove("opacity-0", "invisible");
        scrollTopBtn.classList.add("opacity-100", "visible");
      } else {
        scrollTopBtn.classList.remove("opacity-100", "visible");
        scrollTopBtn.classList.add("opacity-0", "invisible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".bg-white").forEach((el) => {
      el.classList.add(
        "opacity-0",
        "translate-y-8",
        "transition-all",
        "duration-700"
      );
      observer.observe(el);
    });
  }, []);

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-[#6638E6] via-[#E6738F] to-[#6638E6] flex items-center justify-center relative overflow-hidden">
        <div className="hero-bg absolute inset-0 animate-float"></div>
        <div className="text-center text-white z-10 relative max-w-4xl px-5 animate-fadeInUp">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-5 gradient-text animate-glow">
            🐾 Paw Pal
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            Give a loving home to pets in need. Every pet deserves a second
            chance at happiness and unconditional love!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-10 max-w-2xl mx-auto">
            <div className="text-center animate-slideIn">
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p className="opacity-80">Pets Adopted</p>
            </div>
            <div
              className="text-center animate-slideIn"
              style={{ animationDelay: "200ms" }}
            >
              <h3 className="text-4xl font-bold mb-2">50+</h3>
              <p className="opacity-80">Available Now</p>
            </div>
            <div
              className="text-center animate-slideIn"
              style={{ animationDelay: "400ms" }}
            >
              <h3 className="text-4xl font-bold mb-2">24/7</h3>
              <p className="opacity-80">Support</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
            <a
              href="adoption"
              className="bg-gradient-to-r from-[#E6738F] to-[#6638E6] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              To Adopt 🏠
            </a>
            <a
              href="#info"
              className="bg-white/20 text-white border-2 border-white/30 backdrop-blur px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Learn More 📋
            </a>
          </div>
        </div>
      </section>

      {/* Adoption Info Section */}
      <section id="info" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-5 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-5 gradient-text">
              🏠 Pet Adoption Information
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our adoption process and how to
              give a loving pet their forever home.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-12 text-center">
            <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe every pet deserves a loving home. Our comprehensive
              adoption program ensures the perfect match between pets and
              families, creating lifelong bonds filled with happiness and
              companionship.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🤍 Why Adopt?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Save a life and give a pet a second chance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Gain a loyal, loving companion for life</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Help reduce pet overpopulation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Support animal welfare initiatives</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Experience unconditional love and joy</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Get a pet that's already socialized</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                📋 Adoption Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Must be 18+ years old</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Stable living situation with pet-friendly housing</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Financial capability to provide proper care</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Previous pet experience preferred but not required</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Commitment to the pet's lifetime care</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Valid identification and references</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                💝 What's Included
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Complete vaccination records</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Spay/neuter procedure (if age appropriate)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Microchip identification</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Health certificate from our veterinarian</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>Starter kit with food and essentials</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🐾</span>
                  <span>24/7 post-adoption support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                💰 Adoption Fees
              </h3>
              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 my-5">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🐕</div>
                    <strong className="text-[#E6738F]">Dogs</strong>
                    <br />
                    <span className="text-sm">Rs150 - Rs300</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🐱</div>
                    <strong className="text-[#6638E6]">Cats</strong>
                    <br />
                    <span className="text-sm">Rs75 - Rs200</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🐰</div>
                    <strong className="text-[#E69AAE]">Small Pets</strong>
                    <br />
                    <span className="text-sm">Rs25 - Rs75</span>
                  </div>
                </div>
                <p className="text-sm italic text-gray-600">
                  Fees help cover medical care, vaccinations, spaying/neutering,
                  and facility maintenance.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-5">
              🚀 Our Simple Adoption Process
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {["Browse & Choose", "Application", "Meet & Greet", "Home Check", "Finalize"].map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#E6738F] to-[#6638E6] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 transition-transform duration-300 hover:rotate-12">
                  {i + 1}
                </div>
                <h4 className="text-lg font-bold mb-2">{step}</h4>
                <p className="text-gray-600 text-sm">
                  {[
                    "Browse available pets and find your perfect match",
                    "Complete our adoption application form",
                    "Schedule a visit to meet your chosen pet",
                    "Quick home environment assessment",
                    "Complete paperwork and take your pet home!",
                  ][i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-br from-[#6638E6] via-[#E6738F] to-[#6638E6] text-white relative overflow-hidden">
        <div className="contact-bg absolute inset-0 animate-float"></div>
        <div className="container mx-auto px-5 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-5">📞 Ready to Adopt?</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Contact us today to start your adoption journey! Our friendly team
              is here to help you find your perfect companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: "📞", title: "Phone", info: "(555) 5924724", href: "tel:+15551234737" },
              { icon: "📧", title: "Email", info: "[email protected]", href: "/cdn-cgi/l/email-protection" },
              { icon: "📍", title: "Address", info: "123 PawPal Lane\ Malabe, 12345" },
              { icon: "🕒", title: "Hours", info: "Mon-Sat 9AM-6PM\nSun 10AM-4PM" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/15 backdrop-blur p-6 rounded-2xl text-center border border-white/20 hover:bg-white/25 hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#E6738F] to-[#E69AAE] text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p>
                  {item.href ? (
                    <a href={item.href} className="hover:text-[#E69AAE] transition-colors">
                      {item.info}
                    </a>
                  ) : (
                    item.info.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="tel:+0705924724"
              className="bg-white/20 text-white border-2 border-white/30 backdrop-blur px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 inline-block mb-4"
            >
              Call Us Now 📞
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-gray-400 text-center text-sm">
        &copy; 2024 Paw Pal. All rights reserved.
      </footer>

      {/* Scroll to Top Button */}
      <button
        id="scrollTop"
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[#E6738F] to-[#6638E6] text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-110 opacity-0 invisible z-50"
      >
        ↑
      </button>
    </div>
  );
}
