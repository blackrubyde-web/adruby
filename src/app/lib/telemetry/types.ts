/**
 * TELEMETRY & TRACKING - TYPE DEFINITIONS
 * 
 * Types for cost tracking, performance monitoring, and debug artifacts.
 */

import { z } from 'zod';

// ============================================================================
// TELEMETRY
// ============================================================================

export interface StageTelemetry {
    time: number;       // milliseconds
    cost?: number;      // USD
    count?: number;     // items processed
    errors?: number;    // error count
}

export interface PipelineTelemetry {
    totalCost: number;
    totalTime: number;
    apiCalls: number;
    retries: number;

    stages: {
        specGeneration: StageTelemetry;
        assetRendering: StageTelemetry;
        templateScoring: StageTelemetry;
        assembly: StageTelemetry;
        validation: StageTelemetry;
    };

    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
    };
}

export const PipelineTelemetrySchema = z.object({
    totalCost: z.number().min(0),
    totalTime: z.number().min(0),
    apiCalls: z.number().min(0).int(),
    retries: z.number().min(0).int(),

    stages: z.object({
        specGeneration: z.object({
            time: z.number().min(0),
            cost: z.number().min(0).optional(),
            count: z.number().int().optional(),
            errors: z.number().int().optional()
        }),
        assetRendering: z.object({
            time: z.number().min(0),
            cost: z.number().min(0).optional(),
            count: z.number().int().optional(),
            errors: z.number().int().optional()
        }),
        templateScoring: z.object({
            time: z.number().min(0),
            cost: z.number().min(0).optional(),
            count: z.number().int().optional(),
            errors: z.number().int().optional()
        }),
        assembly: z.object({
            time: z.number().min(0),
            cost: z.number().min(0).optional(),
            count: z.number().int().optional(),
            errors: z.number().int().optional()
        }),
        validation: z.object({
            time: z.number().min(0),
            cost: z.number().min(0).optional(),
            count: z.number().int().optional(),
            errors: z.number().int().optional()
        })
    }),

    meta: z.object({
        timestamp: z.string().optional(),
        requestId: z.string().optional(),
        version: z.string().optional()
    }).optional()
});

// ============================================================================
// DEBUG ARTIFACTS
// ============================================================================

export interface DebugArtifacts {
    specs?: unknown[];               // Generated CreativeSpecs
    scoredTemplates?: unknown[];     // Template scoring results
    validationResults?: unknown[];   // Validation results per attempt
    retryLog?: unknown[];            // Retry attempt log
    rawResponses?: unknown[];        // Raw LLM responses (if enabled)
}

export const DebugArtifactsSchema = z.object({
    specs: z.array(z.unknown()).optional(),
    scoredTemplates: z.array(z.unknown()).optional(),
    validationResults: z.array(z.unknown()).optional(),
    retryLog: z.array(z.unknown()).optional(),
    rawResponses: z.array(z.unknown()).optional()
});

// ============================================================================
// MODEL USAGE TRACKING
// ============================================================================

export interface ModelUsage {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    latency: number;  // ms
}

export const ModelUsageSchema = z.object({
    model: z.string(),
    promptTokens: z.number().int().min(0),
    completionTokens: z.number().int().min(0),
    totalTokens: z.number().int().min(0),
    cost: z.number().min(0),
    latency: z.number().min(0)
});

export interface ModelUsageLog {
    usages: ModelUsage[];
    totalCost: number;
    totalTokens: number;
    totalLatency: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create empty telemetry object
 */
export function createEmptyTelemetry(): PipelineTelemetry {
    return {
        totalCost: 0,
        totalTime: 0,
        apiCalls: 0,
        retries: 0,
        stages: {
            specGeneration: { time: 0, cost: 0, count: 0, errors: 0 },
            assetRendering: { time: 0, count: 0, errors: 0 },
            templateScoring: { time: 0, count: 0 },
            assembly: { time: 0, count: 0, errors: 0 },
            validation: { time: 0, count: 0, errors: 0 }
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Add stage telemetry
 */
export function addStageTelemetry(
    telemetry: PipelineTelemetry,
    stage: keyof PipelineTelemetry['stages'],
    data: StageTelemetry
): void {
    telemetry.stages[stage] = {
        ...telemetry.stages[stage],
        ...data
    };

    if (data.cost) {
        telemetry.totalCost += data.cost;
    }
    if (data.time) {
        telemetry.totalTime += data.time;
    }
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
}

/**
 * Format time as human-readable
 */
export function formatTime(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
}
