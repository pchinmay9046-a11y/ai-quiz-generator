import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { validateQuestion } from './src/utils/quizLogic.ts';
import { QuizQuestion, Difficulty } from './src/types/quiz.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// Health / Status endpoint to let frontend know whether AI generation is available
app.get('/api/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY';
  res.json({
    aiAvailable: hasKey,
    model: 'gemini-3.8-flash',
    environment: isProduction ? 'production' : 'development'
  });
});

// AI Quiz Generation Endpoint
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, subcategory, difficulty, questionCount } = req.body;

    // Validate inputs
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Topic is required.' });
    }

    const sanitizedTopic = topic.trim().slice(0, 100);
    const sanitizedSubcategory =
      typeof subcategory === 'string' && subcategory.trim().length > 0
        ? subcategory.trim().slice(0, 100)
        : undefined;

    const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard', 'mixed'];
    const chosenDifficulty: Difficulty = validDifficulties.includes(difficulty) ? difficulty : 'mixed';

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 20);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length === 0) {
      return res.status(503).json({
        error: 'NO_API_KEY',
        message: 'No Gemini API key is configured on the server. You can use the built-in Question Bank without an API key.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const difficultyInstruction =
      chosenDifficulty === 'mixed'
        ? 'Provide a balanced mix of easy, medium, and hard questions'
        : `All questions should strictly target ${chosenDifficulty} difficulty`;

    const subcategoryInstruction = sanitizedSubcategory
      ? `Specific focus area/subcategory: "${sanitizedSubcategory}".`
      : '';

    const systemInstruction = `You are a professional educational assessment author for QuizForge.
Generate high-quality multiple choice quiz questions on the specified topic.
Quality rules:
1. Every question prompt must be clear, concise, and self-contained.
2. Provide EXACTLY 4 distinct answer choices per question.
3. EXACTLY one answer must be unambiguously correct.
4. The remaining 3 choices must be plausible, realistic distractors (avoid silly or impossible answers).
5. Avoid trick questions, ambiguous phrasing, duplicate choices, and "all of the above" or "none of the above".
6. The explanation must thoroughly explain why the correct choice is accurate AND why the distractors are wrong.
7. Return only pure JSON adhering to the specified schema.`;

    const userPrompt = `Generate exactly ${count} multiple choice questions on the topic: "${sanitizedTopic}".
${subcategoryInstruction}
Difficulty requirement: ${difficultyInstruction}.
Ensure diverse concepts, no duplicate questions, and four unique options for each question.`;

    // Call Gemini API with structured schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A list of multiple choice questions',
          items: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'The question text' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 distinct choices'
              },
              correctIndex: {
                type: Type.INTEGER,
                description: '0-based index (0, 1, 2, or 3) of the correct choice'
              },
              explanation: {
                type: Type.STRING,
                description: 'Detailed explanation of why the correct answer is right and why others are wrong'
              },
              difficulty: {
                type: Type.STRING,
                description: 'easy, medium, or hard'
              },
              topic: { type: Type.STRING, description: 'The overarching topic' },
              subcategory: { type: Type.STRING, description: 'The subcategory' }
            },
            required: ['prompt', 'options', 'correctIndex', 'explanation', 'difficulty']
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return res.status(502).json({
        error: 'EMPTY_RESPONSE',
        message: 'The AI model returned an empty response. Please try again.'
      });
    }

    let parsedList: any[];
    try {
      parsedList = JSON.parse(responseText);
    } catch {
      return res.status(502).json({
        error: 'PARSE_ERROR',
        message: 'Failed to parse AI output into valid JSON. Please try again.'
      });
    }

    if (!Array.isArray(parsedList) || parsedList.length === 0) {
      return res.status(502).json({
        error: 'INVALID_FORMAT',
        message: 'AI response was not a valid list of questions.'
      });
    }

    // Validate every question with rigorous quality checks
    const validatedQuestions: QuizQuestion[] = [];
    const seenPrompts = new Set<string>();

    for (let i = 0; i < parsedList.length; i++) {
      const item = parsedList[i];
      const validation = validateQuestion(item, sanitizedTopic, chosenDifficulty);
      if (validation.valid && validation.question) {
        const normalizedPrompt = validation.question.prompt.trim().toLowerCase();
        // Prevent duplicate questions within the quiz
        if (!seenPrompts.has(normalizedPrompt)) {
          seenPrompts.add(normalizedPrompt);
          validation.question.id = `ai-${Date.now()}-${i}`;
          validatedQuestions.push(validation.question);
        }
      }
    }

    if (validatedQuestions.length < 3) {
      return res.status(502).json({
        error: 'QUALITY_CHECK_FAILED',
        message: `Only ${validatedQuestions.length} questions passed strict validation checks. Please retry or use the built-in Question Bank.`
      });
    }

    return res.json({
      questions: validatedQuestions.slice(0, count),
      source: 'ai',
      topic: sanitizedTopic,
      difficulty: chosenDifficulty
    });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return res.status(500).json({
      error: 'GENERATION_FAILED',
      message: err.message || 'An unexpected error occurred during quiz generation.'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizForge server listening on port ${PORT} (mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer();
