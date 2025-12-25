import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { useNodesState, useEdgesState, addEdge, type Node, type Edge, type Connection, type Viewport } from '@xyflow/react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import {
    type CampaignCanvasNodeData,
    type AIAnalysisResult,
    type DraggableAsset,
    DEFAULT_CAMPAIGN_CONFIG,
    DEFAULT_ADSET_CONFIG,
    DEFAULT_AD_CONFIG,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface HistoryState {
    nodes: Node<CampaignCanvasNodeData>[];
    edges: Edge[];
}

interface DraftData {
    id: string;
    name: string | null;
    created_at: string;
    updated_at: string;
}

interface CampaignCanvasContextValue {
    // Draft management
    draftId: string | null;
    draftName: string;
    setDraftName: (name: string) => void;
    drafts: DraftData[];
    loadDraft: (id: string) => Promise<void>;
    createNewDraft: () => Promise<string>;
    deleteDraft: (id: string) => Promise<void>;

    // Nodes & Edges
    nodes: Node<CampaignCanvasNodeData>[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node<CampaignCanvasNodeData>[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;
    onConnect: (connection: Connection) => void;
    viewport: Viewport;
    setViewport: (vp: Viewport) => void;

    // Selection
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    selectedNode: Node<CampaignCanvasNodeData> | null;
    selectedNodeIds: string[];
    setSelectedNodeIds: (ids: string[]) => void;

    // Node operations
    addCampaignNode: () => string;
    addAdSetNode: (parentId: string) => string;
    addAdNode: (parentId: string, creative?: DraggableAsset) => string;
    updateNodeData: (nodeId: string, data: Partial<CampaignCanvasNodeData>) => void;
    deleteNode: (nodeId: string) => void;
    duplicateNode: (nodeId: string) => string | null;

    // Assets
    availableCreatives: DraggableAsset[];
    setAvailableCreatives: (assets: DraggableAsset[]) => void;
    dropCreativeOnNode: (nodeId: string, creative: DraggableAsset) => void;

    // Undo/Redo
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;

    // AI Analysis
    aiAnalysis: AIAnalysisResult | null;
    isAnalyzing: boolean;
    runAIAnalysis: () => Promise<void>;

    // Persistence
    isDirty: boolean;
    isSaving: boolean;
    isLoading: boolean;
    lastSaved: Date | null;
    saveDraft: () => Promise<void>;
    autoSaveEnabled: boolean;
    setAutoSaveEnabled: (enabled: boolean) => void;

    // Export
    exportToMeta: (pushToMeta?: boolean) => Promise<{ success: boolean; error?: string }>;
    isExporting: boolean;
}

const CampaignCanvasContext = createContext<CampaignCanvasContextValue | null>(null);

// ============================================================================
// HELPERS
// ============================================================================

let nodeIdCounter = 0;
const generateNodeId = (prefix: string) => `${prefix}-${++nodeIdCounter}-${Date.now()}`;

const createInitialNodes = (): Node<CampaignCanvasNodeData>[] => {
    const campaignId = generateNodeId('campaign');
    return [{
        id: campaignId,
        type: 'campaign',
        position: { x: 400, y: 50 },
        data: { type: 'campaign', config: { ...DEFAULT_CAMPAIGN_CONFIG } },
    }];
};

const isValidConnection = (
    nodes: Node<CampaignCanvasNodeData>[],
    source: string,
    target: string
): boolean => {
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return false;

    // Campaign can only connect to AdSet
    if (sourceNode.data.type === 'campaign' && targetNode.data.type === 'adset') return true;
    // AdSet can only connect to Ad
    if (sourceNode.data.type === 'adset' && targetNode.data.type === 'ad') return true;

    return false;
};

// ============================================================================
// PROVIDER
// ============================================================================

export function CampaignCanvasProvider({ children }: { children: ReactNode }) {
    // Draft state
    const [draftId, setDraftId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('Neue Kampagne');
    const [drafts, setDrafts] = useState<DraftData[]>([]);

    // Canvas state
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<CampaignCanvasNodeData>>(createInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });

    // Selection
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    // Assets
    const [availableCreatives, setAvailableCreatives] = useState<DraggableAsset[]>([]);

    // History (Undo/Redo)
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedoRef = useRef(false);

    // AI
    const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Persistence
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Auto-save timer
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ========================================================================
    // HISTORY MANAGEMENT
    // ========================================================================

    const pushHistory = useCallback(() => {
        if (isUndoRedoRef.current) return;

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            // Keep max 50 history items
            if (newHistory.length > 50) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [nodes, edges, historyIndex]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const undo = useCallback(() => {
        if (!canUndo) return;
        isUndoRedoRef.current = true;
        const prevState = history[historyIndex - 1];
        setNodes(prevState.nodes);
        setEdges(prevState.edges);
        setHistoryIndex(prev => prev - 1);
        setIsDirty(true);
        setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    }, [canUndo, history, historyIndex, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (!canRedo) return;
        isUndoRedoRef.current = true;
        const nextState = history[historyIndex + 1];
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
        setHistoryIndex(prev => prev + 1);
        setIsDirty(true);
        setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    }, [canRedo, history, historyIndex, setNodes, setEdges]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // ========================================================================
    // CONNECTION VALIDATION
    // ========================================================================

    const onConnect = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target) return;

        if (!isValidConnection(nodes, connection.source, connection.target)) {
            toast.error('Ungültige Verbindung. Nur Campaign → AdSet → Ad erlaubt.');
            return;
        }

        // Check if target already has a parent
        const existingEdge = edges.find(e => e.target === connection.target);
        if (existingEdge) {
            toast.error('Dieses Element hat bereits eine Verbindung.');
            return;
        }

        pushHistory();
        setEdges((eds) => addEdge({
            ...connection,
            animated: true,
            style: { strokeWidth: 2 }
        } as Edge, eds));
        setIsDirty(true);
    }, [nodes, edges, setEdges, pushHistory]);

    // ========================================================================
    // NODE OPERATIONS
    // ========================================================================

    const selectedNode = useMemo(
        () => nodes.find((n) => n.id === selectedNodeId) || null,
        [nodes, selectedNodeId]
    );

    const addCampaignNode = useCallback(() => {
        pushHistory();
        const id = generateNodeId('campaign');
        const campaignCount = nodes.filter(n => n.data.type === 'campaign').length;
        const newNode: Node<CampaignCanvasNodeData> = {
            id,
            type: 'campaign',
            position: { x: 400 + campaignCount * 350, y: 50 },
            data: {
                type: 'campaign',
                config: { ...DEFAULT_CAMPAIGN_CONFIG, name: `Campaign ${campaignCount + 1}` },
            },
        };
        setNodes((nds) => [...nds, newNode]);
        setIsDirty(true);
        return id;
    }, [nodes, setNodes, pushHistory]);

    const addAdSetNode = useCallback((parentId: string) => {
        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode || parentNode.data.type !== 'campaign') {
            toast.error('AdSets können nur zu Campaigns hinzugefügt werden.');
            return '';
        }

        pushHistory();
        const siblingCount = nodes.filter(n => n.data.type === 'adset' && (n.data as any).parentId === parentId).length;
        const id = generateNodeId('adset');

        const newNode: Node<CampaignCanvasNodeData> = {
            id,
            type: 'adset',
            position: {
                x: parentNode.position.x - 150 + siblingCount * 350,
                y: parentNode.position.y + 180
            },
            data: {
                type: 'adset',
                parentId,
                config: { ...DEFAULT_ADSET_CONFIG, name: `Ad Set ${siblingCount + 1}` },
            },
        };

        const newEdge: Edge = {
            id: `edge-${parentId}-${id}`,
            source: parentId,
            target: id,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
        setIsDirty(true);
        return id;
    }, [nodes, setNodes, setEdges, pushHistory]);

    const addAdNode = useCallback((parentId: string, creative?: DraggableAsset) => {
        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode || parentNode.data.type !== 'adset') {
            toast.error('Ads können nur zu AdSets hinzugefügt werden.');
            return '';
        }

        pushHistory();
        const siblingCount = nodes.filter(n => n.data.type === 'ad' && (n.data as any).parentId === parentId).length;
        const id = generateNodeId('ad');

        const newNode: Node<CampaignCanvasNodeData> = {
            id,
            type: 'ad',
            position: {
                x: parentNode.position.x - 100 + siblingCount * 220,
                y: parentNode.position.y + 180
            },
            data: {
                type: 'ad',
                parentId,
                config: { ...DEFAULT_AD_CONFIG, name: creative?.name || `Ad ${siblingCount + 1}` },
                creative: creative ? {
                    id: creative.id,
                    thumbnail: creative.thumbnail,
                    name: creative.name,
                } : undefined,
            },
        };

        const newEdge: Edge = {
            id: `edge-${parentId}-${id}`,
            source: parentId,
            target: id,
            animated: true,
            style: { stroke: '#22c55e', strokeWidth: 2 },
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
        setIsDirty(true);
        return id;
    }, [nodes, setNodes, setEdges, pushHistory]);

    const updateNodeData = useCallback((nodeId: string, data: Partial<CampaignCanvasNodeData>) => {
        pushHistory();
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } as CampaignCanvasNodeData };
                }
                return node;
            })
        );
        setIsDirty(true);
    }, [setNodes, pushHistory]);

    const deleteNode = useCallback((nodeId: string) => {
        const nodeToDelete = nodes.find((n) => n.id === nodeId);
        if (!nodeToDelete) return;

        pushHistory();
        // Find all descendant nodes
        const nodesToDelete = new Set<string>([nodeId]);
        let changed = true;
        while (changed) {
            changed = false;
            nodes.forEach((n) => {
                if ((n.data as any).parentId && nodesToDelete.has((n.data as any).parentId) && !nodesToDelete.has(n.id)) {
                    nodesToDelete.add(n.id);
                    changed = true;
                }
            });
        }

        setNodes((nds) => nds.filter((n) => !nodesToDelete.has(n.id)));
        setEdges((eds) => eds.filter((e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)));
        setSelectedNodeId(null);
        setIsDirty(true);
    }, [nodes, setNodes, setEdges, pushHistory]);

    const duplicateNode = useCallback((nodeId: string) => {
        const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
        if (!nodeToDuplicate) return null;

        pushHistory();
        const newId = generateNodeId(nodeToDuplicate.data.type);
        const offset = { x: 50, y: 50 };

        // Duplicate node with offset position
        const newNode: Node<CampaignCanvasNodeData> = {
            ...nodeToDuplicate,
            id: newId,
            position: {
                x: nodeToDuplicate.position.x + offset.x,
                y: nodeToDuplicate.position.y + offset.y,
            },
            data: {
                ...nodeToDuplicate.data,
                config: {
                    ...(nodeToDuplicate.data as any).config,
                    name: `${(nodeToDuplicate.data as any).config?.name || 'Copy'} (Copy)`
                }
            } as CampaignCanvasNodeData,
        };

        // If it has a parent, create edge to same parent
        const newEdges: Edge[] = [];
        if ((nodeToDuplicate.data as any).parentId) {
            newEdges.push({
                id: `edge-${(nodeToDuplicate.data as any).parentId}-${newId}`,
                source: (nodeToDuplicate.data as any).parentId,
                target: newId,
                animated: true,
                style: { strokeWidth: 2 },
            });
        }

        setNodes((nds) => [...nds, newNode]);
        if (newEdges.length) setEdges((eds) => [...eds, ...newEdges]);
        setIsDirty(true);
        setSelectedNodeId(newId);

        toast.success('Node dupliziert');
        return newId;
    }, [nodes, setNodes, setEdges, pushHistory]);

    // Drop creative directly onto a node
    const dropCreativeOnNode = useCallback((nodeId: string, creative: DraggableAsset) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        pushHistory();

        if (node.data.type === 'ad') {
            // Update the ad's creative
            updateNodeData(nodeId, {
                ...node.data,
                creative: { id: creative.id, thumbnail: creative.thumbnail, name: creative.name }
            });
            toast.success('Creative hinzugefügt');
        } else if (node.data.type === 'adset') {
            // Create new ad with this creative
            addAdNode(nodeId, creative);
            toast.success('Neue Ad mit Creative erstellt');
        }
    }, [nodes, pushHistory, updateNodeData, addAdNode]);

    // ========================================================================
    // PERSISTENCE
    // ========================================================================

    const loadDrafts = useCallback(async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            if (!session.session?.user?.id) return;

            const { data, error } = await supabase
                .from('campaign_drafts')
                .select('id, name, created_at, updated_at')
                .eq('user_id', session.session.user.id)
                .order('updated_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setDrafts(data);
            }
        } catch (err) {
            console.error('[Canvas] Failed to load drafts:', err);
        }
    }, []);

    const loadDraft = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('campaign_drafts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Draft not found');

            setDraftId(data.id);
            setDraftName(data.name || 'Kampagne');

            if (data.canvas_nodes && Array.isArray(data.canvas_nodes)) {
                setNodes(data.canvas_nodes);
            }
            if (data.canvas_edges && Array.isArray(data.canvas_edges)) {
                setEdges(data.canvas_edges);
            }
            if (data.canvas_viewport) {
                setViewport(data.canvas_viewport);
            }

            setIsDirty(false);
            setHistory([{ nodes: data.canvas_nodes || [], edges: data.canvas_edges || [] }]);
            setHistoryIndex(0);

            toast.success('Draft geladen');
        } catch (err) {
            toast.error('Draft konnte nicht geladen werden');
            console.error('[Canvas] Load draft error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [setNodes, setEdges]);

    const createNewDraft = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            if (!session.session?.user?.id) throw new Error('Not authenticated');

            const initialNodes = createInitialNodes();
            const { data, error } = await supabase
                .from('campaign_drafts')
                .insert({
                    user_id: session.session.user.id,
                    name: 'Neue Kampagne',
                    creative_ids: [],
                    canvas_nodes: initialNodes,
                    canvas_edges: [],
                    canvas_viewport: { x: 0, y: 0, zoom: 1 },
                    status: 'draft',
                })
                .select('id')
                .single();

            if (error) throw error;

            setDraftId(data.id);
            setDraftName('Neue Kampagne');
            setNodes(initialNodes);
            setEdges([]);
            setViewport({ x: 0, y: 0, zoom: 1 });
            setIsDirty(false);
            setHistory([{ nodes: initialNodes, edges: [] }]);
            setHistoryIndex(0);

            await loadDrafts();
            toast.success('Neuer Draft erstellt');
            return data.id;
        } catch (err) {
            toast.error('Draft konnte nicht erstellt werden');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [setNodes, setEdges, loadDrafts]);

    const saveDraft = useCallback(async () => {
        if (!draftId) {
            await createNewDraft();
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('campaign_drafts')
                .update({
                    name: draftName,
                    canvas_nodes: nodes,
                    canvas_edges: edges,
                    canvas_viewport: viewport,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', draftId);

            if (error) throw error;

            setIsDirty(false);
            setLastSaved(new Date());
            await loadDrafts();
        } catch (err) {
            toast.error('Speichern fehlgeschlagen');
            console.error('[Canvas] Save error:', err);
        } finally {
            setIsSaving(false);
        }
    }, [draftId, draftName, nodes, edges, viewport, createNewDraft, loadDrafts]);

    const deleteDraft = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('campaign_drafts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            if (draftId === id) {
                setDraftId(null);
                setNodes(createInitialNodes());
                setEdges([]);
            }

            await loadDrafts();
            toast.success('Draft gelöscht');
        } catch (err) {
            toast.error('Löschen fehlgeschlagen');
        }
    }, [draftId, setNodes, setEdges, loadDrafts]);

    // Auto-save effect
    useEffect(() => {
        if (!autoSaveEnabled || !isDirty || !draftId) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            saveDraft();
        }, 5000); // Auto-save after 5 seconds of inactivity

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, draftId, autoSaveEnabled, saveDraft]);

    // Load drafts on mount
    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    // ========================================================================
    // AI ANALYSIS
    // ========================================================================

    const runAIAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            // Try real API first, fall back to mock
            try {
                const response = await fetch('/.netlify/functions/campaign-canvas-analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ nodes, edges }),
                });

                if (response.ok) {
                    const result = await response.json();
                    setAIAnalysis(result);
                    return;
                }
            } catch {
                // API not available, use mock
            }

            // Mock analysis
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const adSetNodes = nodes.filter((n) => n.data.type === 'adset');
            const adNodes = nodes.filter((n) => n.data.type === 'ad');
            const campaignNodes = nodes.filter((n) => n.data.type === 'campaign');

            const suggestions: AIAnalysisResult['suggestions'] = [];
            const warnings: AIAnalysisResult['warnings'] = [];

            // Check for empty campaigns
            campaignNodes.forEach(campaign => {
                const childAdSets = adSetNodes.filter(as => (as.data as any).parentId === campaign.id);
                if (childAdSets.length === 0) {
                    warnings.push({
                        id: `warning-empty-campaign-${campaign.id}`,
                        severity: 'error',
                        title: 'Leere Campaign',
                        description: `"${(campaign.data as any).config?.name}" hat keine Ad Sets.`,
                        affectedNodes: [campaign.id],
                    });
                }
            });

            // Check for empty ad sets
            adSetNodes.forEach((adset) => {
                const adsInSet = adNodes.filter((ad) => (ad.data as any).parentId === adset.id);
                if (adsInSet.length === 0) {
                    warnings.push({
                        id: `warning-${adset.id}`,
                        severity: 'warning',
                        title: 'Leeres Ad Set',
                        description: `"${(adset.data as any).config?.name}" hat keine Ads.`,
                        affectedNodes: [adset.id],
                    });
                }
            });

            // Check for missing creatives
            adNodes.forEach((ad) => {
                if (!(ad.data as any).creative?.id) {
                    warnings.push({
                        id: `warning-creative-${ad.id}`,
                        severity: 'info',
                        title: 'Fehlendes Creative',
                        description: `"${(ad.data as any).config?.name}" braucht ein Creative.`,
                        affectedNodes: [ad.id],
                    });
                }
            });

            // Audience overlap check (mock)
            if (adSetNodes.length >= 2) {
                const firstTargeting = (adSetNodes[0].data as any).config?.targeting;
                const secondTargeting = (adSetNodes[1].data as any).config?.targeting;
                if (firstTargeting && secondTargeting) {
                    const sameLocations = firstTargeting.locations?.join() === secondTargeting.locations?.join();
                    const sameAge = firstTargeting.ageMin === secondTargeting.ageMin && firstTargeting.ageMax === secondTargeting.ageMax;
                    if (sameLocations && sameAge) {
                        warnings.push({
                            id: 'warning-audience-overlap',
                            severity: 'warning',
                            title: 'Zielgruppen-Überschneidung',
                            description: 'Mehrere Ad Sets haben identische Targeting-Einstellungen. Das kann zu Ineffizienz führen.',
                            affectedNodes: [adSetNodes[0].id, adSetNodes[1].id],
                        });
                    }
                }
            }

            // Suggestions
            if (adSetNodes.length === 1) {
                suggestions.push({
                    id: 'suggest-ab-test',
                    type: 'structure',
                    title: 'A/B Testing empfohlen',
                    description: 'Füge ein weiteres Ad Set mit anderem Targeting hinzu um zu testen was besser funktioniert.',
                    impact: 'high',
                });
            }

            if (adNodes.length > 0 && adNodes.every(ad => !(ad.data as any).config?.headline)) {
                suggestions.push({
                    id: 'suggest-headlines',
                    type: 'creative',
                    title: 'Headlines fehlen',
                    description: 'Füge Headlines zu deinen Ads hinzu für bessere Performance.',
                    impact: 'medium',
                });
            }

            const score = Math.max(0, 100 - warnings.filter(w => w.severity === 'error').length * 25 - warnings.filter(w => w.severity === 'warning').length * 10 - warnings.filter(w => w.severity === 'info').length * 5);

            setAIAnalysis({ score, suggestions, warnings });
            toast.success(`Analyse abgeschlossen: ${score}/100 Punkte`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [nodes, edges]);

    // ========================================================================
    // META EXPORT
    // ========================================================================

    const exportToMeta = useCallback(async (pushToMeta: boolean = false) => {
        setIsExporting(true);
        try {
            const campaignNodes = nodes.filter(n => n.data.type === 'campaign');
            if (campaignNodes.length === 0) {
                toast.error('Keine Campaign gefunden');
                return { success: false, error: 'Keine Campaign gefunden' };
            }

            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            // Build structure for each campaign
            for (const campaign of campaignNodes) {
                const config = (campaign.data as any).config;
                const adSets = nodes
                    .filter(n => n.data.type === 'adset' && (n.data as any).parentId === campaign.id)
                    .map(adset => {
                        const asConfig = (adset.data as any).config;
                        const ads = nodes
                            .filter(n => n.data.type === 'ad' && (n.data as any).parentId === adset.id)
                            .map(ad => ({
                                name: (ad.data as any).config?.name,
                                headline: (ad.data as any).config?.headline,
                                primaryText: (ad.data as any).config?.primaryText,
                                cta: (ad.data as any).config?.cta,
                                destinationUrl: (ad.data as any).config?.destinationUrl,
                                creativeId: (ad.data as any).creative?.id,
                            }));

                        return {
                            name: asConfig?.name,
                            targeting: asConfig?.targeting,
                            optimizationGoal: asConfig?.optimizationGoal,
                            dailyBudget: asConfig?.dailyBudget,
                            ads,
                        };
                    });

                const campaignPayload = {
                    name: config?.name,
                    objective: config?.objective,
                    budgetType: config?.budgetType,
                    dailyBudget: config?.dailyBudget,
                    lifetimeBudget: config?.lifetimeBudget,
                    bidStrategy: config?.bidStrategy,
                };

                if (pushToMeta) {
                    // Real API push to Meta
                    const response = await fetch('/.netlify/functions/meta-create-campaign', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ campaign: campaignPayload, adSets }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Push zu Meta fehlgeschlagen');
                    }

                    toast.success(`🎉 Kampagne "${config?.name}" auf Meta erstellt!`, {
                        description: `${result.adSets?.length || 0} Ad Sets, ${result.ads?.length || 0} Ads erstellt`,
                    });
                } else {
                    // Preview only - use export endpoint
                    const response = await fetch('/.netlify/functions/campaign-canvas-export', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ campaigns: [{ campaign: campaignPayload, ad_sets: adSets }] }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Export fehlgeschlagen');
                    }

                    toast.success('Export-Vorschau erstellt!', {
                        description: 'Kampagne kann jetzt zu Meta gepusht werden.',
                    });
                }
            }

            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Export fehlgeschlagen';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setIsExporting(false);
        }
    }, [nodes]);

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    const value = useMemo<CampaignCanvasContextValue>(() => ({
        // Draft management
        draftId,
        draftName,
        setDraftName,
        drafts,
        loadDraft,
        createNewDraft,
        deleteDraft,

        // Nodes & Edges
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        viewport,
        setViewport,

        // Selection
        selectedNodeId,
        setSelectedNodeId,
        selectedNode,
        selectedNodeIds,
        setSelectedNodeIds,

        // Node operations
        addCampaignNode,
        addAdSetNode,
        addAdNode,
        updateNodeData,
        deleteNode,
        duplicateNode,

        // Assets
        availableCreatives,
        setAvailableCreatives,
        dropCreativeOnNode,

        // Undo/Redo
        canUndo,
        canRedo,
        undo,
        redo,

        // AI
        aiAnalysis,
        isAnalyzing,
        runAIAnalysis,

        // Persistence
        isDirty,
        isSaving,
        isLoading,
        lastSaved,
        saveDraft,
        autoSaveEnabled,
        setAutoSaveEnabled,

        // Export
        exportToMeta,
        isExporting,
    }), [
        draftId, draftName, drafts, loadDraft, createNewDraft, deleteDraft,
        nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect, viewport,
        selectedNodeId, selectedNode, selectedNodeIds,
        addCampaignNode, addAdSetNode, addAdNode, updateNodeData, deleteNode, duplicateNode,
        availableCreatives, dropCreativeOnNode,
        canUndo, canRedo, undo, redo,
        aiAnalysis, isAnalyzing, runAIAnalysis,
        isDirty, isSaving, isLoading, lastSaved, saveDraft, autoSaveEnabled,
        exportToMeta, isExporting,
    ]);

    return (
        <CampaignCanvasContext.Provider value={value}>
            {children}
        </CampaignCanvasContext.Provider>
    );
}

export function useCampaignCanvas() {
    const ctx = useContext(CampaignCanvasContext);
    if (!ctx) {
        throw new Error('useCampaignCanvas must be used within CampaignCanvasProvider');
    }
    return ctx;
}
