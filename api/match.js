import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ingredients } = req.body;
  if (!ingredients || typeof ingredients !== "string") {
    return res.status(400).json({ error: "ingredients (string) required" });
  }

  const list = ingredients
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  if (list.length === 0) {
    return res.status(400).json({ error: "No valid ingredients provided" });
  }

  const prompt = `You are a recipe assistant. The user has these ingredients: ${list.join(", ")}.

Suggest 3-5 recipes that use ONLY these ingredients as the base, but recipes may require a few additional common ingredients not listed.

Return ONLY valid JSON, no markdown, no code fences, in this exact shape:
{
  "recipes": [
    {
      "name": "string",
      "usedIngredients": ["string"],
      "missingIngredients": ["string"],
      "instructions": "string, 3-5 short steps combined"
    }
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const ranked = parsed.recipes.sort(
      (a, b) => a.missingIngredients.length - b.missingIngredients.length
    );

    return res.status(200).json({ recipes: ranked });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: "Failed to generate recipes" });
  }
}