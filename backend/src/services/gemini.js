import '../config.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const generateFollowUp = async (lead, recentActivities) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
        You are an assistant helping a wellness coach follow up with leads.

        Lead details:
        - Name: ${lead.name}
        - Status: ${lead.status}
        - Source: ${lead.source}
        - Phone: ${lead.phone}

        Recent activities:
        ${JSON.stringify(recentActivities, null, 2)}

        Generate follow-up content. Return ONLY valid JSON, no markdown, no explanation:
        {
        "whatsapp": "short friendly WhatsApp message (max 2 sentences)",
        "callScript": ["opening line", "main pitch", "closing/next step"],
        "objectionHandler": ${lead.status === 'INTERESTED' ? '"one line to handle common objection"' : 'null'}
        }
        `
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // strip markdown code fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}