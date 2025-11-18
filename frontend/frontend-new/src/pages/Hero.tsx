import { useState, useEffect } from "react";
import { FaBookOpen, FaTags, FaClock, FaHeart, FaArrowRight, FaQuoteLeft, FaStar, FaLeaf, FaCoffee, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import Pine from "../assets/pine-transparent.png"


const features = [
  {
    icon: <FaBookOpen className="text-xl" style={{ color: 'rgb(var(--warning))' }} />,
    title: "Organize Your Thoughts",
    description: "Create chapters to structure your ideas, reflections, and stories in a meaningful way.",
    accent: "rgb(var(--warning))",
  },
  {
    icon: <FaTags className="text-xl" style={{ color: 'rgb(var(--accent))' }} />,
    title: "Tag and Categorize",
    description: "Use tags to categorize entries, making it easy to find and revisit your thoughts.",
    accent: "rgb(var(--accent))",
  },
  {
    icon: <FaClock className="text-xl" style={{ color: 'rgb(var(--success))' }} />,
    title: "Track Your Journey",
    description: "See when your entries were last updated to reflect on your growth over time.",
    accent: "rgb(var(--success))",
  },
  {
    icon: <FaHeart className="text-xl" style={{ color: 'rgb(var(--error))' }} />,
    title: "Capture Your Mood",
    description: "Assign moods to your chapters and entries to express your emotions.",
    accent: "rgb(var(--error))",
  },
];

const testimonials = [
  {
    quote: "Pine has become my daily sanctuary. It's where I pour my heart out and find clarity in the chaos.",
    author: "Sarah M.",
    mood: "peaceful",
    icon: <FaLeaf className="text-sm" />,
  },
  {
    quote: "The way Pine organizes my thoughts makes journaling feel like creating art. Every entry tells a story.",
    author: "Marcus R.",
    mood: "inspired",
    icon: <FaStar className="text-sm" />,
  },
  {
    quote: "From morning coffee thoughts to midnight reflections, Pine captures every moment beautifully.",
    author: "Elena K.",
    mood: "contemplative",
    icon: <FaCoffee className="text-sm" />,
  },
];

const Hero = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index:any) => {
    setCurrentTestimonial(index);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--background))' }}>
      {/* Enhanced Navbar */}
     {/* <Navbar/> */}

      {/* Enhanced Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center relative overflow-hidden">
          {/* Decorative background elements - now squircles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-[rgba(var(--accent),0.1)] rounded-2xl blur-xl"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 bg-[rgba(var(--warning),0.1)] rounded-3xl blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[rgba(var(--success),0.1)] rounded-xl blur-xl"></div>

          <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Enhanced Logo/Icon - Using Pine logo with squircle background */}
            <div className="relative inline-block mb-8">
              <div className="absolute -top-3 -left-3 w-24 h-24 bg-[rgba(var(--accent),0.2)] rounded-3xl transform rotate-6 opacity-60 animate-pulse"></div>
              <div className="absolute -top-1 -right-1 w-24 h-24 bg-[rgba(var(--warning),0.2)] rounded-3xl transform -rotate-12 opacity-40"></div>
              <div className="relative  rounded-3xl bg-[rgb(var(--card))] shadow-lg border border-[rgb(var(--border))] backdrop-blur-sm">
                <img src={Pine} alt="Pine Logo" className="w-30 h-30 mx-auto" />
              </div>
            </div>

            {/* Enhanced Heading */}
            <h2 className="text-5xl md:text-6xl font-serif text-[rgb(var(--copy-primary))] font-semibold mb-6 leading-tight">
              Welcome to Your
              <span className="block mt-2 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--warning))] bg-clip-text text-transparent">
                Pine Journal
              </span>
            </h2>

            {/* Enhanced Description */}
            <p className="text-lg md:text-xl text-[rgb(var(--copy-secondary))] max-w-3xl mx-auto mb-8 font-light leading-relaxed">
              A warm, inviting space to capture your thoughts, organize your stories, and cherish your memories with ease. 
              <span className="block mt-2 text-[rgb(var(--copy-muted))] text-base italic">
                Where every word finds its perfect home.
              </span>
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <NavLink
                to="/signup"
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-medium text-[rgb(var(--cta-text))] bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Start Your Journey
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-200" />
              </NavLink>
              
              {/* <NavLink
                to="/demo"
                className="inline-flex items-center gap-3 px-8 py-4 text-base font-medium text-[rgb(var(--copy-primary))] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--card))] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[rgb(var(--border))]"
              >
                <FaBookOpen className="text-sm" />
                View Demo
              </NavLink> */}
            </div>

            {/* Stats Section - squircle cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
              <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-[rgb(var(--accent))] mb-1">10k+</div>
                <div className="text-sm text-[rgb(var(--copy-secondary))]">Stories Written</div>
              </div>
              <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-[rgb(var(--warning))] mb-1">2.5k+</div>
                <div className="text-sm text-[rgb(var(--copy-secondary))]">Happy Writers</div>
              </div>
              <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-[rgb(var(--success))] mb-1">99.9%</div>
                <div className="text-sm text-[rgb(var(--copy-secondary))]">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonial Section with Carousel */}
        <section className="bg-[rgb(var(--card))] border-y border-[rgb(var(--border))] py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--accent),0.05)] to-[rgba(var(--warning),0.05)]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Carousel wrapper */}
              <div className="relative h-64 overflow-hidden rounded-2xl">
                {testimonials.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentTestimonial ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <FaQuoteLeft className="text-3xl text-[rgb(var(--accent))] mb-4 opacity-60" />
                      <blockquote className="text-lg md:text-xl text-[rgb(var(--copy-primary))] font-light italic leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 bg-[rgb(var(--surface))] rounded-xl">
                          {testimonial.icon}
                        </div>
                        <cite className="text-[rgb(var(--copy-secondary))] font-medium not-italic">
                          — {testimonial.author}
                        </cite>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider indicators */}
              <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`w-3 h-3 rounded-lg transition-all duration-300 ${
                      idx === currentTestimonial
                        ? 'bg-[rgb(var(--accent))] w-6'
                        : 'bg-[rgb(var(--copy-muted))] opacity-50 hover:opacity-75'
                    }`}
                    onClick={() => goToTestimonial(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Slider controls */}
              <button
                type="button"
                className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white/70 group-focus:outline-none transition-all duration-200">
                  <FaChevronLeft className="w-4 h-4 text-[rgb(var(--copy-primary))]" />
                </span>
              </button>
              <button
                type="button"
                className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white/70 group-focus:outline-none transition-all duration-200">
                  <FaChevronRight className="w-4 h-4 text-[rgb(var(--copy-primary))]" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-serif text-[rgb(var(--copy-primary))] font-semibold mb-4">
              Why Pine Feels Like Home
            </h3>
            <p className="text-lg text-[rgb(var(--copy-secondary))] max-w-2xl mx-auto">
              Designed with care to make journaling a delightful experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-[rgb(var(--card))] rounded-2xl p-6 border border-[rgb(var(--border))] hover:shadow-lg transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(var(--surface),0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="inline-flex p-3 rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-sm">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-serif text-[rgb(var(--copy-primary))] font-semibold mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
                
                {/* Color accent */}
                <div 
                  className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ backgroundColor: feature.accent }}
                ></div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--warning),0.1)] py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-serif text-[rgb(var(--copy-primary))] font-semibold mb-6">
                Ready to Begin Your Story?
              </h3>
              <p className="text-lg text-[rgb(var(--copy-secondary))] mb-8 leading-relaxed">
                Join thousands of writers who have found their perfect journaling companion. 
                Your thoughts deserve a beautiful home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink
                  to="/signup"
                  className="inline-flex items-center gap-3 px-8 py-4 text-base font-medium text-[rgb(var(--cta-text))] bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FaBookOpen className="text-sm" />
                  Create Your First Chapter
                  <FaArrowRight className="text-sm" />
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-[rgb(var(--card))] border-t border-[rgb(var(--border))] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[rgb(var(--surface))] rounded-2xl shadow-sm border border-[rgb(var(--border))] mb-4">
              <FaHeart className="text-sm" style={{ color: 'rgb(var(--accent))' }} />
              <span className="text-sm text-[rgb(var(--copy-secondary))] font-light">
                Made with love by Pine
              </span>
              <FaHeart className="text-sm" style={{ color: 'rgb(var(--accent))' }} />
            </div>
            <div className="text-xs text-[rgb(var(--copy-muted))]">
              &copy; 2025 Pine Journal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;