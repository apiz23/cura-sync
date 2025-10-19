"use server";

export interface AnalysisResult {
    possible_disease: string;
    confidence_level: string;
    suggested_action: string;
}

export interface AnalyzeResponse {
    success: boolean;
    data?: AnalysisResult;
    error?: string;
}

/**
 * Server action to analyze symptoms
 * @param symptoms - Comma-separated string of symptoms
 * @returns Analysis result or error
 */
export async function analyzeSymptoms(
    symptoms: string
): Promise<AnalyzeResponse> {
    try {
        // Validate input
        if (!symptoms || symptoms.trim().length === 0) {
            return {
                success: false,
                error: "Symptoms cannot be empty",
            };
        }

        console.log("[Server Action] Analyzing symptoms:", symptoms);

        // Call the FastAPI backend
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                symptoms: symptoms.trim(),
            }),
            // Add cache settings for better performance
            cache: "no-store",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Server Action] FastAPI error:", errorText);
            throw new Error(
                `Analysis failed with status ${response.status}: ${errorText}`
            );
        }

        const data: AnalysisResult = await response.json();

        console.log("[Server Action] Analysis complete:", data);

        // Validate response structure
        if (
            !data.possible_disease ||
            !data.confidence_level ||
            !data.suggested_action
        ) {
            throw new Error("Invalid response format from analysis service");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("[Server Action] Error analyzing symptoms:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred";

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Health check for the analysis service
 * @returns Service status
 */
export async function checkAnalysisService(): Promise<{
    healthy: boolean;
    message: string;
}> {
    try {
        const response = await fetch("http://127.0.0.1:8000/health", {
            method: "GET",
            cache: "no-store",
        });

        if (!response.ok) {
            return {
                healthy: false,
                message: "Analysis service is unavailable",
            };
        }

        return {
            healthy: true,
            message: "Analysis service is operational",
        };
    } catch (error) {
        console.error("[Health Check] Service unreachable:", error);
        return {
            healthy: false,
            message: "Cannot reach analysis service",
        };
    }
}
