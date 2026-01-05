"use client";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group, Transformer, Line } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import type { AdDocument, StudioLayer, ImageLayer, TextLayer, CtaLayer, ShapeLayer, GroupLayer } from '../../types/studio';
import { getSnapLines, SnapGuide } from '../../lib/snapping';

export interface CanvasStageHandle {
    exportToDataURL: (format?: 'png' | 'jpeg', quality?: number) => string | undefined;
}

interface CanvasStageProps {
    doc: AdDocument;
    scale: number;
    viewPos?: { x: number; y: number };
    selectedLayerIds: string[];
    isHandMode?: boolean;
    preview?: boolean;
    onLayerSelect?: (id: string | undefined, multi: boolean) => void;
    onLayerUpdate?: (id: string, updates: Partial<StudioLayer>) => void;
    onViewChange?: (pos: { x: number; y: number }) => void;
    onMultiLayerSelect?: (ids: string[]) => void;
}



// --- Sub-Components for Layers ---

const URLImage = ({ layer }: { layer: ImageLayer }) => {
    const [image] = useImage(layer.src, 'anonymous');

    const clipFunc = layer.clipShape === 'circle' ? (ctx: Konva.Context) => {
        ctx.arc(layer.width / 2, layer.height / 2, Math.min(layer.width, layer.height) / 2, 0, Math.PI * 2, false);
    } : undefined;

    return (
        <Group clipFunc={clipFunc}>
            <KonvaImage
                image={image}
                x={0}
                y={0}
                width={layer.width}
                height={layer.height}
                opacity={layer.opacity}
                shadowColor={layer.shadowColor}
                shadowBlur={layer.shadowBlur}
                shadowOffsetX={layer.shadowOffsetX}
                shadowOffsetY={layer.shadowOffsetY}
                shadowOpacity={layer.shadowOpacity}
                cornerRadius={layer.clipShape === 'rounded' ? (layer.maskRadius || 32) : 0}
                crop={layer.crop}
            />
            {layer.tint && (
                <Rect
                    x={0}
                    y={0}
                    width={layer.width}
                    height={layer.height}
                    fill={layer.tint}
                    opacity={0.3}
                    listening={false}
                    globalCompositeOperation="source-atop"
                    cornerRadius={layer.clipShape === 'rounded' ? (layer.maskRadius || 32) : 0}
                />
            )}
        </Group>
    );
};

const TextItem = ({ layer }: { layer: TextLayer }) => {
    return (
        <Text
            text={layer.text}
            x={0}
            y={0}
            width={layer.width}
            height={layer.height}
            fontSize={layer.fontSize}
            fontStyle={`${(typeof layer.fontWeight === 'number' && Number(layer.fontWeight) >= 700) || layer.fontWeight === 'bold' ? 'bold' : 'normal'} ${layer.fontStyle || ''}`.trim()}
            fill={layer.fill || layer.color || '#000000'}
            align={layer.textAlign || layer.align || 'left'}
            verticalAlign="top"
            opacity={layer.opacity}
            lineHeight={layer.lineHeight}
            letterSpacing={layer.letterSpacing}
            shadowColor={layer.shadowColor}
            shadowBlur={layer.shadowBlur}
            shadowOffsetX={layer.shadowOffsetX}
            shadowOffsetY={layer.shadowOffsetY}
            wrap="word"
            ellipsis={true}
        />
    );
};

const CtaItem = ({ layer }: { layer: CtaLayer }) => {
    const { width, height, opacity, bgColor, bgGradient, radius, text, fontSize, fontFamily, fontWeight, fontStyle, color, letterSpacing, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, borderColor, borderWidth } = layer;

    // Calculate gradient points based on angle (default: top-to-bottom = 180deg)
    const getGradientPoints = (angle: number = 180) => {
        const radians = (angle - 90) * (Math.PI / 180);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return {
            start: { x: width / 2 - (cos * width) / 2, y: height / 2 - (sin * height) / 2 },
            end: { x: width / 2 + (cos * width) / 2, y: height / 2 + (sin * height) / 2 }
        };
    };

    const gradientPoints = bgGradient ? getGradientPoints(bgGradient.angle) : null;

    return (
        <Group
            x={0} y={0}
            width={width}
            height={height}
            opacity={opacity}
        >
            <Rect
                width={width}
                height={height}
                fill={bgGradient ? undefined : bgColor}
                // Gradient support
                fillLinearGradientStartPoint={gradientPoints ? gradientPoints.start : undefined}
                fillLinearGradientEndPoint={gradientPoints ? gradientPoints.end : undefined}
                fillLinearGradientColorStops={bgGradient ? [0, bgGradient.start, 1, bgGradient.end] : undefined}
                cornerRadius={radius}
                shadowColor={shadowColor || "rgba(0, 0, 0, 0.3)"}
                shadowBlur={shadowBlur || 10}
                shadowOpacity={0.3}
                shadowOffsetX={shadowOffsetX || 0}
                shadowOffsetY={shadowOffsetY || 5}
                // Border support
                stroke={borderColor}
                strokeWidth={borderWidth}
            />
            <Text
                text={text}
                width={width}
                height={height}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontStyle={`${Number(fontWeight) >= 700 ? 'bold' : 'normal'} ${fontStyle || ''}`.trim()}
                fill={color}
                align="center"
                verticalAlign="middle"
                letterSpacing={letterSpacing || 0}
            />
        </Group>
    );
};

const ShapeItem = ({ layer }: { layer: ShapeLayer }) => {
    return (
        <Rect
            x={0}
            y={0}
            width={layer.width}
            height={layer.height}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            cornerRadius={layer.cornerRadius}
            opacity={layer.opacity}
            shadowColor={layer.shadowColor}
            shadowBlur={layer.shadowBlur}
            shadowOffsetX={layer.shadowOffsetX}
            shadowOffsetY={layer.shadowOffsetY}
        />
    );
};

// Recursive Layer Node
const LayerNode = ({
    layer,
    isHandMode,
    onLayerSelect,
    onLayerUpdate,
    onDragMove
}: {
    layer: StudioLayer;
    isHandMode?: boolean;
    onLayerSelect?: (id: string | undefined, multi: boolean) => void;
    onLayerUpdate?: (id: string, updates: Partial<StudioLayer>) => void;
    onDragMove?: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}) => {
    return (
        <Group
            key={layer.id}
            name={layer.id}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            rotation={layer.rotation}
            draggable={!layer.locked && !isHandMode}
            onDragMove={(e) => {
                onDragMove?.(layer.id, e);
            }}
            onClick={(e) => {
                e.cancelBubble = true;
                const evt = e.evt as unknown as MouseEvent;
                onLayerSelect?.(layer.id, evt.shiftKey || evt.metaKey || evt.ctrlKey);
            }}
            onTap={(e) => {
                e.cancelBubble = true;
                const evt = e.evt as unknown as MouseEvent;
                onLayerSelect?.(layer.id, evt.shiftKey || evt.metaKey || evt.ctrlKey);
            }}
            onDragEnd={(e) => {
                onLayerUpdate?.(layer.id, {
                    x: e.target.x(),
                    y: e.target.y()
                });
            }}


            onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);

                if (layer.type === 'group') {
                    const groupLayer = layer as GroupLayer;
                    const newChildren = groupLayer.children.map(child => ({
                        ...child,
                        x: child.x * scaleX,
                        y: child.y * scaleY,
                        width: child.width * scaleX,
                        height: child.height * scaleY,
                        fontSize: (child.type === 'text' || child.type === 'cta') ? (child as TextLayer | CtaLayer).fontSize * Math.max(scaleX, scaleY) : undefined
                    }));

                    onLayerUpdate?.(layer.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: node.width() * scaleX,
                        height: node.height() * scaleY,
                        children: newChildren as GroupLayer['children']
                    });
                } else {
                    onLayerUpdate?.(layer.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY)
                    });
                }
            }}
        >
            {
                layer.type === 'text' ? (
                    <TextItem layer={layer as TextLayer} />
                ) : layer.type === 'cta' ? (
                    <CtaItem layer={layer as CtaLayer} />
                ) : layer.type === 'shape' ? (
                    <ShapeItem layer={layer} />
                ) : layer.type === 'group' ? (
                    (layer as GroupLayer).children.map(child => (
                        <LayerNode
                            key={child.id}
                            layer={child}
                            isHandMode={isHandMode}
                            onLayerSelect={onLayerSelect}
                            onLayerUpdate={onLayerUpdate}
                            onDragMove={onDragMove}
                        />
                    ))
                ) : (layer.type === 'background' || layer.type === 'product' || layer.type === 'overlay' || layer.type === 'logo' || layer.type === 'image') ? (
                    <URLImage layer={layer as ImageLayer} />
                ) : null
            }
        </Group >
    );
};

// --- Main Canvas Stage Component ---

export const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(function CanvasStage(
    { doc, scale, viewPos = { x: 0, y: 0 }, selectedLayerIds, isHandMode, preview, onLayerSelect, onMultiLayerSelect, onLayerUpdate, onViewChange },
    ref
) {
    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const selectionStartRef = useRef<{ x: number, y: number } | null>(null);
    const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

    // Expose handle to parent
    useImperativeHandle(ref, () => ({
        exportToDataURL: (format = 'png', quality = 1) => {
            if (!stageRef.current) return undefined;

            // Hide transformer and UI layers temporarily, but keep all content layers visible
            const transformerNode = stageRef.current.findOne('Transformer');
            const wasTransformerVisible = transformerNode?.visible();
            if (transformerNode) transformerNode.visible(false);

            // Hide only UI layers (guides, selection box, safe area)
            // Content layer (index 0) should remain visible
            const layers = stageRef.current.getLayers();
            const uiLayers = layers.slice(1); // Everything except content layer
            const wasVisible = uiLayers.map(l => l.visible());
            uiLayers.forEach(l => l.visible(false));

            const dataUrl = stageRef.current.toDataURL({
                pixelRatio: 2,
                mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
                quality: quality
            });

            // Restore visibility
            uiLayers.forEach((l, i) => l.visible(wasVisible[i]));
            if (transformerNode && wasTransformerVisible) transformerNode.visible(true);

            return dataUrl;
        }
    }));

    const handleLayerDragMove = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
        setSnapGuides([]);
        const node = e.target;
        // Current position from drag
        const newPos = { x: node.x(), y: node.y() };

        // Find layer object
        const layer = doc.layers.find(l => l.id === id);
        if (!layer) return;

        // Current layer with proposed changes
        const currentLayer: StudioLayer = { ...layer, x: newPos.x, y: newPos.y };

        // Other layers
        const otherLayers = doc.layers.filter(l => l.id !== id);

        const result = getSnapLines(currentLayer, otherLayers, doc.width, doc.height);

        // Apply snap
        if (result.x !== newPos.x || result.y !== newPos.y) {
            node.x(result.x);
            node.y(result.y);
        }

        setSnapGuides(result.guides);
    };

    const handleDragEnd = () => {
        setSnapGuides([]);
    };

    const sortedLayers = [...doc.layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

    // Expose export method via ref


    useEffect(() => {
        if (!trRef.current || isHandMode || preview) return;
        const transformer = trRef.current;
        const stage = transformer.getStage();
        if (!stage) return;

        const findLayer = (layers: StudioLayer[], id: string): StudioLayer | undefined => {
            for (const layer of layers) {
                if (layer.id === id) return layer;
                if (layer.type === 'group') {
                    const found = findLayer((layer as GroupLayer).children, id);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const nodes: Konva.Node[] = [];
        selectedLayerIds.forEach(id => {
            const layer = findLayer(doc.layers, id);
            if (layer && !layer.locked) {
                const node = stage.findOne('.' + id);
                if (node) nodes.push(node);
            }
        });

        transformer.nodes(nodes);
        const transformerLayer = transformer.getLayer();
        if (transformerLayer) transformerLayer.batchDraw();

    }, [selectedLayerIds, sortedLayers, isHandMode, preview, doc.layers]);

    if (preview) {
        return (
            <div style={{ width: doc.width * scale, height: doc.height * scale }}>
                <Stage
                    ref={stageRef}
                    width={doc.width * scale}
                    height={doc.height * scale}
                    scaleX={scale}
                    scaleY={scale}
                    listening={false}
                >
                    <Layer>
                        <Rect width={doc.width} height={doc.height} fill={doc.backgroundColor} />
                    </Layer>
                    <Layer>
                        {sortedLayers.map((layer) => {
                            if (!layer.visible) return null;
                            return (
                                <Group
                                    key={layer.id}
                                    name={layer.id}
                                    x={layer.x}
                                    y={layer.y}
                                    width={layer.width}
                                    height={layer.height}
                                    rotation={layer.rotation}
                                >
                                    {layer.type === 'text' ? (
                                        <TextItem layer={layer as TextLayer} />
                                    ) : layer.type === 'cta' ? (
                                        <CtaItem layer={layer as CtaLayer} />
                                    ) : layer.type === 'shape' ? (
                                        <ShapeItem layer={layer} />
                                    ) : layer.type === 'group' ? (
                                        // Render group children recursively
                                        (layer as GroupLayer).children.map(child => (
                                            <Group
                                                key={child.id}
                                                x={child.x}
                                                y={child.y}
                                                width={child.width}
                                                height={child.height}
                                                rotation={child.rotation}
                                            >
                                                {child.type === 'text' ? (
                                                    <TextItem layer={child as TextLayer} />
                                                ) : child.type === 'cta' ? (
                                                    <CtaItem layer={child as CtaLayer} />
                                                ) : child.type === 'shape' ? (
                                                    <ShapeItem layer={child} />
                                                ) : (
                                                    <URLImage layer={child as ImageLayer} />
                                                )}
                                            </Group>
                                        ))
                                    ) : (
                                        <URLImage layer={layer as ImageLayer} />
                                    )}
                                </Group>
                            );
                        })}
                    </Layer>
                </Stage>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center bg-zinc-900/5 dark:bg-zinc-900/50 p-8 overflow-hidden h-full w-full ${isHandMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <div
                className="shadow-2xl ring-1 ring-black/5"
                style={{
                    width: doc.width * scale,
                    height: doc.height * scale
                }}
            >
                <Stage
                    ref={stageRef}
                    width={doc.width * scale}
                    height={doc.height * scale}
                    scaleX={scale}
                    scaleY={scale}
                    draggable={isHandMode}
                    x={viewPos.x}
                    y={viewPos.y}
                    onDragEnd={(e) => {
                        if (isHandMode) {
                            onViewChange?.({ x: e.target.x(), y: e.target.y() });
                        }
                    }}
                    onMouseDown={(e) => {
                        if (isHandMode) return;
                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) {
                            if (!e.evt.shiftKey && !e.evt.metaKey) {
                                onLayerSelect?.(undefined, false);
                            }
                            // Start selection box
                            const stage = e.target.getStage();
                            if (stage) {
                                const pointer = stage.getPointerPosition();
                                if (pointer) {
                                    // Transform pointer to stage coords if needed, but since we draw rect in stage, 
                                    // we need coordinates relative to the Stage's transform? 
                                    // Actually, if we put selection Rect inside the Transformed Layer, we need inverse transform.
                                    // But usually selection rect is drawn on top or in untransformed space? 
                                    // Let's rely on calculating relative to the stage's content.
                                    // Simplest: use relative pointer pos.
                                    const transform = stage.getAbsoluteTransform().copy();
                                    transform.invert();
                                    const pos = transform.point(pointer);
                                    selectionStartRef.current = pos;
                                    setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
                                }
                            }
                        }
                    }}
                    onMouseMove={(e) => {
                        if (!selectionStartRef.current) return;
                        const stage = e.target.getStage();
                        if (!stage) return;
                        const pointer = stage.getPointerPosition();
                        if (!pointer) return;
                        const transform = stage.getAbsoluteTransform().copy();
                        transform.invert();
                        const pos = transform.point(pointer);

                        const x = Math.min(selectionStartRef.current.x, pos.x);
                        const y = Math.min(selectionStartRef.current.y, pos.y);
                        const width = Math.abs(pos.x - selectionStartRef.current.x);
                        const height = Math.abs(pos.y - selectionStartRef.current.y);

                        setSelectionBox({ x, y, width, height });
                    }}
                    onMouseUp={(e) => {
                        if (selectionStartRef.current) {
                            // End selection
                            const stage = e.target.getStage();
                            if (stage && selectionBox) {
                                // Simple checking for intersection
                                const box = selectionBox;
                                const selectedIds: string[] = [];

                                doc.layers.forEach(layer => {
                                    const node = stage.findOne('.' + layer.id);
                                    if (node) {
                                        // Use getClientRect for accurate bounds with rotation/scale
                                        const rect = node.getClientRect();
                                        if (Konva.Util.haveIntersection(
                                            { x: box.x, y: box.y, width: box.width, height: box.height },
                                            rect
                                        )) {
                                            selectedIds.push(layer.id);
                                        }
                                    }
                                });

                                if (selectedIds.length > 0) {
                                    if (onMultiLayerSelect) {
                                        onMultiLayerSelect(selectedIds);
                                    } else {
                                        // Fallback if no batch handler
                                        onLayerSelect?.(selectedIds[0], false);
                                        for (let i = 1; i < selectedIds.length; i++) {
                                            onLayerSelect?.(selectedIds[i], true);
                                        }
                                    }
                                }
                            }
                            setSelectionBox(null);
                            selectionStartRef.current = null;
                        }
                    }}
                >
                    <Layer listening={false}>
                        <Rect width={doc.width} height={doc.height} fill={doc.backgroundColor} />
                    </Layer>
                    <Layer listening={!isHandMode}>
                        {sortedLayers.map((layer) => {
                            if (!layer.visible) return null;
                            return (
                                <LayerNode
                                    key={layer.id}
                                    layer={layer}
                                    isHandMode={isHandMode}
                                    onLayerSelect={onLayerSelect}
                                    onLayerUpdate={(id, updates) => {
                                        onLayerUpdate?.(id, updates);
                                        handleDragEnd();
                                    }}
                                    onDragMove={handleLayerDragMove}
                                />
                            );
                        })}
                    </Layer>

                    {/* Transformer Layer */}
                    <Layer>
                        <Transformer
                            ref={trRef}
                            borderStroke="#3b82f6"
                            anchorFill="#3b82f6"
                            anchorSize={8}
                            anchorCornerRadius={2}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                return newBox;
                            }}
                        />
                    </Layer>

                    {/* Snap Guides Layer */}
                    <Layer listening={false}>
                        {snapGuides.map((guide, i) => (
                            <Line
                                key={i}
                                points={guide.type === 'vertical'
                                    ? [guide.pixelPos, -10000, guide.pixelPos, 10000] // Infinite vertical line
                                    : [-10000, guide.pixelPos, 10000, guide.pixelPos]  // Infinite horizontal line
                                }
                                stroke="#ec4899" // Pink-500
                                strokeWidth={1}
                                dash={[4, 4]}
                            />
                        ))}
                    </Layer>

                    {/* Selection Box Layer (Topmost) */}
                    {selectionBox && (
                        <Layer listening={false}>
                            <Rect
                                x={selectionBox.x}
                                y={selectionBox.y}
                                width={selectionBox.width}
                                height={selectionBox.height}
                                fill="rgba(0, 161, 255, 0.1)"
                                stroke="#00a1ff"
                                strokeWidth={1}
                            />
                        </Layer>
                    )}
                    <Layer listening={false}>
                        {doc.safeArea && doc.safeArea.left !== undefined && doc.safeArea.top !== undefined && doc.safeArea.right !== undefined && doc.safeArea.bottom !== undefined && (
                            <Rect
                                x={doc.safeArea.left}
                                y={doc.safeArea.top}
                                width={doc.width - doc.safeArea.left - doc.safeArea.right}
                                height={doc.height - doc.safeArea.top - doc.safeArea.bottom}
                                stroke="cyan"
                                strokeWidth={1}
                                dash={[10, 10]}
                                opacity={0.3}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
});

CanvasStage.displayName = 'CanvasStage';
