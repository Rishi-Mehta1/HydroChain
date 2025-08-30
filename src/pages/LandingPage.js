import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Leaf, Shield, TrendingUp, Users, ArrowRight, Check, 
  Globe, Zap, Award, BarChart3, Lock, RefreshCw 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Hero animations
    const heroCtx = gsap.context(() => {
      gsap.timeline()
        .from('.hero-title', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        })
        .from('.hero-subtitle', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-buttons > *', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-image', {
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.5');
    }, heroRef);

    // Features animations with ScrollTrigger
    const featuresCtx = gsap.context(() => {
      gsap.from('.feature-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
        }
      });
    }, featuresRef);

    // Stats counter animation
    const statsCtx = gsap.context(() => {
      gsap.from('.stat-item', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
        }
      });

      // Animate numbers
      gsap.utils.toArray('.stat-number').forEach((el) => {
        const endValue = parseInt(el.getAttribute('data-value'));
        gsap.to(el, {
          textContent: endValue,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
          }
        });
      });
    }, statsRef);

    return () => {
      heroCtx.revert();
      featuresCtx.revert();
      statsCtx.revert();
    };
  }, []);

  const features = [
    {
      icon: Leaf,
      title: 'Issue Green Credits',
      description: 'Create and issue blockchain-verified green hydrogen credits with complete transparency.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Shield,
      title: 'Verified & Secure',
      description: 'All credits are cryptographically secured and verified by regulatory authorities.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor your credits, transactions, and compliance in real-time with advanced analytics.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Users,
      title: 'Connect Stakeholders',
      description: 'Seamlessly connect producers, buyers, and regulators in one unified platform.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Globe,
      title: 'Global Marketplace',
      description: 'Access a worldwide marketplace for green hydrogen credits with transparent pricing.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Lock,
      title: 'Prevent Double-Counting',
      description: 'Blockchain technology ensures each credit is unique and prevents duplication.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const stats = [
    { value: 15000, label: 'Credits Issued', suffix: '+' },
    { value: 500, label: 'Active Producers', suffix: '+' },
    { value: 98, label: 'Compliance Rate', suffix: '%' },
    { value: 50, label: 'Countries', suffix: '+' }
  ];

  const roles = [
    {
      title: 'Producers',
      description: 'Issue and manage green hydrogen credits',
      features: ['Issue new credits', 'Track production', 'Submit verification', 'Monitor facilities'],
      icon: Zap
    },
    {
      title: 'Buyers',
      description: 'Purchase and manage credit portfolios',
      features: ['Browse marketplace', 'Purchase credits', 'Track compliance', 'Manage portfolio'],
      icon: BarChart3
    },
    {
      title: 'Regulators',
      description: 'Verify and audit credit transactions',
      features: ['Audit transactions', 'Verify credits', 'Prevent fraud', 'Generate reports'],
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">H2 Credits</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="btn-primary">
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="hero-title text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Issue, Track, and Certify{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Green Hydrogen Credits
                </span>{' '}
                with Blockchain Transparency
              </h1>
              <p className="hero-subtitle mt-6 text-xl text-gray-600 dark:text-gray-300">
                The world's first blockchain-based platform for managing green hydrogen credits. 
                Ensure transparency, prevent double-counting, and accelerate the green energy transition.
              </p>
              <div className="hero-buttons mt-8 flex flex-wrap gap-4">
                <Link to="/dashboard" className="btn-primary inline-flex items-center">
                  Get Started <ArrowRight className="ml-2" size={20} />
                </Link>
                <button className="btn-secondary">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="hero-image relative">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-3xl opacity-30"></div>
                <img
                  src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop"
                  alt="Green Hydrogen"
                  className="relative rounded-3xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="stats-section py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  <span className="stat-number" data-value={stat.value}>0</span>
                  <span>{stat.suffix}</span>
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Features for Every Stakeholder
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Everything you need to manage green hydrogen credits efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="feature-card card hover:shadow-xl transition-shadow"
                >
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Three Powerful Dashboards
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Tailored experiences for every user role
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-600"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Green Hydrogen Business?
            </h2>
            <p className="text-xl mb-8 text-green-50">
              Join thousands of producers, buyers, and regulators already using our platform
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Journey <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold">H2 Credits</span>
          </div>
          <p className="text-gray-400">
            © 2024 H2 Credits. Building a sustainable future with blockchain technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
