import { Mistral } from "@mistralai/mistralai";
import { type NextRequest, NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp,
    } = await request.json();

    // Validate input
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    const systemPrompt = generateSystemPrompt(interviewConfig);
    const userPrompt = generateUserPrompt(
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp,
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
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 800, // Reduced for more concise responses
    });

    const aiMessage =
      chatResponse.choices?.[0]?.message?.content ||
      "I apologize, but I encountered an error. Could you please try again?";

    return NextResponse.json({
      success: true,
      message: aiMessage,
      questionType: determineQuestionType(
        interviewConfig.interviewType,
        questionCount,
      ),
    });
  } catch (error) {
    console.error("Mistral AI API error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response. Please try again.",
      },
      { status: 500 },
    );
  }
}

interface InterviewConfig {
  position: string;
  seniority: string;
  interviewType: string;
  interviewMode: string;
  specificCompany?: string;
  isDemoMode?: boolean;
}

interface Message {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  questionType?: string;
  isFollowUp?: boolean;
}

function generateSystemPrompt(config: InterviewConfig): string {
  const {
    position,
    seniority,
    interviewType,
    interviewMode,
    specificCompany,
    isDemoMode,
  } = config;

  if (isDemoMode) {
    return `You are Alex, a friendly AI demo guide showing users how the Grant Guide interview system works. Your role is to:

1. Keep things casual and relaxed - this is just a demo!
2. Ask only 2-3 simple, non-intimidating questions
3. Be encouraging and supportive throughout
4. Explain what you're doing as you go ("Now I'll ask you about...")
5. Make it feel like exploring the system rather than being evaluated
6. Use a conversational, friendly tone
7. Remind users this is just practice and not being scored

Keep questions broad and approachable - focus on letting them experience the interface rather than testing their knowledge. Think of yourself as a helpful guide rather than an interviewer.`;
  }

  const basePrompt = `You are Sarah, an expert technical interviewer conducting a ${interviewType} interview for a ${seniority}-level ${position} position. Your role is to:

1. Ask appropriate questions for ${seniority} level (keep junior/mid questions simple and practical)
2. Provide thoughtful follow-up questions based on candidate responses
3. Maintain a professional but friendly interviewer persona
4. Adapt your questioning style based on the interview mode: ${interviewMode}
5. Focus on practical, real-world scenarios and problems
6. Keep responses concise and conversational (avoid long paragraphs)
7. Use simple, clear language without excessive technical jargon`;

  const modeSpecificPrompts = {
    timed: `
- Keep questions brief and focused for ${seniority} level
- Expect concise but comprehensive answers
- Move efficiently through topics`,

    untimed: `
- Allow for exploration appropriate to ${seniority} level
- Encourage explanations matching their experience level
- Ask follow-up questions suited to their knowledge`,

    behavioral: `
- Focus on STAR method responses
- Ask for examples appropriate to ${seniority} experience level
- Probe for relevant situations they would have encountered`,

    whiteboard: `
- Present challenges appropriate for ${seniority} level
- Encourage step-by-step problem-solving
- Ask about complexity matching their expected knowledge`,
  };

  const typeSpecificPrompts = {
    technical: `
- Cover fundamental concepts for ${seniority} level
- Ask about frameworks and tools they should know
- Include practical scenarios they might face`,

    behavioral: `
- Focus on situations relevant to ${seniority} level experience
- Ask about teamwork and learning experiences
- Explore problem-solving approaches`,

    coding: `
- Present problems appropriate for ${seniority} level
- Focus on clean, working solutions over optimization
- Ask about their thought process`,

    "system-design": `
- Start with basic architecture for ${seniority} level
- Focus on fundamental design principles
- Keep complexity appropriate to their experience`,
  };

  let prompt =
    basePrompt +
    (modeSpecificPrompts[interviewMode as keyof typeof modeSpecificPrompts] ||
      "");
  prompt +=
    typeSpecificPrompts[interviewType as keyof typeof typeSpecificPrompts] ||
    "";

  if (specificCompany) {
    const companyPrompts = {
      google:
        "Focus on scalability, algorithmic thinking, and large-scale system design. Emphasize data structures and algorithms.",
      meta: "Emphasize user engagement, real-time systems, and social platform challenges. Focus on frontend and backend integration.",
      apple:
        "Focus on user experience, attention to detail, and elegant solutions. Emphasize clean code and design patterns.",
      amazon:
        "Incorporate leadership principles, customer obsession, and large-scale distributed systems.",
      netflix:
        "Focus on microservices, streaming technologies, and high-availability systems.",
      microsoft:
        "Emphasize collaboration, enterprise solutions, and cloud technologies.",
    };

    const companyPrompt =
      companyPrompts[specificCompany as keyof typeof companyPrompts];
    if (companyPrompt) {
      prompt += `\n\nCompany Context for ${specificCompany}: ${companyPrompt}`;
    }
  }

  prompt += `\n\nImportant Guidelines:
- Keep responses conversational and brief (2-3 sentences max)
- Provide context for your questions
- If answering a follow-up, reference the candidate's previous response
- End with ONE clear, specific question
- Adjust difficulty for ${seniority} level: 
  * Junior: Focus on fundamentals and basic concepts
  * Mid: Include some intermediate concepts and practical scenarios
  * Senior: Advanced topics and complex scenarios
- Avoid overly complex or theoretical questions for junior/mid levels`;

  return prompt;
}

function generateUserPrompt(
  userMessage: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
  isFollowUp: boolean,
): string {
  let prompt = "";

  if (config.isDemoMode) {
    if (conversationHistory.length === 0) {
      prompt = `This is the start of a demo session. Ask a simple, friendly introductory question that helps the user get comfortable with the system. Something like asking about their interests in tech or what they'd like to learn. Keep it very casual and non-intimidating.`;
    } else if (questionCount < 2) {
      prompt = `The user just responded: "${userMessage}"

Ask a casual follow-up question that keeps the conversation flowing. This is still demo mode, so keep it light and conversational. Maybe ask about their experience level or what type of role they're interested in.`;
    } else {
      prompt = `The user just responded: "${userMessage}"

This should be the final demo question. Ask something fun and encouraging that wraps up the demo nicely, like asking about their career goals or what they found interesting about the demo. Then let them know the demo is wrapping up.`;
    }
    return prompt;
  }

  if (conversationHistory.length === 0) {
    // First question
    prompt = `This is the start of a ${config.interviewType} interview. Please introduce yourself as Sarah, the interviewer, and ask the first question appropriate for a ${config.seniority}-level ${config.position} position.`;
  } else if (isFollowUp) {
    // Follow-up question
    const _lastUserMessage = conversationHistory
      .filter((msg) => msg.type === "user")
      .pop();
    prompt = `The candidate just responded: "${userMessage}"

Based on their response, ask a thoughtful follow-up question that digs deeper into their understanding or asks them to elaborate on a specific aspect. Keep it related to the current topic.`;
  } else {
    // New question
    prompt = `The candidate's previous response was: "${userMessage}"

This is question ${questionCount + 1} of the interview. Please ask the next ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position. 

Recent conversation context:
${conversationHistory
  .slice(-4)
  .map(
    (msg) =>
      `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`,
  )
  .join("\n")}

Ask a new question that builds upon the conversation and covers different aspects of the role.`;
  }

  return prompt;
}

function determineQuestionType(
  interviewType: string,
  questionCount: number,
): string {
  const types = {
    technical: ["conceptual", "practical", "architectural", "debugging"],
    behavioral: ["leadership", "teamwork", "problem-solving", "communication"],
    coding: ["algorithms", "data-structures", "optimization", "implementation"],
    "system-design": [
      "architecture",
      "scalability",
      "trade-offs",
      "components",
    ],
  };

  const typeArray =
    types[interviewType as keyof typeof types] || types.technical;
  return typeArray[questionCount % typeArray.length];
}
