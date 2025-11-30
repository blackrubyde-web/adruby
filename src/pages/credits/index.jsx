import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { creditService } from '../../services/creditService';
import { stripeService } from '../../services/stripeService';
import { StripeProvider } from '../../contexts/StripeContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import StripePaymentForm from '../../components/payment/StripePaymentForm';

const CreditsPage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creditStatus, setCreditStatus] = useState(null);
  const [creditPackages, setCreditPackages] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [activeTab, setActiveTab] = useState('packages');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [status, packages, history, payments] = await Promise.all([
          creditService?.getUserCreditStatus(user?.id),
          creditService?.getCreditPackages(),
          creditService?.getCreditHistory(user?.id, 20),
          stripeService?.getPaymentHistory(user?.id, 10)
        ]);

        setCreditStatus(status);
        setCreditPackages(packages);
        setCreditHistory(history);
        setPaymentHistory(payments);
      } catch (error) {
        console.error('Error loading credits data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handlePackageSelect = async (creditPackage) => {
    setSelectedPackage(creditPackage);
    
    try {
      setLoading(true);
      
      // Create order
      const order = await stripeService?.createCreditPurchaseOrder(user?.id, creditPackage?.id);
      
      // Create payment intent
      const customerInfo = {
        firstName: user?.user_metadata?.first_name || user?.email?.split('@')?.[0],
        lastName: user?.user_metadata?.last_name || '',
        email: user?.email,
        billing: {
          address_line_1: 'Muster Straße 1',
          city: 'Berlin',
          state: 'Berlin',
          postal_code: '10115',
          country: 'DE'
        }
      };

      const payment = await stripeService?.createPaymentIntent(order?.orderId, customerInfo);
      
      setPaymentData({
        ...payment,
        packageName: creditPackage?.name,
        credits: creditPackage?.credits
      });
      
      setShowPayment(true);
    } catch (error) {
      console.error('Error preparing payment:', error);
      alert('Fehler beim Vorbereiten der Zahlung. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    try {
      // Payment successful, reload credit status
      const newStatus = await creditService?.getUserCreditStatus(user?.id);
      setCreditStatus(newStatus);
      
      // Refresh histories
      const [newHistory, newPayments] = await Promise.all([
        creditService?.getCreditHistory(user?.id, 20),
        stripeService?.getPaymentHistory(user?.id, 10)
      ]);
      
      setCreditHistory(newHistory);
      setPaymentHistory(newPayments);
      
      setShowPayment(false);
      setSelectedPackage(null);
      setPaymentData(null);
      
      // Dispatch credit update event
      window.dispatchEvent(new Event('credit-updated'));
      
      // Show success message
      alert(`Erfolgreich! ${paymentData?.credits} Credits wurden Ihrem Konto hinzugefügt.`);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    setShowPayment(false);
    setSelectedPackage(null);
    setPaymentData(null);
  };

  const formatActionType = (actionType) => {
    const actionNames = {
      'ad_builder': 'Ad Builder',
      'ai_analysis': 'AI Analysis',
      'ad_strategy': 'Ad Strategy', 
      'full_process': 'Kompletter Ablauf',
      'purchase': 'Credit-Kauf',
      'refund': 'Rückerstattung'
    };
    return actionNames?.[actionType] || actionType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !creditStatus) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <Header onMenuToggle={() => setSidebarOpen(true)} />
          
        <main className="pt-16">
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (showPayment && paymentData) {
    return (
      <StripeProvider>
        <div className="min-h-screen bg-background">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          <Header onMenuToggle={() => setSidebarOpen(true)} />
            
          <main className="pt-16">
            <motion.div 
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
                <div className="max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="flex items-center space-x-4 mb-8">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPayment(false)}
                    >
                      <Icon name="ArrowLeft" size={20} />
                    </Button>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Credit-Zahlung
                      </h1>
                      <p className="text-muted-foreground">
                        {paymentData?.packageName} - {creditService?.formatCredits(paymentData?.credits)} Credits
                      </p>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <StripePaymentForm
                    clientSecret={paymentData?.clientSecret}
                    amount={paymentData?.amount}
                    currency={paymentData?.currency}
                    orderData={{
                      orderId: paymentData?.orderId,
                      orderNumber: paymentData?.orderNumber
                    }}
                    customerInfo={{
                      firstName: user?.user_metadata?.first_name || user?.email?.split('@')?.[0],
                      lastName: user?.user_metadata?.last_name || '',
                      email: user?.email
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    confirmButtonText={`${stripeService?.formatPrice(paymentData?.amount, paymentData?.currency)} bezahlen`}
                  />
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      </StripeProvider>
    );
  }

  const colorClasses = creditStatus ? creditService?.getCreditColorClasses(creditStatus?.credits) : {};

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      
      <main className="pt-16">
        <motion.div 
          className="p-6 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Credits</h1>
                    <p className="text-muted-foreground mt-1">
                      Verwalten Sie Ihre Credits und kaufen Sie neue Pakete
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Credit Status Card */}
              {creditStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className={`
                    rounded-lg border p-6 ${colorClasses?.bg} ${colorClasses?.border}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center
                          ${colorClasses?.bg}
                        `}>
                          <Icon name="Coins" size={32} className={colorClasses?.icon} />
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold ${colorClasses?.text}`}>
                            {creditService?.formatCredits(creditStatus?.credits)} Credits
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Aktuelle Verfügbarkeit
                          </p>
                          {creditStatus?.credits <= 50 && (
                            <p className="text-sm text-red-600 font-medium mt-1">
                              ⚠️ Niedrige Credits - Aufladen empfohlen
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${colorClasses?.text}`}>
                          {creditStatus?.percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          vom Standard-Paket
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tabs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="border-b border-border">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('packages')}
                      className={`
                        py-2 px-1 border-b-2 font-medium text-sm
                        ${activeTab === 'packages' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      Credit-Pakete
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`
                        py-2 px-1 border-b-2 font-medium text-sm
                        ${activeTab === 'history' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      Verlauf
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`
                        py-2 px-1 border-b-2 font-medium text-sm
                        ${activeTab === 'payments' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      Zahlungen
                    </button>
                  </nav>
                </div>
              </motion.div>

              {/* Tab Content */}
              {activeTab === 'packages' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Credit-Pakete kaufen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {creditPackages?.map((pkg, index) => (
                        <motion.div
                          key={pkg?.id}
                          className={`
                            relative rounded-lg border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer
                            ${pkg?.isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                          `}
                          onClick={() => handlePackageSelect(pkg)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          {pkg?.isPopular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                                Beliebt
                              </span>
                            </div>
                          )}
                          
                          <div className="text-center space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">
                                {pkg?.name}
                              </h4>
                              <div className="mt-2">
                                <span className="text-3xl font-bold text-foreground">
                                  {pkg?.priceFormatted}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <Icon name="Coins" size={16} className="text-primary" />
                                <span className="font-medium">
                                  {creditService?.formatCredits(pkg?.credits)} Credits
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {pkg?.pricePerCredit}€ pro Credit
                              </p>
                            </div>

                            <Button 
                              className={`w-full ${pkg?.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                              variant={pkg?.isPopular ? 'default' : 'outline'}
                            >
                              Kaufen
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Usage Information */}
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-4">
                      Credit-Verbrauch pro Aktion
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center space-y-2">
                        <Icon name="Layers" size={24} className="text-primary mx-auto" />
                        <div>
                          <p className="font-medium text-sm">Ad Builder</p>
                          <p className="text-lg font-bold text-primary">8 Credits</p>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <Icon name="Brain" size={24} className="text-primary mx-auto" />
                        <div>
                          <p className="font-medium text-sm">AI Analysis</p>
                          <p className="text-lg font-bold text-primary">6 Credits</p>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <Icon name="Target" size={24} className="text-primary mx-auto" />
                        <div>
                          <p className="font-medium text-sm">Ad Strategy</p>
                          <p className="text-lg font-bold text-primary">6 Credits</p>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <Icon name="Zap" size={24} className="text-primary mx-auto" />
                        <div>
                          <p className="font-medium text-sm">Kompletter Ablauf</p>
                          <p className="text-lg font-bold text-primary">20 Credits</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    Credit-Verlauf
                  </h3>
                  <div className="bg-card border border-border rounded-lg">
                    {creditHistory?.length === 0 ? (
                      <div className="p-8 text-center">
                        <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Noch keine Credit-Transaktionen vorhanden
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {creditHistory?.map((transaction, index) => (
                          <motion.div 
                            key={transaction?.id} 
                            className="p-4 flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${transaction?.creditsUsed > 0 ? 'bg-red-100' : 'bg-green-100'}
                              `}>
                                <Icon 
                                  name={transaction?.creditsUsed > 0 ? "Minus" : "Plus"} 
                                  size={14} 
                                  className={transaction?.creditsUsed > 0 ? 'text-red-600' : 'text-green-600'}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {formatActionType(transaction?.actionType)}
                                </p>
                                {transaction?.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {transaction?.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(transaction?.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction?.creditsUsed > 0 ? 'text-red-600' : 'text-green-600'  
                              }`}>
                                {transaction?.creditsUsed > 0 ? '-' : '+'}
                                {creditService?.formatCredits(Math.abs(transaction?.creditsUsed))}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Saldo: {creditService?.formatCredits(transaction?.creditsAfter)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    Zahlungshistorie
                  </h3>
                  <div className="bg-card border border-border rounded-lg">
                    {paymentHistory?.length === 0 ? (
                      <div className="p-8 text-center">
                        <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Noch keine Zahlungen vorhanden
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {paymentHistory?.map((payment, index) => (
                          <motion.div 
                            key={payment?.id} 
                            className="p-4 flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${payment?.paymentStatus === 'succeeded' ? 'bg-green-100' : 'bg-red-100'}
                              `}>
                                <Icon 
                                  name="CreditCard" 
                                  size={14} 
                                  className={payment?.paymentStatus === 'succeeded' ? 'text-green-600' : 'text-red-600'}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {payment?.packageName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Bestellung #{payment?.orderNumber}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(payment?.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {payment?.amountFormatted}
                              </p>
                              <p className="text-xs text-green-600">
                                +{creditService?.formatCredits(payment?.creditsAmount)} Credits
                              </p>
                              <p className={`text-xs capitalize ${
                                payment?.paymentStatus === 'succeeded' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {payment?.paymentStatus === 'succeeded' ? 'Erfolgreich' : 'Fehlgeschlagen'}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CreditsPage;
