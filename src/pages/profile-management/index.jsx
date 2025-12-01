import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabasePublic } from "../../lib/supabaseClient";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import ProfileForm from "./components/ProfileForm";
import PasswordChangeSection from "./components/PasswordChangeSection";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardLayout from "../../layouts/DashboardLayout";

const ProfileManagement = () => {
  const { user, getUserProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company_name: "",
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();

      if (userData) {
        setProfile(userData);
        setFormData({
          full_name: userData?.full_name || "",
          email: userData?.email || "",
          company_name: userData?.company_name || "",
        });
      }
    } catch (err) {
      setError("Fehler beim Laden des Profils: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!formData?.full_name?.trim()) {
        setError("Vollständiger Name ist erforderlich");
        return;
      }

      await updateProfile({
        full_name: formData?.full_name?.trim(),
        company_name: formData?.company_name?.trim() || null,
      });

      setSuccess("Profil erfolgreich aktualisiert!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Fehler beim Speichern: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (currentPassword, newPassword) => {
    try {
      setError("");

      const { error } = await supabasePublic?.auth?.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Passwort erfolgreich geändert!");
      setTimeout(() => setSuccess(""), 3000);

      return { success: true };
    } catch (err) {
      const errorMsg = "Fehler beim Ändern des Passworts: " + err?.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nicht angemeldet</h2>
              <p className="text-muted-foreground">
                Bitte melden Sie sich an, um Ihr Profil zu verwalten.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil & Kontoeinstellungen</h1>
            <p className="text-gray-600">Verwalten Sie Ihre persönlichen Informationen und Kontoeinstellungen</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                <Icon name="X" size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800">{success}</p>
              </div>
              <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700">
                <Icon name="X" size={18} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Icon name="User" size={20} className="mr-2 text-gray-600" />
                    Persönliche Informationen
                  </h2>
                </div>

                <div className="p-6">
                  <ProfileForm formData={formData} onChange={handleInputChange} saving={saving} />

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Speichert...
                        </div>
                      ) : (
                        "Änderungen speichern"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Password Change Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Icon name="Lock" size={20} className="mr-2 text-gray-600" />
                    Passwort ändern
                  </h2>
                </div>

                <div className="p-6">
                  <PasswordChangeSection onPasswordUpdate={handlePasswordUpdate} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontoinformationen</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Konto erstellt</label>
                    <p className="text-gray-900">
                      {profile?.created_at
                        ? new Date(profile?.created_at)?.toLocaleDateString("de-DE")
                        : "Nicht verfügbar"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Benutzerrolle</label>
                    <p className="text-gray-900 capitalize">
                      {profile?.role === "admin"
                        ? "Administrator"
                        : profile?.role === "manager"
                          ? "Manager"
                          : "Mitglied"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Letzte Aktualisierung</label>
                    <p className="text-gray-900">
                      {profile?.updated_at
                        ? new Date(profile?.updated_at)?.toLocaleDateString("de-DE")
                        : "Nicht verfügbar"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Profilvollständigkeit</p>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (formData?.full_name ? 40 : 0) +
                          (formData?.email ? 40 : 0) +
                          (formData?.company_name ? 20 : 0)
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (formData?.full_name ? 40 : 0) +
                        (formData?.email ? 40 : 0) +
                        (formData?.company_name ? 20 : 0)
                    )}
                    % vollständig
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileManagement;
