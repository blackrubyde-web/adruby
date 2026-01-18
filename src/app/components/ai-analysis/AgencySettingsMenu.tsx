import { memo, useState } from 'react';
import {
    Settings2,
    Bell,
    Zap,
    BarChart3,
    Brain,
    ChevronRight,
    X,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { AlertsConfigPanel } from './AlertsConfigPanel';
import { AutomatedRulesPanel } from './AutomatedRulesPanel';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { AdaptiveDecisionPanel } from './AdaptiveDecisionPanel';

interface AgencySettingsMenuProps {
    campaigns?: Array<{ id: string; name: string; roas: number; ctr: number; spend: number; revenue: number; conversions: number }>;
}

type SettingsView = 'alerts' | 'rules' | 'summary' | 'decisions' | null;

const MENU_ITEMS = [
    {
        id: 'alerts' as const,
        icon: Bell,
        label: 'Smart Alerts',
        description: 'Benachrichtigungen konfigurieren',
        badge: '2 aktiv',
        color: 'text-orange-400',
    },
    {
        id: 'rules' as const,
        icon: Zap,
        label: 'Automation Rules',
        description: 'IF/THEN Regeln verwalten',
        badge: '3 aktiv',
        color: 'text-violet-400',
    },
    {
        id: 'summary' as const,
        icon: BarChart3,
        label: 'Weekly Summary',
        description: 'KI-generierter Wochenbericht',
        badge: null,
        color: 'text-emerald-400',
    },
    {
        id: 'decisions' as const,
        icon: Brain,
        label: 'AI Decisions',
        description: 'Adaptive Entscheidungs-Engine',
        badge: 'PRO',
        color: 'text-fuchsia-400',
    },
];

export const AgencySettingsMenu = memo(function AgencySettingsMenu({
    campaigns = [],
}: AgencySettingsMenuProps) {
    const [activeView, setActiveView] = useState<SettingsView>(null);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setActiveView(null);
        }
    };

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                        <Settings2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Agency Tools</span>
                        <Badge className="bg-violet-500/20 text-violet-500 border-violet-500/30 text-[10px] px-1.5">
                            PRO
                        </Badge>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-72 bg-card/95 backdrop-blur-xl border-border"
                    sideOffset={8}
                    style={{ zIndex: 9999 }}
                >
                    <DropdownMenuLabel className="text-muted-foreground font-normal">
                        Agency Pro Features
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />

                    {MENU_ITEMS.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className="cursor-pointer p-3 focus:bg-muted"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                                        {item.badge && (
                                            <Badge
                                                className={`text-[9px] px-1 py-0 ${item.badge === 'PRO'
                                                    ? 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                    }`}
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Modal for each settings view */}
            <Dialog open={activeView !== null} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border p-0">
                    <DialogHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                {activeView && (
                                    <>
                                        {activeView === 'alerts' && <Bell className="w-4 h-4 text-orange-400" />}
                                        {activeView === 'rules' && <Zap className="w-4 h-4 text-violet-400" />}
                                        {activeView === 'summary' && <BarChart3 className="w-4 h-4 text-emerald-400" />}
                                        {activeView === 'decisions' && <Brain className="w-4 h-4 text-fuchsia-400" />}
                                        {MENU_ITEMS.find(m => m.id === activeView)?.label}
                                    </>
                                )}
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveView(null)}
                                className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-4">
                        {activeView === 'alerts' && <AlertsConfigPanel />}
                        {activeView === 'rules' && <AutomatedRulesPanel />}
                        {activeView === 'summary' && <WeeklySummaryCard campaigns={campaigns} />}
                        {activeView === 'decisions' && (
                            <AdaptiveDecisionPanel campaigns={campaigns} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
});
