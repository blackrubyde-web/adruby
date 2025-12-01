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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Icon name="HeadphonesIcon" size={32} className="text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hilfe & Support Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Benötigen Sie Unterstützung? Unser Team steht Ihnen zur Verfügung. Finden Sie Antworten auf häufige Fragen
              oder kontaktieren Sie uns direkt.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <QuickActionButtons onError={setError} />

        {/* Alert Messages */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button 
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess("")}
              className="text-green-500 hover:text-green-700"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" role="tablist">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab?.id
                      ? 'border-red-500 text-red-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <Icon name="Mail" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">E-Mail Support</h3>
              <p className="text-gray-600 mb-2">
                Schreiben Sie uns eine E-Mail für detaillierte Anfragen
              </p>
              <a 
                href="mailto:support@blackruby.com" 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                support@blackruby.com
              </a>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Icon name="MessageSquare" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-2">
                Chatten Sie direkt mit unserem Support-Team
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setError('Live Chat wird bald verfügbar sein!')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Chat starten
              </Button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Icon name="BookOpen" size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wissensdatenbank</h3>
              <p className="text-gray-600 mb-2">
                Durchsuchen Sie unsere umfangreiche Dokumentation
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('resources')}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                Dokumentation
              </Button>
            </div>

          </div>
        </div>

        {/* Operating Hours */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
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
