const prisma = require('../config/prisma');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash"; // Or your preferred version
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

/**
 * 1. TOOL DECLARATIONS
 * These tell Gemini what functions you have and what they do.
 */
const tools = [
  {
    function_declarations: [
      {
        name: "get_event_categories",
        description: "Fetch all available event categories (e.g., Wedding, Birthday).",
      },
      {
        name: "get_category_options",
        description: "Get detailed packages and options for a specific event category.",
        parameters: {
          type: "OBJECT",
          properties: {
            categoryName: { type: "STRING", description: "The name of the category" }
          },
          required: ["categoryName"]
        }
      },
      {
        name: "get_option_subitems",
        description: "Get specific sub-items or variations for a parent event option.",
        parameters: {
          type: "OBJECT",
          properties: {
            optionName: { type: "STRING", description: "The name of the parent option" }
          },
          required: ["optionName"]
        }
      },
      {
        name: "get_options_in_budget",
        description: "List all individual items available within a specific price range.",
        parameters: {
          type: "OBJECT",
          properties: {
            budget: { type: "NUMBER", description: "Maximum price per item" },
            categoryName: { type: "STRING", description: "Filter by category (optional)" }
          },
          required: ["budget"]
        }
      },
      {
        name: "suggest_package_for_budget",
        description: "Generates a balanced combination of items (Venue, Food, Decor) within a total budget.",
        parameters: {
          type: "OBJECT",
          properties: {
            budget: { type: "NUMBER", description: "The total budget for the whole event" },
            categoryName: { type: "STRING", description: "Filter by category (optional)" }
          },
          required: ["budget"]
        }
      }
    ]
  }
];

/**
 * 2. DATABASE TOOLS (Prisma Logic - Kept from your original)
 */
const dbTools = {
  async get_event_categories() {
    const categories = await prisma.eventCategory.findMany({ select: { name: true, description: true } });
    console.log('get_event_categories result:', categories);
    return categories;
  },

  async get_category_options({ categoryName }) {
    return await prisma.eventCategory.findFirst({
      where: { name: { contains: categoryName, mode: 'insensitive' } },
      include: {
        options: {
          where: { parentId: null },
          select: { name: true, description: true, price: true, type: true }
        }
      }
    });
  },

  async get_option_subitems({ optionName }) {
    const option = await prisma.customOption.findFirst({
      where: { name: { contains: optionName, mode: 'insensitive' } },
      include: { subOptions: true }
    });
    return option ? { parent: option.name, subItems: option.subOptions } : { error: "Not found" };
  },

  async get_options_in_budget({ budget, categoryName }) {
    const where = { price: { lte: budget }, parentId: null };
    if (categoryName) where.category = { name: { contains: categoryName, mode: 'insensitive' } };
    return await prisma.customOption.findMany({ where, take: 10 });
  },

  async suggest_package_for_budget({ budget, categoryName }) {
    const where = categoryName ? { category: { name: { contains: categoryName, mode: 'insensitive' } } } : {};
    const allOptions = await prisma.customOption.findMany({
      where: { ...where, parentId: null },
      orderBy: { price: 'asc' }
    });

    const suggestion = [];
    let remaining = budget;
    const types = [...new Set(allOptions.map(o => o.type))];

    for (const type of types) {
      const bestFit = allOptions.find(o => o.type === type && o.price <= remaining);
      if (bestFit) {
        suggestion.push(bestFit);
        remaining -= bestFit.price;
      }
    }
    return { suggestedPackage: suggestion, totalCost: budget - remaining, remainingBudget: remaining };
  }
};

/**
 * 3. MAIN CHAT LOGIC
 */
async function chat(userMessage, conversationHistory = []) {
  try {
    const systemInstruction = "You are a helpful event planning assistant. Use the provided tools to fetch real data. Always show prices and stay within the user's budget.";
    
    let response = await callGemini(userMessage, conversationHistory, systemInstruction);
    
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      console.error('Invalid Gemini response:', JSON.stringify(response, null, 2));
      throw new Error('Invalid response from Gemini API');
    }
    
    let messagePart = response.candidates[0].content.parts[0];
    let currentHistory = [...conversationHistory, { role: 'user', parts: [{ text: userMessage }] }];
    
    // Handle multiple sequential function calls
    let maxIterations = 5;
    let iterations = 0;
    
    while (messagePart.functionCall && iterations < maxIterations) {
      iterations++;
      const fnName = messagePart.functionCall.name;
      const fnArgs = messagePart.functionCall.args;

      console.log(`AI calling tool (iteration ${iterations}): ${fnName}`, fnArgs);

      const toolResult = await dbTools[fnName](fnArgs);
      console.log('Tool result:', JSON.stringify(toolResult, null, 2));

      const finalResponse = await callGeminiWithToolResult(
        currentHistory,
        messagePart,
        fnName, 
        toolResult
      );
      
      console.log('Response from Gemini:', JSON.stringify(finalResponse, null, 2));

      if (!finalResponse.candidates || !finalResponse.candidates[0] || !finalResponse.candidates[0].content) {
        console.error('Invalid final response:', JSON.stringify(finalResponse, null, 2));
        throw new Error('Invalid response from Gemini API');
      }
      
      // Update history with function call and response
      currentHistory.push({ role: 'model', parts: [messagePart] });
      currentHistory.push({
        role: 'function',
        parts: [{
          functionResponse: {
            name: fnName,
            response: { content: toolResult }
          }
        }]
      });

      messagePart = finalResponse.candidates[0].content.parts[0];
    }
    
    // Final text response
    if (!messagePart.text) {
      throw new Error('No text response from Gemini');
    }

    return {
      message: messagePart.text,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: messagePart.text }] }
      ]
    };

  } catch (error) {
    console.error('Chat Error:', error);
    throw new Error('Failed to process chat');
  }
}

/**
 * HELPERS
 */
async function callGemini(message, history, systemInstruction) {
  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    tools: tools
  };

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    console.error('Gemini API error:', JSON.stringify(data, null, 2));
    throw new Error(`Gemini API error: ${data.error?.message || res.statusText}`);
  }
  
  return data;
}

async function callGeminiWithToolResult(history, functionCallPart, fnName, toolResult) {
  const payload = {
    contents: [
      ...history,
      { role: 'model', parts: [functionCallPart] },
      {
        role: 'function',
        parts: [{
          functionResponse: {
            name: fnName,
            response: { content: toolResult }
          }
        }]
      }
    ],
    tools: tools
  };

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    console.error('Gemini API error (tool result):', JSON.stringify(data, null, 2));
    throw new Error(`Gemini API error: ${data.error?.message || res.statusText}`);
  }
  
  return data;
}

module.exports = { chat };