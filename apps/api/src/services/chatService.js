const prisma = require('../config/prisma');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// Tool implementations
async function getEventCategories() {
  const categories = await prisma.eventCategory.findMany({
    select: { name: true, description: true }
  });
  return categories;
}

async function getCategoryOptions(categoryName) {
  const category = await prisma.eventCategory.findFirst({
    where: { name: { contains: categoryName, mode: 'insensitive' } },
    include: {
      options: {
        select: {
          name: true,
          description: true,
          price: true,
          type: true,
          subType: true,
          parentId: true,
          subOptions: {
            select: {
              name: true,
              description: true,
              price: true,
              type: true,
              subType: true
            }
          }
        }
      }
    }
  });
  return category;
}

async function getOptionSubitems(optionName) {
  const option = await prisma.customOption.findFirst({
    where: { name: { contains: optionName, mode: 'insensitive' } },
    include: {
      subOptions: {
        select: {
          name: true,
          description: true,
          price: true,
          type: true,
          subType: true
        }
      }
    }
  });
  
  if (!option) return { error: 'Option not found' };
  
  return {
    parentOption: {
      name: option.name,
      description: option.description,
      price: option.price,
      type: option.type
    },
    subItems: option.subOptions
  };
}

async function getOptionsInBudget(budget, categoryName = null) {
  const where = categoryName ? {
    category: { name: { contains: categoryName, mode: 'insensitive' } }
  } : {};
  
  const options = await prisma.customOption.findMany({
    where: {
      ...where,
      price: { lte: parseFloat(budget) },
      parentId: null
    },
    select: {
      name: true,
      description: true,
      price: true,
      type: true,
      category: { select: { name: true } }
    },
    orderBy: { price: 'desc' },
    take: 20
  });
  
  return options;
}

async function suggestPackageForBudget(budget, categoryName = null) {
  const totalBudget = parseFloat(budget);
  
  const where = categoryName ? {
    category: { name: { contains: categoryName, mode: 'insensitive' } }
  } : {};
  
  const allOptions = await prisma.customOption.findMany({
    where: {
      ...where,
      parentId: null
    },
    select: {
      name: true,
      price: true,
      type: true,
      category: { select: { name: true } }
    },
    orderBy: { price: 'asc' }
  });
  
  // Group by type
  const byType = {};
  allOptions.forEach(opt => {
    if (!byType[opt.type]) byType[opt.type] = [];
    byType[opt.type].push(opt);
  });
  
  // Try to build a balanced package
  const suggestion = [];
  let remaining = totalBudget;
  
  for (const type of Object.keys(byType)) {
    const options = byType[type].filter(o => o.price <= remaining);
    if (options.length > 0) {
      const selected = options[0];
      suggestion.push(selected);
      remaining -= selected.price;
    }
  }
  
  return {
    totalBudget,
    suggestedPackage: suggestion,
    totalCost: suggestion.reduce((sum, opt) => sum + opt.price, 0),
    remainingBudget: remaining
  };
}

// Chat with Gemini
async function chat(userMessage, conversationHistory = []) {
  const systemPrompt = `You are a helpful event planning assistant. You help customers find the perfect event packages within their budget.
You have access to database tools to fetch real event data. Be friendly, concise, and helpful.
When suggesting packages, always include prices and help customers stay within budget.

Available tools:
1. get_event_categories() - Get all event categories
2. get_category_options(categoryName) - Get options for a category with sub-items
3. get_option_subitems(optionName) - Get sub-items for a specific option
4. get_options_in_budget(budget, categoryName?) - Get all options within a budget
5. suggest_package_for_budget(budget, categoryName?) - Suggest a balanced package for a budget

Help customers by:
- Showing what's available in their budget
- Suggesting balanced packages (food, venue, decor, etc.)
- Explaining options and their prices
- Answering questions about events and packages`;

  let conversationText = systemPrompt + '\n\n';
  conversationHistory.forEach(msg => {
    conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
  });
  conversationText += `User: ${userMessage}\nAssistant:`;

  const toolResult = await detectAndExecuteTool(userMessage, conversationHistory);
  
  if (toolResult) {
    conversationText += `\n[Tool Result: ${JSON.stringify(toolResult)}]\n\nBased on this data, provide a helpful response:`;
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: conversationText }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || response.statusText}`);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const assistantMessage = data.candidates[0].content.parts[0].text;

    // Remove tool call syntax from response
    const cleanMessage = assistantMessage.replace(/\[TOOL:[^\]]+\]\{[^}]*\}/g, '').trim();

    return {
      message: cleanMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: cleanMessage }
      ]
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}

async function detectAndExecuteTool(message, history) {
  const lowerMsg = message.toLowerCase();
  
  // Check for budget queries
  const budgetMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if ((lowerMsg.includes('budget') || lowerMsg.includes('money') || lowerMsg.includes('afford') || lowerMsg.includes('have')) && budgetMatch) {
    const budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
    
    let categoryName = null;
    if (lowerMsg.includes('birthday')) categoryName = 'birthday';
    else if (lowerMsg.includes('wedding')) categoryName = 'wedding';
    else if (lowerMsg.includes('corporate')) categoryName = 'corporate';
    
    if (lowerMsg.includes('suggest') || lowerMsg.includes('package') || lowerMsg.includes('recommend')) {
      return await suggestPackageForBudget(budget, categoryName);
    } else {
      return await getOptionsInBudget(budget, categoryName);
    }
  }
  
  // Check for category listing
  if (lowerMsg.includes('categories') || lowerMsg.includes('what events') || lowerMsg.includes('types of events')) {
    return await getEventCategories();
  }
  
  // Check for category options
  const categoryMatch = lowerMsg.match(/(?:options|packages|items|plan).*?(?:for|in)\s+([\w\s]+?)(?:\?|$|\.|,)/i);
  if (categoryMatch || lowerMsg.includes('wedding') || lowerMsg.includes('birthday') || lowerMsg.includes('corporate')) {
    const categoryName = categoryMatch ? categoryMatch[1].trim() : 
                        lowerMsg.includes('wedding') ? 'wedding' :
                        lowerMsg.includes('birthday') ? 'birthday' : 'corporate';
    return await getCategoryOptions(categoryName);
  }
  
  // Check for sub-items
  const subItemMatch = lowerMsg.match(/(?:sub|variations|types).*?(?:for|of)\s+([\w\s]+?)(?:\?|$|\.|,)/i);
  if (subItemMatch || lowerMsg.includes('sub-items') || lowerMsg.includes('subitems')) {
    const optionName = subItemMatch ? subItemMatch[1].trim() : '';
    if (optionName) {
      return await getOptionSubitems(optionName);
    }
  }
  
  return null;
}

module.exports = { chat };
