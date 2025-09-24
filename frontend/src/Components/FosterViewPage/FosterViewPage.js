import React, { useEffect } from "react";

const FosterPage = () => {

  useEffect(() => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add animation classes on scroll
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.foster-card, .step, .requirement-item').forEach(el => observer.observe(el));
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-gray-100 to-pink-50">

      

      {/* Hero Section */}
      <section className="relative text-white text-center py-24 bg-gradient-to-r from-purple-700 to-pink-400">
        <div className="relative z-10 container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Become a Foster Hero</h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">Open your heart and home to a pet in need. Foster care saves lives and creates beautiful bonds.</p>
          <a href="#apply" className="inline-block bg-white text-purple-700 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-pink-300 hover:text-white transition">To Foster</a>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-16 px-4">

        {/* Why Foster Section */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl text-center text-purple-700 font-bold mb-12 relative inline-block">
            Why Foster a Pet?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '❤️', title: 'Save Lives', desc: 'Every foster home opens up space in shelters, allowing us to rescue more animals in need. You directly contribute to saving precious lives.' },
              { icon: '🏠', title: 'Provide Comfort', desc: 'Give pets a loving, stress-free environment to recover, grow, and prepare for their forever homes. Your care makes all the difference.' },
              { icon: '🌟', title: 'Experience Joy', desc: 'Witness incredible transformations and experience the pure joy of helping an animal heal and thrive. It\'s incredibly rewarding.' },
              { icon: '👨‍👩‍👧‍👦', title: 'Family Benefits', desc: 'Teach your family compassion, responsibility, and the value of helping others. Create lasting memories together.' }
            ].map((card, idx) => (
              <div key={idx} className="foster-card bg-white rounded-2xl shadow-lg p-6 text-center transform transition hover:-translate-y-2 hover:shadow-xl hover:border hover:border-pink-400">
                <div className="foster-card-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full text-3xl text-white bg-gradient-to-br from-purple-700 to-pink-400">{card.icon}</div>
                <h3 className="text-purple-700 text-xl mb-2">{card.title}</h3>
                <p className="text-gray-700">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl text-center text-purple-700 font-bold mb-12">How Foster Care Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 1, title: 'Apply Online', desc: 'Fill out our comprehensive foster application form. Tell us about your living situation, experience, and preferences.' },
              { number: 2, title: 'Home Visit', desc: 'Our team will visit your home to ensure it\'s safe and suitable for fostering. We\'ll answer any questions you have.' },
              { number: 3, title: 'Orientation', desc: 'Attend our foster orientation to learn about pet care, what to expect, and how we support you throughout the process.' },
              { number: 4, title: 'Match & Foster', desc: 'We\'ll match you with a pet that fits your lifestyle and experience level. Welcome your new temporary family member!' }
            ].map((step, idx) => (
              <div key={idx} className="step bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden">
                <div className="step-number w-10 h-10 mx-auto mb-4 flex items-center justify-center rounded-full bg-purple-700 text-white font-bold">{step.number}</div>
                <h3 className="text-purple-700 mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl text-center text-purple-700 font-bold mb-12">Foster Requirements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Age Requirement', desc: 'Must be 21+ years old with stable housing and income to provide a safe environment.' },
              { title: 'Time Commitment', desc: 'Available for daily care, feeding, exercise, and transportation to vet appointments.' },
              { title: 'Pet Experience', desc: 'Previous pet experience preferred, but not required. Willingness to learn is essential.' },
              { title: 'Safe Environment', desc: 'Secure home with appropriate space for the type of pet you wish to foster.' },
              { title: 'Family Agreement', desc: 'All household members must agree to fostering and understand the temporary nature.' },
              { title: 'Financial Readiness', desc: 'While we cover medical costs, you\'ll need to provide food, supplies, and emergency care.' }
            ].map((req, idx) => (
              <div key={idx} className="requirement-item bg-gray-100 rounded-lg p-6 border-l-4 border-purple-700 hover:bg-pink-300 hover:text-white transition transform hover:translate-x-2">
                <h4 className="text-purple-700 mb-2 font-semibold">{req.title}</h4>
                <p>{req.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-gradient-to-br from-purple-700 to-pink-400 text-white text-center py-16 mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Foster Care Impact</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '20', label: 'Pets Fostered This Year' },
              { number: '95%', label: 'Successfully Adopted' },
              { number: '2', label: 'Active Foster Families' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16" id="apply">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-700 mb-6 text-lg">Join our foster family today and help save lives, one pet at a time. Your kindness can transform a life forever.</p>
          <a href="/foster" className="inline-block bg-purple-700 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-pink-400 transition">Start Foster Application</a>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8">
        <div className="container mx-auto">
          <p>&copy; 2024 PetCare. All rights reserved. | Email: foster@petcare.com | Phone: (555) 123-4567</p>
        </div>
      </footer>

    </div>
  );
};

export default FosterPage;
