import { NextRequest } from 'next/server'
import axios from 'axios'
import { JOB_TITLES } from '@/lib/jobTitles'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const TECHNICAL_KEYWORDS = [
  'engineer', 'developer', 'programmer', 'architect',
  'data scientist', 'data analyst', 'data engineer',
  'machine learning', 'ml engineer', 'ai engineer', 'devops',
  'site reliability', 'sre', 'security engineer', 'cloud',
  'blockchain', 'embedded', 'game dev', 'full stack', 'frontend', 'backend',
  'qa engineer', 'quality assurance', 'bi analyst', 'business intelligence',
]

function isTechnicalRole(title: string): boolean {
  const lower = title.toLowerCase()
  return TECHNICAL_KEYWORDS.some((kw) => lower.includes(kw))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { jobTitle } = body

  const trimmed = jobTitle?.trim() ?? ''
  const isAbbreviation = /^[A-Z]{2,5}$/.test(trimmed)
  if (!trimmed) {
    return Response.json({ error: 'Job title cannot be empty.' }, { status: 400 })
  }
  if (!/[a-zA-Z]{2,}/.test(trimmed)) {
    return Response.json({ error: 'Please enter a valid job title.' }, { status: 400 })
  }
  if (!isAbbreviation && trimmed.length < 4) {
    return Response.json(
      { error: 'Please enter a valid job title (at least 4 characters).' },
      { status: 400 }
    )
  }
  if (trimmed.length > 100) {
    return Response.json({ error: 'Job title must be 100 characters or less.' }, { status: 400 })
  }

  const isKnownTitle = JOB_TITLES.some((t) => t.toLowerCase() === trimmed.toLowerCase())
  if (!isKnownTitle) {
    return Response.json({ error: 'Invalid job title.' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return Response.json({ error: 'Service not configured.' }, { status: 500 })
  }

  const technical = isTechnicalRole(jobTitle)
  const userPrompt = technical
    ? `Generate exactly 9 interview questions for a ${jobTitle} position. Include a genuine variety across all 9: a mix of behavioral, situational, technical knowledge, and coding/problem-solving questions. Distribute coding/technical questions at varied positions throughout the list — do not cluster them or always place them at the same index. Each question must have a short topic label (e.g. "Problem Solving", "System Design", "Behavioral", "Coding Challenge", "Debugging", "Communication").

For coding/problem-solving questions ONLY, sometimes add a "code" field and a "language" field — but ONLY when the question requires external context the candidate cannot infer from the question text alone. If the question is self-contained (e.g. "implement a stack", "write a debounce function", "reverse a linked list"), do NOT add a code field at all.

Only add a "code" field when the question depends on specific input data, a database schema, or an existing codebase the candidate must work with. In that case the "code" field must contain ONLY the context — never any part of the answer. Rules:
- SQL questions: show ONLY the relevant table schemas as comments (column names and types) — no SELECT/INSERT/UPDATE statements
- Input/output questions: show ONLY the sample input as a variable or comment — no transformation logic
- "Fix this bug" questions: show ONLY the broken code snippet — no fixed version

NEVER add a code field for "implement X from scratch" questions — those are self-contained and showing any skeleton gives away the structure.

BAD (gives away the answer): class Stack with push/pop/pop methods listed
GOOD (schema context only): "-- Table: sales\\n-- Columns: product_id INT, sales_amount DECIMAL, created_at DATE"

Return ONLY valid JSON: {"questions":[{"topic":"...","question":"..."},{"topic":"...","question":"...","code":"...","language":"sql"},{"topic":"...","question":"..."}]}. No markdown, no code blocks, no text outside the JSON.`
    : `Generate exactly 9 interview questions for a ${jobTitle} position. Mix behavioral and situational questions with variety. Each question must have a short topic label (e.g. "Behavioral", "Situational", "Communication", "Leadership", "Problem Solving"). Return ONLY valid JSON: {"questions":[{"topic":"...","question":"..."},{"topic":"...","question":"..."},{"topic":"...","question":"..."}]}. No markdown, no code blocks, no text outside the JSON.`

  try {
    const { data } = await axios.post(
      GROQ_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert recruiter with 15+ years of hiring experience. Generate thoughtful interview questions that probe real-world experience and problem-solving ability.',
          },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    const content: string = data.choices[0].message.content.trim()
    let parsed: { questions: { topic: string; question: string; code?: string; language?: string }[] }

    try {
      parsed = JSON.parse(content)
    } catch {
      console.error('Unparseable Groq response:', content)
      return Response.json(
        { error: 'Received unexpected response. Please try again.' },
        { status: 500 }
      )
    }

    if (
      !Array.isArray(parsed.questions) ||
      parsed.questions.length < 6 ||
      parsed.questions.some(
        (q) =>
          typeof q.topic !== 'string' ||
          typeof q.question !== 'string' ||
          (q.code !== undefined && typeof q.code !== 'string') ||
          (q.language !== undefined && typeof q.language !== 'string')
      )
    ) {
      return Response.json(
        { error: 'Received unexpected response. Please try again.' },
        { status: 500 }
      )
    }

    return Response.json({ questions: parsed.questions.slice(0, 9) })
  } catch (err: any) {
    console.error('Groq API error:', err?.response?.data ?? err.message)
    return Response.json(
      { error: 'Service temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
