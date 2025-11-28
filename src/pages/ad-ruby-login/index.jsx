import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

const AdRubyLoginPage = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      navigate('/overview-dashboard');
    } catch (err) {
      setError(err?.message || 'Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
    } catch (err) {
      setError(err?.message || 'Google-Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="pt-16">
          <div className="p-6">
            <div className="max-w-md mx-auto bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Einloggen</h1>
                <p className="text-muted-foreground">
                  Melde dich mit deinem AdRuby-Account an.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="E-Mail"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Passwort"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Wird eingeloggt...' : 'Einloggen'}
                </Button>
              </form>

              <div className="flex items-center space-x-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">oder</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                Mit Google einloggen
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdRubyLoginPage;
