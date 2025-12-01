import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import ContactForm from "./components/ContactForm";
import FAQSection from "./components/FAQSection";
import SupportResources from "./components/SupportResources";
import QuickActionButtons from "./components/QuickActionButtons";
import DashboardLayout from "../../layouts/DashboardLayout";

const HelpSupportCenter = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("contact");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const tabs = [
    { id: "contact", name: "Kontakt", icon: "MessageCircle" },
    { id: "faq", name: "Häufige Fragen", icon: "HelpCircle" },
    { id: "resources", name: "Ressourcen", icon: "BookOpen" },
  ];

  const handleContactSubmit = async (formData) => {
    try {
      setError("");

      // Simulate contact form submission
      // In real implementation, this would send to support system
      console.log("Contact form submitted:", formData);

      setSuccess(
        "Ihre Anfrage wurde erfolgreich übermittelt! Unser Support-Team wird sich innerhalb von 24 Stunden bei Ihnen melden."
      );
      setTimeout(() => setSuccess(""), 5000);

      return { success: true };
    } catch (err) {
      const errorMsg = "Fehler beim Senden der Anfrage: " + err?.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Icon name="HeadphonesIcon" size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Hilfe & Support Center</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Benötigen Sie Unterstützung? Unser Team steht Ihnen zur Verfügung. Finden Sie Antworten auf häufige Fragen
              oder kontaktieren Sie uns direkt.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <QuickActionButtons onError={setError} />

        {/* Alert Messages */}
          {error && (
            <div className="mb-8 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-foreground">{error}</p>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-destructive hover:opacity-80"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="CheckCircle" size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-foreground">{success}</p>
              </div>
              <button 
                onClick={() => setSuccess("")}
                className="text-emerald-600 hover:opacity-80"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          )}

        {/* Tab Navigation */}
          <div className="bg-card rounded-xl shadow-minimal border border-border mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6" role="tablist">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'contact' && (
              <ContactForm 
                user={user}
                onSubmit={handleContactSubmit}
                onError={setError}
              />
            )}
            
            {activeTab === 'faq' && <FAQSection />}
            {activeTab === 'resources' && <SupportResources />}
          </div>
        </div>

        {/* Contact Information Footer */}
        <div className="bg-card rounded-xl shadow-minimal border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <Icon name="Mail" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">E-Mail Support</h3>
              <p className="text-muted-foreground mb-2">
                Schreiben Sie uns eine E-Mail für detaillierte Anfragen
              </p>
              <a 
                href="mailto:support@blackruby.com" 
                className="text-primary hover:opacity-80 font-medium"
              >
                support@blackruby.com
              </a>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <Icon name="MessageSquare" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-2">
                Chatten Sie direkt mit unserem Support-Team
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setError('Live Chat wird bald verfügbar sein!')}
                className="text-primary border-primary hover:bg-primary/10"
              >
                Chat starten
              </Button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <Icon name="BookOpen" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Wissensdatenbank</h3>
              <p className="text-muted-foreground mb-2">
                Durchsuchen Sie unsere umfangreiche Dokumentation
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('resources')}
                className="text-primary border-primary hover:bg-primary/10"
              >
                Dokumentation
              </Button>
            </div>

          </div>
        </div>

        {/* Operating Hours */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Icon name="Clock" size={16} className="inline mr-1" />
            Support-Zeiten: Montag bis Freitag, 9:00 - 18:00 Uhr (CET)
          </p>
        </div>

      </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupportCenter;
