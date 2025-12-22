import { useEffect, useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Video,
  Mail,
  Send,
  Search,
  ChevronRight,
  ExternalLink,
  FileText,
  Zap,
  Target,
  BarChart3,
  CreditCard,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export function HelpSupportPage() {
  const [activeSection, setActiveSection] = useState<'faq' | 'contact' | 'resources'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { user, profile } = useAuthState();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // FAQ Categories
  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          q: 'How do I create my first campaign?',
          a: 'Click on "Create Campaign" in the top right corner, follow the step-by-step wizard to set up your campaign details, target audience, budget, and ad creative. Once complete, click "Launch Campaign" to start running your ads.',
        },
        {
          q: 'How do I connect my Facebook Ad Account?',
          a: 'Go to Settings > Integrations, click "Connect Facebook Account", and follow the OAuth flow to authorize our platform to access your Facebook Ads data. Make sure you have admin access to your Facebook Ad Account.',
        },
        {
          q: 'What are the minimum requirements to start?',
          a: 'You need a verified Facebook Ad Account, a connected payment method, and at least €50 minimum ad spend budget to launch your first campaign.',
        },
      ],
    },
    {
      id: 'campaigns',
      title: 'Campaign Management',
      icon: <Target className="w-5 h-5" />,
      questions: [
        {
          q: 'How do I pause or stop a campaign?',
          a: 'Go to your Campaigns page, find the campaign you want to pause, click the three-dot menu, and select "Pause Campaign". To stop permanently, select "End Campaign".',
        },
        {
          q: 'Can I edit a running campaign?',
          a: 'Yes, you can edit most campaign settings while it\'s running. However, changing budget or targeting may require ad review. Major changes might restart the learning phase.',
        },
        {
          q: 'How long does it take for a campaign to be approved?',
          a: 'Facebook typically reviews ads within 24 hours. Most ads are approved within a few hours. You\'ll receive a notification once your campaign is approved and running.',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      questions: [
        {
          q: 'How often is data updated?',
          a: 'Campaign data is synced from Facebook every 15 minutes. Real-time metrics like impressions and clicks may have a slight delay. For the most accurate data, wait 24-48 hours after campaign launch.',
        },
        {
          q: 'What does ROAS mean?',
          a: 'ROAS (Return on Ad Spend) measures how much revenue you earn for every dollar spent on advertising. For example, a 5x ROAS means you earn €5 for every €1 spent on ads.',
        },
        {
          q: 'Can I export my campaign data?',
          a: 'Yes! Go to the Campaigns page, select the campaigns you want to export, click "Export", and choose your preferred format (CSV, Excel, or PDF).',
        },
      ],
    },
    {
      id: 'billing',
      title: 'Billing & Pricing',
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and SEPA direct debit for European customers.',
        },
        {
          q: 'When will I be charged?',
          a: 'Your subscription is billed monthly on the date you signed up. Ad spend is charged separately through your Facebook Ad Account as per Facebook\'s billing terms.',
        },
        {
          q: 'Can I change or cancel my plan?',
          a: 'Yes, you can upgrade, downgrade, or cancel your plan at any time from Settings > Billing. Changes take effect at the start of your next billing cycle.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          q: 'How do I enable two-factor authentication?',
          a: 'Go to Settings > Security, click "Enable 2FA", scan the QR code with your authenticator app (Google Authenticator, Authy), and enter the verification code.',
        },
        {
          q: 'I forgot my password, what should I do?',
          a: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. The link expires after 24 hours.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to Settings > Security > Danger Zone, click "Delete Account", and confirm. Note: This action is permanent and cannot be undone. All your data will be deleted within 30 days.',
        },
      ],
    },
  ];

  // Resources
  const resources = [
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: <Video className="w-6 h-6" />,
      color: 'from-red-500/20',
      iconColor: 'text-red-500',
      items: [
        'Getting Started with Facebook Ads',
        'Creating Your First Campaign',
        'Understanding Analytics Dashboard',
        'Advanced Targeting Strategies',
      ],
    },
    {
      title: 'Documentation',
      description: 'Detailed technical docs',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500/20',
      iconColor: 'text-blue-500',
      items: [
        'API Reference',
        'Integration Guide',
        'Best Practices',
        'Troubleshooting',
      ],
    },
    {
      title: 'Knowledge Base',
      description: 'Articles and guides',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-green-500/20',
      iconColor: 'text-green-500',
      items: [
        'Facebook Ads 101',
        'Optimization Tips',
        'Budget Management',
        'A/B Testing Guide',
      ],
    },
  ];

  useEffect(() => {
    if (!profile && !user) return;
    setContactForm((prev) => ({
      ...prev,
      name: prev.name || profile?.full_name || '',
      email: prev.email || profile?.email || user?.email || '',
    }));
  }, [profile, user]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        user_id: user?.id ?? null,
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        status: 'open',
      };
      const { error } = await supabase.from('support_requests').insert(payload);
      if (error) throw error;
      setContactForm({ name: '', email: payload.email, subject: '', message: '' });
      toast.success('Support-Anfrage gesendet');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Senden fehlgeschlagen';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceClick = (label: string) => {
    setActiveSection('faq');
    setSearchQuery(label);
    setExpandedFaq(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero Card - EXACT Dashboard Pattern */}
      <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Help & Support
            </h1>
            <p className="text-muted-foreground">
              Get help with your questions and issues
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for help articles, tutorials, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">245</div>
            <div className="text-sm text-muted-foreground">Help Articles</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">&lt;2h</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Support Available</div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <button
          onClick={() => setActiveSection('faq')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            activeSection === 'faq' 
              ? 'border-primary/50 bg-primary/10' 
              : 'border-border/30 bg-gradient-to-br from-blue-500/10 to-transparent hover:scale-105'
          }`}
        >
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <HelpCircle className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">FAQs</h3>
          <p className="text-sm text-muted-foreground">Find answers to common questions</p>
        </button>

        <button
          onClick={() => setActiveSection('contact')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            activeSection === 'contact'
              ? 'border-primary/50 bg-primary/10'
              : 'border-border/30 bg-gradient-to-br from-green-500/10 to-transparent hover:scale-105'
          }`}
        >
          <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
            <MessageCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Contact Support</h3>
          <p className="text-sm text-muted-foreground">Get help from our support team</p>
        </button>

        <button
          onClick={() => setActiveSection('resources')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            activeSection === 'resources'
              ? 'border-primary/50 bg-primary/10'
              : 'border-border/30 bg-gradient-to-br from-purple-500/10 to-transparent hover:scale-105'
          }`}
        >
          <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Resources</h3>
          <p className="text-sm text-muted-foreground">Tutorials, guides, and documentation</p>
        </button>
      </div>

      {/* Content Area */}
      <div className="backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl">
        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground">Browse common questions by category</p>
            </div>

            <div className="space-y-6">
              {faqCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">{category.icon}</div>
                    <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.questions.map((faq, index) => {
                      const isExpanded = expandedFaq === index;

                      return (
                        <div
                          key={index}
                          className="bg-muted/30 border border-border/30 rounded-xl overflow-hidden hover:bg-muted/50 transition-all"
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : index)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left"
                          >
                            <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-4 text-sm text-muted-foreground border-t border-border/30 pt-4">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Section */}
        {activeSection === 'contact' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Contact Support</h2>
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">We typically respond within 24 hours</p>
                <a
                  href="mailto:support@adruby.ai"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  support@adruby.ai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">Available Mon-Fri, 9am-6pm CET</p>
                <button
                  onClick={() => {
                    window.location.href = 'mailto:support@adruby.ai';
                  }}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Start a conversation
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="What can we help you with?"
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                />
              </div>

              {submitError && (
                <div className="text-sm text-red-500">{submitError}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        )}

        {/* Resources Section */}
        {activeSection === 'resources' && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Learning Resources</h2>
              <p className="text-sm text-muted-foreground">
                Explore our comprehensive guides, tutorials, and documentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {resources.map((resource, i) => (
                <div
                  key={i}
                  className={`p-6 bg-gradient-to-br ${resource.color} to-transparent border border-border/30 rounded-2xl hover:scale-105 transition-all`}
                >
                  <div className={`p-4 bg-background/50 rounded-2xl w-fit mb-4 ${resource.iconColor}`}>
                    {resource.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

                  <div className="space-y-2">
                    {resource.items.map((item, j) => (
                      <button
                        key={j}
                        onClick={() => handleResourceClick(item)}
                        className="w-full text-left px-3 py-2 bg-background/50 hover:bg-background/70 rounded-lg text-sm text-foreground flex items-center justify-between group transition-all"
                      >
                        {item}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Articles */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Popular Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'How to optimize your ad campaigns', views: '2.4K', time: '5 min read' },
                  { title: 'Understanding Facebook Ads targeting', views: '1.8K', time: '8 min read' },
                  { title: 'Budget allocation best practices', views: '1.5K', time: '6 min read' },
                  { title: 'Analyzing campaign performance metrics', views: '1.2K', time: '7 min read' },
                ].map((article, i) => (
                  <button
                    key={i}
                    className="p-4 bg-muted/30 border border-border/30 rounded-xl hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors pr-4">
                        {article.title}
                      </h4>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.views} views</span>
                      <span>•</span>
                      <span>{article.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
