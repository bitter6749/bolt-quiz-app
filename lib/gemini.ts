export interface QuizQuestion {
  id: number
  type: 'multiple_choice' | 'text'
  question: string
  options?: string[]
  correct_answer: number | string
  explanation: string
}

export interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
}

export async function generateQuizFromPrompt(prompt: string): Promise<QuizData> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a quiz based on this prompt: "${prompt}". 
          
          Please respond with ONLY a valid JSON object in this exact format:
          {
            "title": "Quiz title",
            "description": "Brief description",
            "questions": [
              {
                "id": 1,
                "type": "multiple_choice",
                "question": "Question text?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": 0,
                "explanation": "Explanation text"
              },
              {
                "id": 2,
                "type": "text",
                "question": "Text question?",
                "correct_answer": "Expected answer",
                "explanation": "Explanation text"
              }
            ]
          }
          
          Create 5-10 questions. Make sure the JSON is valid and includes proper explanations.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to generate quiz')
  }

  const data = await response.json()
  const generatedText = data.candidates[0]?.content?.parts[0]?.text

  if (!generatedText) {
    throw new Error('No content generated')
  }

  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : generatedText
    
    const quizData = JSON.parse(jsonString)
    
    // Validate the structure
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure')
    }

    return quizData
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error)
    throw new Error('Failed to parse generated quiz')
  }
}

export async function generateQuizFromPDF(pdfText: string, customPrompt?: string): Promise<QuizData> {
  const prompt = customPrompt 
    ? `Based on the following PDF content, create a quiz focusing on: ${customPrompt}\n\nPDF Content:\n${pdfText.slice(0, 3000)}`
    : `Create a comprehensive quiz based on this PDF content:\n\n${pdfText.slice(0, 3000)}`
  
  return generateQuizFromPrompt(prompt)
}