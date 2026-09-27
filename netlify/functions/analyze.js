export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed." }) };
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not configured." })
      };
    }

    let imageBase64, mimeType;

    try {
      const body = JSON.parse(event.body);
      imageBase64 = body.imageBase64;
      mimeType = body.mimeType || "image/jpeg";
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid request body." })
      };
    }

    if (!imageBase64) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "No image data provided." })
      };
    }

    // Validate mime type
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(mimeType)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Only JPG, PNG, WEBP, and GIF images are supported." })
      };
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const prompt = `
You are an advanced visual face-analysis assistant.

Analyze the uploaded image extremely carefully. Examine the face and surrounding visible appearance at a fine level of detail. Do not invent information that cannot reasonably be observed. Separate direct visual observations from cautious estimates.

Return ONLY valid JSON. Do not use Markdown, code fences, comments, or additional text.

Use this exact JSON structure:

{
  "faceDetected": true,
  "faceCount": 2,

  "imageQuality": {
    "overall": "good",
    "sharpness": "good",
    "exposure": "balanced",
    "blur": "minimal",
    "noise": "low",
    "faceClarity": "high"
  },

  "faces": [
    {
      "faceIndex": 1,
      "personType": "adult-female",
      "apparentAgeRange": "25-34",
      "ageConfidence": "medium",
      "expression": {
        "primary": "joyful",
        "secondary": "relaxed",
        "intensity": "moderate",
        "smile": "natural closed-mouth smile",
        "eyeExpression": "slightly narrowed eyes consistent with a smile",
        "eyebrowPosition": "relaxed"
      },
      "faceShape": {
        "overall": "oval",
        "jawline": "soft and gently defined",
        "chin": "rounded",
        "cheekbones": "moderately prominent",
        "facialSymmetry": "generally symmetrical"
      },
      "skinAppearance": {
        "visibleTone": "light",
        "undertone": "neutral",
        "texture": "generally smooth",
        "visibleDetails": ["minor natural texture"],
        "lightingEffect": "evenly lit"
      },
      "eyes": {
        "visible": true,
        "apparentColor": "brown",
        "shape": "almond",
        "size": "medium",
        "direction": "looking toward camera",
        "eyelids": "clearly visible",
        "eyelashes": "visible",
        "eyeExpression": "warm and relaxed"
      },
      "eyebrows": {
        "shape": "naturally arched",
        "thickness": "medium",
        "density": "moderate",
        "appearance": "well defined"
      },
      "nose": {
        "shape": "straight",
        "bridge": "moderately defined",
        "tip": "rounded",
        "width": "medium"
      },
      "lips": {
        "shape": "defined",
        "fullness": "medium",
        "upperLip": "moderately defined",
        "lowerLip": "slightly fuller",
        "expression": "slight smile"
      },
      "hair": {
        "length": "long",
        "color": "black",
        "texture": "wavy",
        "style": "loose waves",
        "parting": "center part",
        "volume": "moderate",
        "condition": "appears well maintained",
        "visibility": "mostly visible"
      },
      "facialHair": {
        "present": false,
        "description": ""
      },
      "accessories": [
        {
          "type": "glasses",
          "visible": true,
          "description": "thin framed glasses"
        }
      ],
      "makeup": {
        "visible": true,
        "details": ["subtle eye makeup", "natural looking lip color"],
        "intensity": "subtle"
      },
      "visibleFeatures": ["glasses", "long wavy hair", "natural smile"],
      "expressionAnalysis": {
        "emotion": "joyful",
        "confidence": "medium",
        "reason": "The visible smile and relaxed eye area give the face a warm and positive expression."
      },
      "vibe": {
        "primary": "elegant and approachable",
        "secondary": "calm",
        "description": "The combination of the relaxed expression, neat hairstyle, and overall presentation creates a polished but approachable appearance."
      },
      "styleProfile": {
        "overall": "polished casual",
        "appearance": "clean and composed",
        "presentation": "natural and understated"
      },
      "bestFeature": {
        "feature": "smile",
        "description": "The smile is the most visually noticeable feature because it gives the expression warmth and character."
      },
      "distinctiveVisualDetails": ["clear eye area", "defined eyebrows", "soft jawline", "wavy hair texture"],
      "portraitSummary": "A concise, natural description of the person's visible appearance in 2-3 sentences.",
      "funDescription": "A short, playful description based only on visible characteristics.",
      "confidence": {
        "overall": "medium",
        "reason": "Some characteristics are affected by lighting, camera angle, image resolution, and visibility."
      }
    }
  ],

  "notes": "Short factual observation about anything important, uncertain, partially obscured, or affected by the image conditions."
}

DETAILED ANALYSIS RULES:

1. Analyze the image from the actual pixels. Do not rely on stereotypes, assumptions, or demographic expectations.

2. Only describe characteristics that are actually visible.

3. Never identify the person, determine their identity, or claim that they are a particular real person.

4. Do not perform celebrity identification or celebrity lookalike matching.

5. Do not infer race, ethnicity, nationality, religion, or similar sensitive demographic characteristics from facial appearance.

6. Do not infer gender identity from appearance.

7. Apparent age must always be expressed as a broad range:
   "18-24", "25-34", "35-44", "45-54", "55+", or "unclear".

8. If the face is partially hidden, obscured, extremely small, blurry, heavily filtered, or poorly illuminated, explicitly reduce confidence.

9. Do not manufacture details. If a characteristic cannot be seen, use:
   "unclear", "not visible", false, or an empty array where appropriate.

10. For eye color, only report an apparent color when the iris is sufficiently visible. Otherwise use "unclear".

11. For hair, inspect:
   length, apparent color, texture, curl/wave pattern, parting, volume, and visible styling.

12. For facial structure, describe visible geometric characteristics conservatively. Do not use exaggerated beauty judgments.

13. For skin appearance, describe only visible appearance under the current lighting. Do not infer ethnicity or ancestry from skin appearance.

14. For emotion, describe the apparent facial expression rather than claiming certainty about the person's internal emotional state.

15. For vibe, make it explicitly subjective and based on visible presentation. Keep it playful rather than psychological.

16. For "bestFeature", select a visually noticeable feature such as eyes, smile, eyebrows, hairstyle, jawline, or overall expression. Do not make medical or psychological claims.

17. Inspect small visual details when image resolution allows:
   eyebrows, eyelashes, eye direction, lip shape, smile shape, hair strands, glasses, earrings, makeup, facial hair, skin texture, shadows, head angle, and image framing.

18. Do not claim details that are hidden by:
   sunglasses, hair, masks, hands, cropping, extreme shadows, low resolution, or image compression.

19. If multiple faces are present, analyze ALL visible faces up to a maximum of 5, and include each one as an object in the "faces" array.

20. For "personType", classify each face using ONLY one of these values based on apparent age and visible presentation:
   "baby"            — appears to be an infant or very young toddler
   "child-boy"       — appears to be a male child roughly 3–12 years old
   "child-girl"      — appears to be a female child roughly 3–12 years old
   "teen-male"       — appears to be a male teenager roughly 13–17 years old
   "teen-female"     — appears to be a female teenager roughly 13–17 years old
   "young-adult-male"   — appears to be a male in roughly 18–29 age range
   "young-adult-female" — appears to be a female in roughly 18–29 age range
   "adult-male"      — appears to be a male in roughly 30–49 age range
   "adult-female"    — appears to be a female in roughly 30–49 age range
   "middle-aged-male"   — appears to be a male in roughly 50–64 age range
   "middle-aged-female" — appears to be a female in roughly 50–64 age range
   "elderly-male"    — appears to be a male 65 or older
   "elderly-female"  — appears to be a female 65 or older
   "unclear"         — cannot be reliably classified from the visible image

21. The output must remain valid JSON. Escape quotation marks inside strings when necessary.

22. Do not add fields outside the requested JSON structure.

23. If no face is clearly visible, return:
   "faceDetected": false,
   "faceCount": 0,
   "faces": [],
   and explain the reason in "notes".

24. Be detailed, but accuracy is more important than filling every field.

25. Never turn uncertainty into certainty simply to make the result look complete.
`;

    const model = "gemini-1.5-flash";
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
          responseMimeType: "application/json"
        }
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Gemini API request failed.", details: raw.slice(0, 1200) })
      };
    }

    const apiData = JSON.parse(raw);
    const content = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "The vision model returned no analysis." })
      };
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      let cleaned = content.replace(/```json|```/g, "").trim();

      if (!cleaned.endsWith("}") && !cleaned.endsWith("]")) {
        const lastBrace = Math.max(cleaned.lastIndexOf("},"), cleaned.lastIndexOf("}"));
        const lastBracket = Math.max(cleaned.lastIndexOf("],"), cleaned.lastIndexOf("]"));
        const cutAt = Math.max(lastBrace, lastBracket);
        if (cutAt > 0) {
          cleaned = cleaned.slice(0, cutAt + 1);
          const opens = (cleaned.match(/{/g) || []).length;
          const closes = (cleaned.match(/}/g) || []).length;
          const diff = opens - closes;
          cleaned += "}".repeat(Math.max(0, diff));
          cleaned += "\n}";
        }
      }

      try {
        result = JSON.parse(cleaned);
        result._truncated = true;
      } catch {
        return {
          statusCode: 502,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "The vision model returned an invalid or truncated response. Try a smaller image or fewer faces.",
            raw: content.slice(0, 500)
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ...result, model: "gemini-1.5-flash" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || "Unexpected server error." })
    };
  }
};
