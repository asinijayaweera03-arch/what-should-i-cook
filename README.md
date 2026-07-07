# 🍳 What Should I Cook?

A smart AI-powered recipe finder that helps you decide what to cook using the ingredients you already have.

Enter the ingredients in your fridge, and the app generates recipes ranked by the fewest missing ingredients—so the easiest meal to make appears first.

🌐 **Live Demo:** https://what-should-i-cook-five.vercel.app

---

## ✨ Features

- 🤖 AI-generated recipe suggestions
- 🥕 Find recipes using your available ingredients
- ⭐ Recipes ranked by the fewest missing ingredients
- 📋 Step-by-step cooking instructions
- ⚡ Fast serverless backend powered by Vercel
- 📱 Responsive and user-friendly interface

---

## 🧠 How It Works

1. Enter a comma-separated list of ingredients.
2. The frontend sends the ingredients to a Vercel serverless function.
3. The backend prompts the Google Gemini API to generate recipes.
4. The returned recipes are sorted by the number of missing ingredients.
5. The best matching recipes are displayed first.

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Vercel Serverless Functions

### AI
- Google Gemini API
- `@google/generative-ai`
- Gemini 2.5 Flash

### Deployment
- Vercel

---

## 📁 Project Structure

```text
what-should-i-cook/
├── api/
│   └── match.js
├── client/
│   ├── src/
│   └── package.json
├── package.json
├── vercel.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/asinijayaweera03-arch/what-should-i-cook.git
cd what-should-i-cook
```

### 2. Install dependencies

```bash
npm install

cd client
npm install
cd ..
```

### 3. Create a `.env` file

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the project

Install the Vercel CLI:

```bash
npm install -g vercel
```

Start the development server:

```bash
vercel dev
```

Visit:

```
http://localhost:3000
```

---

## 🔑 Environment Variable

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |

---

## 🔮 Future Improvements

- Save favorite recipes
- Recipe search history
- Dietary preference filters
- Adjustable serving sizes
- Nutrition information
- AI-generated recipe images

---

## 👩‍💻 Author

**Asini Jayaweera**

GitHub: https://github.com/asinijayaweera03-arch

---

## 📄 License

This project is licensed under the MIT License.