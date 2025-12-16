import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { creditService } from "../../services/creditService";
import { stripeService } from "../../services/stripeService";
import { StripeProvider } from "../../contexts/StripeContext";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import StripePaymentForm from "../../components/payment/StripePaymentForm";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageShell from "../../components/ui/PageShell";
import { UI, cxCard } from "../../components/ui/uiPrimitives";
import { fmtCompact } from "../../utils/format";

const CreditsPage = () => {
  const { user } = useAuth();
  const [creditStatus, setCreditStatus] = useState(null);
  const [creditPackages, setCreditPackages] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [activeTab, setActiveTab] = useState("packages");

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
        console.error("Fehler beim Laden der Credits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    try {
      await creditService?.purchaseCredits(user?.id, selectedPackage);
      setShowPayment(true);
      setPaymentData(selectedPackage);
    } catch (error) {
      console.error("Fehler beim Kauf:", error);
    }
  };

  const handleRefresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const status = await creditService?.getUserCreditStatus(user?.id);
      setCreditStatus(status);
    } catch (error) {
      console.error("Fehler beim Refresh:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon }) => (
    <div className={`${UI.card} ${UI.cardHover} p-4 flex items-center justify-between`}>
      <div>
        <p className={UI.meta}>{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
      </div>
      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-foreground">{icon}</div>
    </div>
  );

  const HistoryList = ({ title, items, icon }) => (
    <div className={UI.card}>
      <div className={`${UI.cardHeader} px-4 py-3`}>
        <h3 className={UI.h2}>{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {items?.length ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-foreground">
                  <Icon name={item.icon || icon || "Coins"} size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <p className="font-semibold text-foreground">{item.amount}</p>
            </div>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">Keine Einträge vorhanden.</p>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <StripeProvider>
        <PageShell
          title="Credits"
          subtitle="Verwalte dein Guthaben, Käufe und Historie."
          rightActions={
            <div className="flex items-center gap-2">
              <Button onClick={handlePurchase} disabled={!selectedPackage && !creditPackages?.length}>
                Credits kaufen
              </Button>
              <Button variant="quiet" onClick={handleRefresh} iconName="RefreshCw" />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Verfügbare Credits"
              value={creditStatus ? creditService.formatCredits(creditStatus?.credits) : "--"}
              icon={<Icon name="Coins" size={18} />}
            />
            <StatCard
              label="Genutzte Credits"
              value={creditStatus ? fmtCompact(creditStatus?.total_used || 0) : "--"}
              icon={<Icon name="Activity" size={18} />}
            />
            <StatCard
              label="Letzte Zahlung"
              value={
                paymentHistory?.[0]?.amount
                  ? `${paymentHistory[0].amount} ${paymentHistory[0].currency || "EUR"}`
                  : "--"
              }
              icon={<Icon name="CreditCard" size={18} />}
            />
          </div>

          <div className={cxCard}>
            <div className="flex items-center border-b border-border">
              {["packages", "history"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "packages" ? "Pakete" : "Verlauf"}
                </button>
              ))}
            </div>

            {activeTab === "packages" && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {creditPackages?.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setPaymentData(pkg);
                      setShowPayment(true);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedPackage?.id === pkg.id ? "border-primary bg-primary/10" : "border-border bg-card/80 hover:bg-accent/30"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">
                      {pkg.price} {pkg.currency || "EUR"}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div className="p-4 space-y-6">
                <HistoryList
                  title="Kredithistorie"
                  items={creditHistory?.map((item) => ({
                    title: item.type,
                    date: item.created_at,
                    amount: item.amount,
                    icon: "Activity"
                  }))}
                />
                <HistoryList
                  title="Zahlungsverlauf"
                  icon="CreditCard"
                  items={paymentHistory?.map((item) => ({
                    title: item.description || "Zahlung",
                    date: item.created_at,
                    amount: `${item.amount} ${item.currency || "EUR"}`
                  }))}
                />
              </div>
            )}
          </div>

          {showPayment && (
            <div className={`${cxCard} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Checkout</p>
                  <p className="text-xs text-muted-foreground">{selectedPackage?.name}</p>
                </div>
                <Button variant="ghost" iconName="X" onClick={() => setShowPayment(false)} />
              </div>
              <div className="mt-4">
                <StripePaymentForm price={paymentData?.price} credits={paymentData?.credits} currency={paymentData?.currency} />
              </div>
            </div>
          )}
        </PageShell>
      </StripeProvider>
    </DashboardLayout>
  );
};

export default CreditsPage;
