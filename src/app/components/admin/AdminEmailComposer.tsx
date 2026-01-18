import { useState, useEffect, useMemo } from 'react';
import { Send, Eye, Code, Users, Mail, Loader2, CheckCircle2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface User {
    id: string;
    email: string;
    full_name: string | null;
    subscription_status: string | null;
    trial_status: string | null;
    payment_verified: boolean;
}

type UserFilter = 'all' | 'trial' | 'paid' | 'churned' | 'test';

const USER_FILTERS: { key: UserFilter; label: string; description: string }[] = [
    { key: 'all', label: 'Alle User', description: 'Sendet an alle registrierten User' },
    { key: 'trial', label: 'Trial User', description: 'User in der Testphase' },
    { key: 'paid', label: 'Zahlende Kunden', description: 'Aktive Abonnenten' },
    { key: 'churned', label: 'Abgemeldete', description: 'Ehemalige Kunden' },
    { key: 'test', label: 'Test (Nur ich)', description: 'Nur an deine Email senden' },
];

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: Arial, sans-serif; background: #0f0f0f;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background: #1a1a1a; border-radius: 16px; padding: 40px;">
          <tr>
            <td style="text-align: center;">
              <h1 style="color: #fff; margin: 0 0 20px;">Hallo {{name}}!</h1>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Hier ist deine Nachricht...
              </p>
              <a href="https://adruby.ai/dashboard" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Zum Dashboard →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function AdminEmailComposer() {
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState(DEFAULT_TEMPLATE);
    const [showPreview, setShowPreview] = useState(true);
    const [userFilter, setUserFilter] = useState<UserFilter>('test');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
    const [adminEmail, setAdminEmail] = useState<string>('');

    // Load admin email
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) {
                setAdminEmail(data.user.email);
            }
        });
    }, []);

    // Load users based on filter
    const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
            let query = supabase
                .from('user_profiles')
                .select('id, email, full_name, subscription_status, trial_status, payment_verified');

            switch (userFilter) {
                case 'trial':
                    query = query.eq('trial_status', 'active').eq('payment_verified', true);
                    break;
                case 'paid':
                    query = query.eq('subscription_status', 'active');
                    break;
                case 'churned':
                    query = query.or('subscription_status.eq.cancelled,subscription_status.eq.expired');
                    break;
                case 'test':
                    // Will just use admin email
                    setUsers([]);
                    setIsLoadingUsers(false);
                    return;
            }

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to load users:', err);
            toast.error('Fehler beim Laden der User');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (userFilter !== 'test') {
            loadUsers();
        } else {
            setUsers([]);
        }
    }, [userFilter]);

    const recipientCount = useMemo(() => {
        if (userFilter === 'test') return 1;
        return users.length;
    }, [userFilter, users]);

    const recipientEmails = useMemo(() => {
        if (userFilter === 'test') return [adminEmail];
        return users.map(u => u.email).filter(Boolean);
    }, [userFilter, users, adminEmail]);

    const handleSend = async () => {
        if (!subject.trim()) {
            toast.error('Bitte Betreff eingeben');
            return;
        }
        if (!htmlContent.trim()) {
            toast.error('Bitte HTML-Inhalt eingeben');
            return;
        }
        if (recipientEmails.length === 0) {
            toast.error('Keine Empfänger ausgewählt');
            return;
        }

        setIsSending(true);
        setSendResult(null);

        try {
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'custom',
                    subject,
                    html: htmlContent,
                    recipients: recipientEmails,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const sent = data.sent || (data.results?.filter((r: { success: boolean }) => r.success).length ?? 1);
                const failed = (data.results?.filter((r: { success: boolean }) => !r.success).length) ?? 0;
                setSendResult({ sent, failed });
                toast.success(`${sent} Email(s) erfolgreich gesendet!`);
            } else {
                toast.error(data.error || 'Fehler beim Senden');
            }
        } catch (err) {
            console.error('Send failed:', err);
            toast.error('Netzwerkfehler beim Senden');
        } finally {
            setIsSending(false);
        }
    };

    const previewHtml = useMemo(() => {
        return htmlContent.replace(/\{\{name\}\}/g, 'Max Mustermann');
    }, [htmlContent]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6 text-primary" />
                        Email Composer
                    </h2>
                    <p className="text-sm text-muted-foreground">Sende Emails an deine User</p>
                </div>
                {sendResult && (
                    <Badge className={cn(
                        "text-sm py-1 px-3",
                        sendResult.failed === 0
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                    )}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {sendResult.sent} gesendet {sendResult.failed > 0 && `• ${sendResult.failed} fehlgeschlagen`}
                    </Badge>
                )}
            </div>

            {/* Recipient Selection */}
            <Card className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Empfänger auswählen</span>
                    <Badge variant="secondary">{recipientCount} User</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {USER_FILTERS.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setUserFilter(filter.key)}
                            className={cn(
                                "p-3 rounded-xl border text-left transition-all",
                                userFilter === filter.key
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="font-semibold text-sm">{filter.label}</div>
                            <div className="text-xs text-muted-foreground">{filter.description}</div>
                        </button>
                    ))}
                </div>
                {userFilter !== 'test' && (
                    <div className="mt-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={loadUsers} disabled={isLoadingUsers}>
                            <RefreshCw className={cn("w-4 h-4 mr-1", isLoadingUsers && "animate-spin")} />
                            Aktualisieren
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {isLoadingUsers ? 'Lade User...' : `${users.length} User gefunden`}
                        </span>
                    </div>
                )}
            </Card>

            {/* Subject */}
            <Card className="p-4">
                <label className="block text-sm font-semibold mb-2">Betreff</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="z.B. Wichtige Neuigkeiten von AdRuby 🚀"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-base"
                />
            </Card>

            {/* HTML Editor + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">HTML Code</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHtmlContent(DEFAULT_TEMPLATE)}
                        >
                            Template zurücksetzen
                        </Button>
                    </div>
                    <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-[400px] p-4 rounded-xl border border-border bg-background font-mono text-sm resize-none"
                        placeholder="HTML Code hier eingeben..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Verwende <code className="bg-muted px-1 rounded">{`{{name}}`}</code> für den Usernamen
                    </p>
                </Card>

                {/* Preview */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Vorschau</span>
                    </div>
                    <div className="w-full h-[400px] rounded-xl border border-border overflow-auto bg-white">
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-full border-0"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </Card>
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="text-sm text-muted-foreground">
                    <strong>{recipientCount}</strong> Empfänger • <strong>{userFilter === 'test' ? adminEmail : USER_FILTERS.find(f => f.key === userFilter)?.label}</strong>
                </div>
                <Button
                    onClick={handleSend}
                    disabled={isSending || !subject || !htmlContent || recipientCount === 0}
                    className="gap-2 bg-gradient-to-r from-primary to-rose-600 min-w-[200px]"
                    size="lg"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sende...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {recipientCount} Email{recipientCount !== 1 ? 's' : ''} senden
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
