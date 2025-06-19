import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, MapPin, Cloud, Route } from "lucide-react";

const TripCompanionChat = ({
  orderedLocations = [],
  locationsWithWeather = [],
  totalDistance = 0,
  totalDuration = 0,
  onAddLocation,
  onRemoveLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "👋 Hi! I'm your trip companion. I can help you find places, get weather insights, or optimize your route. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced Gemini API integration with better context
  const callGeminiAPI = async (userMessage, context) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file."
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Enhanced context prompt with specific instructions
    const contextPrompt = `
You are a knowledgeable trip companion AI assistant with expertise in travel, food, and local recommendations. 

Current Trip Context:
- Locations: ${context.locationsList || "None added yet"}
- Distance: ${context.totalDistance}km
- Duration: ${context.totalDuration} minutes
- Weather data: ${context.hasWeatherData ? "Available" : "Not available"}

User Query: "${userMessage}"

IMPORTANT INSTRUCTIONS:
- If user asks for restaurants/food: Provide specific establishment types and food categories that would typically be found in the mentioned areas
- For "grab and go" requests: Focus on quick food options like cafes, fast food, street vendors, convenience stores
- Be specific about food types: mention Indian street food, chains like McDonald's/KFC, local dhaba options, bakeries, etc.
- Keep responses under 150 words
- Use practical, actionable advice
- Include relevant emojis
- If locations are Indian cities/areas, suggest Indian food options and international chains commonly found there

Example response style for food queries:
"🍽️ Great grab-and-go options near your route:
• **Quick Indian**: Haldiram's, local chaat stalls, samosa vendors
• **Fast Food**: McDonald's, KFC, Subway if available nearby  
• **Cafes**: CCD, Starbucks, local tea stalls
• **Convenience**: 24/7 stores with packaged snacks, fresh fruits from vendors

Would you like me to suggest specific areas to look for these options along your route?"
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: contextPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        topK: 30,
        topP: 0.9,
        maxOutputTokens: 200,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Prepare context for Gemini
    const context = {
      locationsCount: orderedLocations.length,
      totalDistance,
      totalDuration,
      hasWeatherData: locationsWithWeather.length > 0,
      locationsList: orderedLocations
        .map((loc, idx) => `${idx + 1}. ${loc.name}`)
        .join("\n"),
    };

    try {
      const response = await callGeminiAPI(currentMessage, context);

      // Enhanced response processing with local fallbacks
      let finalResponse = response;

      // If the response seems too generic, enhance it with specific suggestions
      if (
        currentMessage.toLowerCase().includes("grab and go") ||
        currentMessage.toLowerCase().includes("quick food") ||
        currentMessage.toLowerCase().includes("lunch") ||
        currentMessage.toLowerCase().includes("food")
      ) {
        // Check if response mentions specific food places
        const hasSpecificPlaces =
          /McDonald's|KFC|Subway|Haldiram|CCD|Starbucks|Pizza Hut/i.test(
            response
          );

        if (!hasSpecificPlaces && orderedLocations.length > 0) {
          finalResponse += `\n\n🍽️ **Quick Options to Look For:**\n• McDonald's, KFC, Burger King\n• Haldiram's, local chaat vendors\n• CCD, Starbucks for coffee\n• Local dhabas for Indian meals\n• Street food stalls, fruit vendors`;
        }
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: finalResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini API Error:", error);

      let errorMessage =
        "Sorry, I'm having trouble connecting right now. Please try again in a moment.";

      if (error.message.includes("API key not found")) {
        errorMessage =
          "🔑 API key not configured. Please add your Gemini API key to the environment variables.";
      } else if (error.message.includes("quota")) {
        errorMessage =
          "📊 API quota exceeded. Please check your Gemini API usage limits.";
      } else if (error.message.includes("blocked")) {
        errorMessage =
          "🛡️ Request was blocked by safety filters. Please try rephrasing your question.";
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    "Find nearby cafes",
    "Quick food options",
    "Best route to take",
    "Local street food",
    "Fast food chains nearby",
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#89ECDB] hover:bg-[#7BDCC7] text-[#2B3638] p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-110"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-[#2B3638] border border-[#4A5759] rounded-lg shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-[#89ECDB] text-[#2B3638] p-4 rounded-t-lg flex items-center gap-2">
            <MessageCircle size={20} />
            <span className="font-semibold">Trip Companion</span>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{orderedLocations.length}</span>
              </div>
              {locationsWithWeather.length > 0 && (
                <div className="flex items-center gap-1">
                  <Cloud size={14} />
                  <span>Weather</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-[#89ECDB] text-[#2B3638]"
                      : "bg-[#4A5759] text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-[#2B3638]/70"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#4A5759] text-white p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#89ECDB] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#89ECDB] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#89ECDB] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="p-3 border-t border-[#4A5759]">
              <div className="text-xs text-gray-400 mb-2">
                Quick suggestions:
              </div>
              <div className="flex flex-wrap gap-1">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs bg-[#4A5759] hover:bg-[#5A6769] text-gray-300 px-2 py-1 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#4A5759]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your trip..."
                className="flex-1 bg-[#4A5759] text-white p-2 rounded border border-[#5A6769] focus:border-[#89ECDB] focus:outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-[#89ECDB] hover:bg-[#7BDCC7] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#2B3638] p-2 rounded transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripCompanionChat;
