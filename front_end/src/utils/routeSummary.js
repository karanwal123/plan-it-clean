// src/utils/routeSummary.js

export async function generateRouteSummary(orderedLocations) {
  if (!orderedLocations || orderedLocations.length < 2) {
    return "";
  }

  // Build a simple A:Name, B:Name… list
  const items = orderedLocations
    .map((loc, i) => {
      const letter = String.fromCharCode(65 + i);
      const name = loc.name.split(",")[0];
      return `${letter}: ${name}`;
    })
    .join("\n");

  const prompt = `You are a friendly travel assistant and tour guide.
Given these stops in order:
${items}

Write me a short, engaging paragraph (under 100 words) telling the traveler:
- Where to start their journey
- The sequence of stops with encouraging transitions
- Brief tips or highlights about the route
- End with enthusiasm about their trip

Keep the tone warm, helpful, and exciting. Use phrases like "Next, head over to..." or "From there, make your way to..." to create smooth transitions between locations.`;

  try {
    // Using Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
            stopSequences: [],
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
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract the generated text from Gemini's response format
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return generatedText.trim();
    } else {
      console.error("Unexpected Gemini API response format:", data);
      return generateFallbackSummary(orderedLocations);
    }
  } catch (error) {
    console.error("Error generating route summary with Gemini:", error);
    return generateFallbackSummary(orderedLocations);
  }
}

// Fallback summary generator when API fails
function generateFallbackSummary(orderedLocations) {
  if (orderedLocations.length < 2) return "";

  const startLocation = orderedLocations[0].name.split(",")[0];
  const endLocation =
    orderedLocations[orderedLocations.length - 1].name.split(",")[0];
  const middleStops = orderedLocations.slice(1, -1);

  let summary = `Start your journey at ${startLocation}`;

  if (middleStops.length > 0) {
    summary += `, then visit ${middleStops
      .map((loc) => loc.name.split(",")[0])
      .join(", ")}`;
  }

  if (orderedLocations.length > 2) {
    summary += `, and finish at ${endLocation}`;
  } else {
    summary += ` and head to ${endLocation}`;
  }

  summary +=
    ". This route has been optimized for minimal travel time. Have a great trip!";

  return summary;
}

// Alternative function using Gemini Pro model for more detailed summaries
export async function generateDetailedRouteSummary(orderedLocations) {
  if (!orderedLocations || orderedLocations.length < 2) {
    return "";
  }

  const locationDetails = orderedLocations
    .map((loc, i) => {
      const letter = String.fromCharCode(65 + i);
      const name = loc.name.split(",")[0];
      const fullAddress = loc.name;
      return `${letter}: ${name} (${fullAddress})`;
    })
    .join("\n");

  const prompt = `As an experienced travel guide, create a detailed route summary for this optimized journey:

${locationDetails}

Please provide:
1. A welcoming introduction to the route
2. Step-by-step directions with estimated travel tips
3. Suggestions for what to expect or look for at each location
4. Any relevant travel advice (parking, timing, etc.)
5. An encouraging conclusion

Keep it conversational, informative, and under 200 words.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 250,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini Pro API error:", response.status);
      return generateFallbackSummary(orderedLocations);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      return generateFallbackSummary(orderedLocations);
    }
  } catch (error) {
    console.error("Error with Gemini Pro API:", error);
    return generateFallbackSummary(orderedLocations);
  }
}

// Function to get location insights using Gemini
export async function getLocationInsights(locationName) {
  const prompt = `Provide 2-3 brief, interesting facts or tips about visiting ${locationName}. Keep it under 50 words and focus on practical visitor information.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 80,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting location insights:", error);
    return null;
  }
}
