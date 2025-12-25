"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group, Transformer } from 'react-konva';
import useImage from 'use-image';
import type { AdDocument, StudioLayer, ImageLayer, TextLayer, CtaLayer } from '../../types/studio';

export interface CanvasStageHandle {
    exportToDataURL: (format?: 'png' | 'jpeg', quality?: number) => string | undefined;
}


// --- Sub-Components for Layers ---

const URLImage = ({ layer }: { layer: ImageLayer }) => {
    const [image] = useImage(layer.src, 'anonymous');

    return (
        <KonvaImage
            image={image}
            x={0}
            y={0}
            width={layer.width}
            height={layer.height}
            opacity={layer.opacity}
        />
    );
};

const TextItem = ({ layer }: { layer: TextLayer }) => {
    return (
        <Text
            text={layer.text}
            x={0}
            y={0}
            width={layer.width}
            fontSize={layer.fontSize}
            fontFamily={layer.fontFamily}
            fontStyle={`${layer.fontWeight >= 700 ? 'bold' : 'normal'} ${layer.fontStyle || ''}`.trim()}
            fill={layer.color}
            align={layer.align}
            opacity={layer.opacity}
            lineHeight={layer.lineHeight}
            letterSpacing={layer.letterSpacing}
            shadowColor={layer.shadowColor}
            shadowBlur={layer.shadowBlur}
            shadowOffsetX={layer.shadowOffsetX}
            shadowOffsetY={layer.shadowOffsetY}
        />
    );
};

const CtaItem = ({ layer }: { layer: CtaLayer }) => {
    const { width, height, opacity, bgColor, radius, text, fontSize, fontFamily, fontWeight, fontStyle, color, letterSpacing, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = layer;

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
                fill={bgColor}
                cornerRadius={radius}
                shadowColor={shadowColor || "black"}
                shadowBlur={shadowBlur || 10}
                shadowOpacity={0.2}
                shadowOffsetX={shadowOffsetX || 0}
                shadowOffsetY={shadowOffsetY || 5}
            />
            <Text
                text={text}
                width={width}
                height={height}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontStyle={`${fontWeight >= 700 ? 'bold' : 'normal'} ${fontStyle || ''}`.trim()}
                fill={color}
                align="center"
                verticalAlign="middle"
                letterSpacing={letterSpacing || 0}
            />
        </Group>
    );
};

// --- Main Stage ---

interface CanvasStageProps {
    doc: AdDocument;
    scale?: number;
    selectedLayerId?: string;
    onLayerSelect?: (id: string) => void;
    onLayerUpdate?: (id: string, attrs: Partial<StudioLayer>) => void;
}

export const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(({ doc, scale = 1, selectedLayerId, onLayerSelect, onLayerUpdate }, ref) => {
    const sortedLayers = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex);
    const trRef = useRef<any>(null);
    const stageRef = useRef<any>(null);

    // Expose export method via ref
    useImperativeHandle(ref, () => ({
        exportToDataURL: (format = 'png', quality = 1) => {
            if (!stageRef.current) return undefined;
            // Temporarily hide transformer for export
            if (trRef.current) trRef.current.nodes([]);
            const dataURL = stageRef.current.toDataURL({
                mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
                quality,
                pixelRatio: 2 // High resolution export
            });
            return dataURL;
        }
    }), []);

    useEffect(() => {
        if (!selectedLayerId || !trRef.current) return;
        const stage = trRef.current.getStage();
        const selectedNode = stage.findOne('.' + selectedLayerId);
        if (selectedNode) {
            trRef.current.nodes([selectedNode]);
            trRef.current.getLayer().batchDraw();
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedLayerId, sortedLayers]);

    return (
        <div className="flex items-center justify-center bg-zinc-900/5 dark:bg-zinc-900/50 p-8 overflow-auto h-full w-full">
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
                    onMouseDown={(e) => {
                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) onLayerSelect?.('');
                    }}
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
                                    draggable={!layer.locked}
                                    onClick={(e) => {
                                        e.cancelBubble = true;
                                        onLayerSelect?.(layer.id);
                                    }}
                                    onTap={(e) => {
                                        e.cancelBubble = true;
                                        onLayerSelect?.(layer.id);
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
                                        onLayerUpdate?.(layer.id, {
                                            x: node.x(),
                                            y: node.y(),
                                            rotation: node.rotation(),
                                            width: Math.max(5, node.width() * scaleX),
                                            height: Math.max(5, node.height() * scaleY)
                                        });
                                    }}
                                >
                                    {layer.type === 'text' ? (
                                        <TextItem layer={layer as TextLayer} />
                                    ) : (layer.type === 'cta') ? (
                                        <CtaItem layer={layer as CtaLayer} />
                                    ) : (layer.type === 'background' || layer.type === 'product' || layer.type === 'overlay' || layer.type === 'logo') ? (
                                        <URLImage layer={layer as ImageLayer} />
                                    ) : null}
                                </Group>
                            );
                        })}

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

                    <Layer listening={false}>
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
                    </Layer>
                </Stage>
            </div>
        </div>
    );
});

CanvasStage.displayName = 'CanvasStage';

