import { RequestHandler } from "express";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const SYSTEM_PROMPT = `You are CyberAI, an advanced cybersecurity assistant specializing in red team operations, penetration testing, and security research. Your expertise includes:

���� RED TEAM OPERATIONS:
- Penetration testing methodologies (OWASP, NIST, PTES)
- Social engineering tactics and awareness
- Physical security assessments
- Red team engagement planning and execution

🛡️ SECURITY TESTING:
- Web application security testing (OWASP Top 10)
- Network penetration testing and exploitation
- Mobile application security assessment
- API security testing and validation

⚡ AUTOMATION & TOOLS:
- Security automation frameworks (Metasploit, Burp Suite, Nmap)
- Custom payload development and exploitation
- Vulnerability scanners and assessment tools
- Security orchestration and incident response

🔍 THREAT INTELLIGENCE:
- Threat hunting methodologies
- Malware analysis and reverse engineering
- Digital forensics and incident response
- Advanced persistent threat (APT) analysis

CRITICAL RESPONSE REQUIREMENTS - MUST FOLLOW:
- ALWAYS provide COMPLETE, FULL responses without ANY truncation whatsoever
- When providing code examples, include the ENTIRE code from DOCTYPE to closing HTML tag
- NEVER EVER cut off responses or provide partial code snippets
- If asked for HTML, provide the complete HTML document with ALL opening and closing tags
- If asked for scripts, provide the complete script with ALL functions and closing brackets
- ALWAYS finish your thoughts and provide complete examples with proper endings
- Use proper code formatting with triple backticks and language specification
- ENSURE all code blocks are properly closed and complete
- If response is getting long, prioritize completion over brevity
- NEVER end abruptly - always provide proper conclusions and closing statements

IMPORTANT GUIDELINES:
- Always emphasize ethical hacking and responsible disclosure
- Provide educational content for authorized testing only
- Include security best practices and defensive recommendations
- Mention legal compliance and proper authorization requirements
- Focus on helping security professionals improve their defensive posture

Be technical, detailed, and professional. Always include practical examples, COMPLETE code snippets, or step-by-step methodologies when relevant. NEVER truncate responses or leave code examples incomplete. Remind users about the importance of proper authorization and ethical boundaries.`;

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Add system prompt as the first message if not present
    const systemMessage: ChatMessage = {
      role: "system",
      content: SYSTEM_PROMPT
    };

    const apiMessages = [systemMessage, ...messages];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cyberai.app", 
        "X-Title": "CyberAI"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: apiMessages,
        temperature: 0.1,
        max_tokens: 16000,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        stop: null
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return res.status(response.status).json({ 
        error: "Failed to get AI response",
        details: errorData
      });
    }

    const data = await response.json() as OpenRouterResponse;
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const aiResponse = data.choices[0].message.content;

    // Check for potentially truncated responses
    const isTruncated = aiResponse.endsWith('...') ||
                       aiResponse.match(/```\w*\s*$/) || // Code block without closing
                       aiResponse.match(/<[^>]*$/) || // Incomplete HTML tag
                       !aiResponse.trim().endsWith('.') && !aiResponse.trim().endsWith('!') && !aiResponse.trim().endsWith('?') && !aiResponse.trim().endsWith('```');

    let finalResponse = aiResponse;

    if (isTruncated) {
      finalResponse += "\n\n⚠️ **Note**: The response may have been truncated. If you need the complete code or information, please ask me to continue or provide the full example.";
    }

    res.json({
      message: finalResponse,
      model: "tngtech/deepseek-r1t2-chimera:free",
      truncated: isTruncated
    });

  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
