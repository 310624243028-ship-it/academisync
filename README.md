
---

# 🎓 AcademiSync

**AI-Powered Academic Performance Analyzer**

## 📌 Overview

AcademiSync is a smart web application that helps students analyze their academic performance at a deeper level. Instead of just showing marks, it breaks down performance **topic-wise**, identifies weak areas, and suggests what needs improvement based on syllabus coverage and question paper analysis.

The system uses AI to map syllabus topics to exam questions and evaluates performance using marks obtained per question.

---

## ✨ Features

* 📚 Subject selection
* 🧾 Upload and structure syllabus into topics & subtopics
* 📝 Upload previous question papers
* 🔍 AI-based mapping of questions to syllabus topics
* ✍️ Enter marks obtained per question
* 📊 Topic-wise performance analysis
* 🚨 Identification of weak, average, and strong topics
* 🎯 Personalized improvement suggestions

---

## 🛠️ Tech Stack

**Frontend**

* React
* TypeScript
* Vite

**AI / Services**

* Google Gemini API

**Tools**

* Node.js
* npm

---

## ⚙️ Project Structure

```
ACADEMISYNC/
│
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── geminiService.ts     # AI interaction logic
├── index.html           # HTML template
├── types.ts             # Type definitions
├── metadata.json        # App metadata
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── .env.local           # Environment variables
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/310624243028-ship-it/academisync.git
cd academisync
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Add Environment Variables

Create a `.env.local` file:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Run the App

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:5173
```

---

## 🧠 How It Works

1. User selects subjects
2. Syllabus is structured into topics
3. Question paper is analyzed and mapped to topics
4. Marks per question are entered
5. AI evaluates topic-wise performance
6. App highlights improvement areas and study priorities

---

## 🎯 Use Cases

* Students preparing for exams
* Topic-wise revision planning
* Academic performance tracking
* Smart study recommendations

---

## 🔮 Future Enhancements

* OCR for automatic mark extraction
* Student login and performance history
* Visual analytics dashboards
* Multi-semester comparison
* Mobile app version

---

## 🤍 Acknowledgements

* Google Gemini API
* React & Vite Community

---

## 📜 License

This project is developed for educational purposes.

---

