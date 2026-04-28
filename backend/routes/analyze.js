import express from 'express';
import genAI, { hasValidApiKey } from '../config/gemini.js';
import { SYSTEM_PROMPT, createUserPrompt } from '../utils/prompt.js';

const router = express.Router();
const MODEL_ID = 'gemini-2.5-flash';

function getFallbackResponse(diffContent) {
  const lines = diffContent.split('\n');
  const additions = lines.filter(l => l.startsWith('+')).length;

  return {
    prs: [
      {
        title: "PR #1: Database & Schema Changes",
        files: ["migrations/", "models/"],
        linesAdded: Math.floor(additions * 0.3),
        linesModified: 8,
        whyThisOrder: "Database schema must be established first as foundation for all other changes. Zero risk deployment.",
        dependencies: [],
        reviewTimeMinutes: 12,
        riskLevel: "LOW",
        riskReason: "Schema only, no business logic",
        testingSteps: ["Run migrations", "Verify table structure"]
      },
      {
        title: "PR #2: API & Backend Logic",
        files: ["routes/", "controllers/", "services/"],
        linesAdded: Math.floor(additions * 0.4),
        linesModified: 15,
        whyThisOrder: "Backend endpoints need schema from PR #1. Can be tested independently with API tools.",
        dependencies: ["Database schema from PR #1"],
        reviewTimeMinutes: 18,
        riskLevel: "MEDIUM",
        riskReason: "Core business logic changes",
        testingSteps: ["Test with Postman", "Verify auth flow"]
      },
      {
        title: "PR #3: Frontend Components",
        files: ["components/", "pages/", "utils/"],
        linesAdded: Math.floor(additions * 0.25),
        linesModified: 10,
        whyThisOrder: "UI components call APIs from PR #2. Can iterate on styling without affecting backend.",
        dependencies: ["API endpoints from PR #2"],
        reviewTimeMinutes: 15,
        riskLevel: "LOW",
        riskReason: "UI changes only",
        testingSteps: ["Manual UI testing", "Check responsiveness"]
      },
      {
        title: "PR #4: Tests & Documentation",
        files: ["tests/", "README.md", "docs/"],
        linesAdded: Math.floor(additions * 0.05),
        linesModified: 5,
        whyThisOrder: "Tests validate all previous changes. Documentation reflects final implementation.",
        dependencies: ["All features from PRs #1-3"],
        reviewTimeMinutes: 10,
        riskLevel: "LOW",
        riskReason: "Tests only, no production code",
        testingSteps: ["Run test suite", "Verify coverage"]
      }
    ],
    summary: {
      originalLines: additions + lines.filter(l => l.startsWith('-')).length,
      originalReviewTime: 120,
      totalPRs: 4,
      totalReviewTime: 55,
      timeSaved: 65,
      strategy: "Dependency-first layering (Demo Mode)"
    },
    metadata: {
      processingTime: 150,
      mode: 'fallback',
      message: 'Using fallback analysis — add your GEMINI_API_KEY in backend/.env for AI results'
    }
  };
}

router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const { diffContent } = req.body;

    if (!diffContent || diffContent.trim().length === 0) {
      return res.status(400).json({ error: 'Diff content is required' });
    }

    if (diffContent.length > 15000) {
      return res.status(400).json({ error: 'Diff too large. Please limit to ~1000 lines.' });
    }

    console.log('📊 Analyzing PR:', { chars: diffContent.length, timestamp: new Date().toISOString() });

    if (!hasValidApiKey()) {
      console.log('⚠️  No valid Gemini API key — using fallback');
      const fallback = getFallbackResponse(diffContent);
      fallback.metadata.processingTime = Date.now() - startTime;
      return res.json(fallback);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: MODEL_ID,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 2500,
        },
      });

      const fullPrompt = `${SYSTEM_PROMPT}\n\n${createUserPrompt(diffContent)}`;
      const result = await model.generateContent(fullPrompt);
      const aiText = result.response.text();

      let analysis;
      try {
        analysis = JSON.parse(aiText);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response:', parseError);
        const fallback = getFallbackResponse(diffContent);
        fallback.metadata.processingTime = Date.now() - startTime;
        fallback.metadata.mode = 'fallback_parse_error';
        return res.json(fallback);
      }

      if (!analysis.prs || !Array.isArray(analysis.prs)) {
        console.log('⚠️  Invalid analysis structure — using fallback');
        const fallback = getFallbackResponse(diffContent);
        fallback.metadata.processingTime = Date.now() - startTime;
        fallback.metadata.mode = 'fallback_invalid_structure';
        return res.json(fallback);
      }

      const usage = result.response.usageMetadata;
      analysis.metadata = {
        processingTime: Date.now() - startTime,
        tokensUsed: usage?.totalTokenCount ?? null,
        model: MODEL_ID,
        mode: 'ai'
      };

      console.log('✅ Gemini analysis complete:', {
        prs: analysis.prs.length,
        time: analysis.metadata.processingTime + 'ms',
        tokens: analysis.metadata.tokensUsed
      });

      return res.json(analysis);

    } catch (apiError) {
      console.error('❌ Gemini API error:', apiError.message);
      const fallback = getFallbackResponse(diffContent);
      fallback.metadata.processingTime = Date.now() - startTime;
      fallback.metadata.mode = 'fallback_api_error';
      fallback.metadata.error = apiError.message;
      return res.json(fallback);
    }

  } catch (error) {
    console.error('❌ Analysis error:', error);
    const fallback = getFallbackResponse(req.body.diffContent || '');
    fallback.metadata.processingTime = Date.now() - startTime;
    fallback.metadata.mode = 'fallback_critical_error';
    return res.json(fallback);
  }
});

export default router;
