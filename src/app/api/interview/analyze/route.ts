import { Mistral } from "@mistralai/mistralai";
import { type NextRequest, NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, interviewConfig } = await request.json();

    // Validate input
    if (
      !conversationHistory ||
      !Array.isArray(conversationHistory) ||
      conversationHistory.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No conversation history provided" },
        { status: 400 },
      );
    }

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "No interview configuration provided" },
        { status: 400 },
      );
    }

    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
    );

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 2000,
    });

    const analysis = chatResponse.choices?.[0]?.message?.content;
    const analysisText =
      typeof analysis === "string"
        ? analysis
        : "Unable to generate analysis at this time.";

    // Parse the structured analysis
    const feedback = parseAnalysis(analysisText);

    return NextResponse.json({
      success: true,
      feedback,
      rawAnalysis: analysisText,
    });
  } catch (error) {
    console.error("Analysis API error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { success: false, error: "Analysis request timed out" },
          { status: 408 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze interview responses. Please try again.",
      },
      { status: 500 },
    );
  }
}

interface InterviewConfig {
  position: string;
  seniority: string;
  interviewType: string;
  interviewMode?: string;
  specificCompany?: string;
}

interface Message {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  questionType?: string;
  isFollowUp?: boolean;
}

function generateAnalysisSystemPrompt(config: InterviewConfig): string {
  const { position, seniority } = config;

  return `You are an expert technical interviewer and career coach analyzing interview performance. Your task is to provide comprehensive, constructive feedback on a candidate's interview responses for a ${seniority}-level ${position} position.

Evaluation Criteria:
1. Technical Knowledge & Accuracy
2. Problem-Solving Approach
3. Communication Clarity
4. Depth of Understanding
5. Real-world Application
6. Areas for Improvement

Provide your analysis in this structured format:

## OVERALL SCORE
[Score out of 100 and brief summary]

## STRENGTHS
[List 3-5 key strengths demonstrated]

## AREAS FOR IMPROVEMENT
[List 3-5 specific areas needing development]

## DETAILED ANALYSIS
[Detailed breakdown by category with specific examples]

## RECOMMENDATIONS
[Actionable advice for improvement]

## NEXT STEPS
[Specific resources, topics to study, or practices to adopt]

Be constructive, specific, and actionable in your feedback. Reference specific responses when possible.`;
}

function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
): string {
  const { position, seniority, interviewType } = config;

  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  return `Please analyze this ${interviewType} interview for a ${seniority}-level ${position} position:

INTERVIEW TRANSCRIPT:
${conversation}

CONTEXT:
- Position: ${position}
- Seniority: ${seniority}
- Interview Type: ${interviewType}
- Total Questions: ${conversationHistory.filter((msg) => msg.type === "ai" && !msg.content.includes("Hello!")).length}
- Total Responses: ${conversationHistory.filter((msg) => msg.type === "user").length}

Please provide a comprehensive analysis following the structured format in your system prompt.`;
}

function parseAnalysis(analysis: string) {
  const sections: {
    overallScore: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
    recommendations: string;
    nextSteps: string;
  } = {
    overallScore: "",
    strengths: [],
    improvements: [],
    detailedAnalysis: "",
    recommendations: "",
    nextSteps: "",
  };

  try {
    // Extract overall score
    const scoreMatch = analysis.match(/## OVERALL SCORE\s*([\s\S]*?)(?=##|$)/i);
    if (scoreMatch) {
      sections.overallScore = scoreMatch[1].trim();
    }

    // Extract strengths
    const strengthsMatch = analysis.match(/## STRENGTHS\s*([\s\S]*?)(?=##|$)/i);
    if (strengthsMatch) {
      sections.strengths = strengthsMatch[1]
        .split("\n")
        .filter(
          (line) => line.trim().startsWith("-") || line.trim().startsWith("•"),
        )
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter((line) => line.length > 0);
    }

    // Extract improvements
    const improvementsMatch = analysis.match(
      /## AREAS FOR IMPROVEMENT\s*([\s\S]*?)(?=##|$)/i,
    );
    if (improvementsMatch) {
      sections.improvements = improvementsMatch[1]
        .split("\n")
        .filter(
          (line) => line.trim().startsWith("-") || line.trim().startsWith("•"),
        )
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter((line) => line.length > 0);
    }

    // Extract detailed analysis
    const detailedMatch = analysis.match(
      /## DETAILED ANALYSIS\s*([\s\S]*?)(?=##|$)/i,
    );
    if (detailedMatch) {
      sections.detailedAnalysis = detailedMatch[1].trim();
    }

    // Extract recommendations
    const recommendationsMatch = analysis.match(
      /## RECOMMENDATIONS\s*([\s\S]*?)(?=##|$)/i,
    );
    if (recommendationsMatch) {
      sections.recommendations = recommendationsMatch[1].trim();
    }

    // Extract next steps
    const nextStepsMatch = analysis.match(
      /## NEXT STEPS\s*([\s\S]*?)(?=##|$)/i,
    );
    if (nextStepsMatch) {
      sections.nextSteps = nextStepsMatch[1].trim();
    }

    // Calculate numerical score
    const scoreNumber = extractScore(sections.overallScore);

    return {
      ...sections,
      score: scoreNumber,
      scoreColor: getScoreColor(scoreNumber),
    };
  } catch (error) {
    console.error("Error parsing analysis:", error);
    return {
      overallScore: analysis,
      strengths: [],
      improvements: [],
      detailedAnalysis: analysis,
      recommendations: "",
      nextSteps: "",
      score: 0,
      scoreColor: "text-gray-500",
    };
  }
}

function extractScore(scoreText: string): number {
  const scoreMatch = scoreText.match(
    /(\d+)(?:\s*\/\s*100|\s*out\s*of\s*100|\s*%)/i,
  );
  if (scoreMatch) {
    return parseInt(scoreMatch[1], 10);
  }

  // Try to find just a number at the beginning
  const numberMatch = scoreText.match(/^(\d+)/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    return num <= 100 ? num : 0;
  }

  return 0;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}
