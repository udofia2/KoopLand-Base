import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface IdeaAnalysisResult {
  originality: number; // 0-10
  useCaseValue: number; // 0-10
  categoryMatch: number; // 0-10
  overallScore: number; // 0-10
  feedback?: string;
}

export async function analyzeIdea(
  title: string,
  preview: string,
  fullContent: string,
  categories: string[]
): Promise<IdeaAnalysisResult> {
  try {
    const prompt = `You are an expert evaluator for a blockchain idea marketplace. Analyze the following idea and provide ratings.

Title: ${title}
Categories: ${categories.join(', ')}
Preview (150 words max): ${preview}
Full Content (3000 words): ${fullContent}

Please evaluate this idea on three criteria:
1. Originality (0-10): How unique and innovative is this idea? Does it bring something new to the market?
2. Use Case Value (0-10): How practical and valuable is this idea? Will it solve real problems?
3. Category Match (0-10): How well does the idea fit the selected categories? Does the content align with the categories?

Also check:
- Does the preview accurately represent the full content?
- Is the full content detailed enough (should be around 3000 words)?
- Are the categories appropriate for the idea?

Respond with a JSON object in this exact format:
{
  "originality": <number 0-10>,
  "useCaseValue": <number 0-10>,
  "categoryMatch": <number 0-10>,
  "overallScore": <number 0-10 (average of the three)>,
  "feedback": "<brief feedback string>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert evaluator for blockchain and Web3 ideas. Provide accurate, fair evaluations in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(responseContent) as IdeaAnalysisResult;

    // Validate the response
    if (
      typeof analysis.originality !== 'number' ||
      typeof analysis.useCaseValue !== 'number' ||
      typeof analysis.categoryMatch !== 'number'
    ) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Calculate overall score if not provided
    if (!analysis.overallScore) {
      analysis.overallScore =
        (analysis.originality + analysis.useCaseValue + analysis.categoryMatch) / 3;
    }

    // Ensure scores are within 0-10 range
    analysis.originality = Math.max(0, Math.min(10, analysis.originality));
    analysis.useCaseValue = Math.max(0, Math.min(10, analysis.useCaseValue));
    analysis.categoryMatch = Math.max(0, Math.min(10, analysis.categoryMatch));
    analysis.overallScore = Math.max(0, Math.min(10, analysis.overallScore));

    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Return default scores if analysis fails
    return {
      originality: 5.0,
      useCaseValue: 5.0,
      categoryMatch: 5.0,
      overallScore: 5.0,
      feedback: 'Analysis unavailable. Please review manually.',
    };
  }
}

