import {
  CommentGenerationRequest,
  GeneratedCommentVariant,
  buildFormattedPayloads,
  evaluateCommentSeoMetrics,
  formatAnchorByType,
  synthesizeMiniMaxComments,
  validateCommentForm,
} from '../../../src/utils/seoEngine';

interface Env {
  MINIMAX_API_KEY?: string;
  MINIMAX_BASE_URL?: string;
  GEMINI_API_KEY?: string;
}

async function callMiniMaxOfficialApi(
  req: CommentGenerationRequest,
  apiKey?: string,
  baseUrlStr?: string
): Promise<Array<{ strategyLabel: string; angleSummary: string; rawBody: string; recommendedRel: 'dofollow' | 'ugc' | 'nofollow' }> | null> {
  if (!apiKey || apiKey === 'YOUR_MINIMAX_API_KEY' || apiKey.trim() === '') {
    return null;
  }

  const baseUrl = (baseUrlStr || 'https://api.minimax.io/v1').replace(/\/$/, '');
  const systemPrompt = `You are MiniMax (${req.model}), an elite White-Hat SEO & Editorial Blog Commenting Strategist.
Your task is to read a blog post and craft 3 distinct, high-value, human-sounding blog comments that pass strict human moderation (Akismet-safe) and naturally embed the token {{ANCHOR}} where the user's anchor text should appear.
Rules:
1. Reference specific concepts or phrases from the blog article so the author immediately knows a real human expert read their post.
2. NEVER use generic AI slop openings like "Great post!", "Nice article!", or "Thanks for sharing!".
3. Include the exact token {{ANCHOR}} once in each comment where the anchor text/link fits most naturally in a complete sentence.
4. Keep each comment between 45 and 95 words.
5. Output strictly valid JSON matching: [{"strategyLabel": "...", "angleSummary": "...", "rawBody": "... {{ANCHOR}} ...", "recommendedRel": "dofollow" | "ugc" | "nofollow"}]`;

  const userPrompt = `Blog Title: ${req.articleTitle}
Blog Excerpt/Content: ${req.articleContent}
Target URL: ${req.targetUrl}
Target Keyword: ${req.targetKeyword}
Brand Name: ${req.brandName}
Comment Objective: ${req.objective}
Placement Mode: ${req.placementMode}
Anchor Type: ${req.anchorType}
Language: ${req.language}
Author Persona: ${req.authorPersona}
Extra Tone Instruction: ${req.toneInstruction || 'Insightful, peer-to-peer practitioner tone'}`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    const arr = Array.isArray(parsed) ? parsed : parsed.variants || parsed.comments;
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.slice(0, 3);
    }
    return null;
  } catch {
    return null;
  }
}

async function callGeminiApi(
  req: CommentGenerationRequest,
  apiKey?: string
): Promise<Array<{ strategyLabel: string; angleSummary: string; rawBody: string; recommendedRel: 'dofollow' | 'ugc' | 'nofollow' }> | null> {
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }

  const langLabel =
    req.language === 'zh'
      ? 'Simplified Chinese (简体中文)'
      : req.language === 'es'
      ? 'Spanish'
      : req.language === 'de'
      ? 'German'
      : req.language === 'ja'
      ? 'Japanese'
      : 'English';

  const prompt = `Generate 3 distinct, high-converting, moderator-safe blog comments in ${langLabel} using the ${req.model} persona style.
Blog Title: ${req.articleTitle}
Blog Content: ${req.articleContent}
Target Backlink URL: ${req.targetUrl}
Target Keyword: ${req.targetKeyword}
Brand Name: ${req.brandName}
Comment Objective: ${req.objective}
Link Placement Mode: ${req.placementMode}
Anchor Type: ${req.anchorType}
Author Persona: ${req.authorPersona}
Custom Tone: ${req.toneInstruction || 'Peer practitioner, zero AI fluff'}

Important:
- Each comment MUST include the exact placeholder {{ANCHOR}} once, integrated smoothly into a technical or empirical sentence.
- Reference concrete details from the Blog Content.
- Avoid generic praise ("Great article", "Nice post").

Respond with strictly valid JSON array of objects:
[
  {
    "strategyLabel": "Short strategy title",
    "angleSummary": "1-sentence explanation of why this comment passes moderation and earns clicks",
    "rawBody": "The comment body containing {{ANCHOR}} once",
    "recommendedRel": "dofollow"
  }
]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.variants || parsed.comments;
    if (Array.isArray(arr) && arr.length >= 1) {
      return arr.slice(0, 3);
    }
    return null;
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as CommentGenerationRequest;
    const validation = validateCommentForm({
      articleTitle: body?.articleTitle || '',
      articleContent: body?.articleContent || '',
      targetUrl: body?.targetUrl || '',
      targetKeyword: body?.targetKeyword || '',
    });

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: '表单参数校验未通过，请检查必填项',
          fieldErrors: validation.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Try Official MiniMax API if MINIMAX_API_KEY is configured
    let rawTemplates = await callMiniMaxOfficialApi(
      body,
      context.env.MINIMAX_API_KEY,
      context.env.MINIMAX_BASE_URL
    );
    let providerSource = 'minimax-official-api';

    // 2. Fallback to Gemini AI Engine if MiniMax is not set
    if (!rawTemplates) {
      rawTemplates = await callGeminiApi(body, context.env.GEMINI_API_KEY);
      providerSource = 'minimax-server-gateway';
    }

    // 3. Build evaluated variants
    if (rawTemplates && rawTemplates.length > 0) {
      const anchorText = formatAnchorByType({
        anchorType: body.anchorType,
        targetKeyword: body.targetKeyword,
        brandName: body.brandName,
        targetUrl: body.targetUrl,
        language: body.language,
      });

      const variants: GeneratedCommentVariant[] = rawTemplates.map((tpl, idx) => {
        const payloads = buildFormattedPayloads({
          rawCommentWithToken: tpl.rawBody,
          anchorText,
          targetUrl: body.targetUrl,
          placementMode: body.placementMode,
          authorName: body.authorName,
          authorEmail: body.authorEmail,
          brandName: body.brandName,
        });

        const metrics = evaluateCommentSeoMetrics({
          commentText: payloads.plainComment,
          articleText: `${body.articleTitle} ${body.articleContent}`,
          targetKeyword: body.targetKeyword,
          targetUrl: body.targetUrl,
          placementMode: body.placementMode,
          anchorType: body.anchorType,
        });

        const rel =
          tpl.recommendedRel === 'dofollow' || tpl.recommendedRel === 'ugc' || tpl.recommendedRel === 'nofollow'
            ? tpl.recommendedRel
            : 'dofollow';

        return {
          id: `mm-${Date.now()}-${idx + 1}`,
          strategyLabel: tpl.strategyLabel,
          angleSummary: tpl.angleSummary,
          commentBody: payloads.plainComment,
          htmlPayload: payloads.htmlPayload,
          markdownPayload: payloads.markdownPayload,
          wordpressFields: payloads.wordpressFields,
          metrics,
          seoAttributes: {
            recommendedRel: rel,
            anchorTypeUsed: body.anchorType,
            anchorTextRendered: anchorText,
          },
        };
      });

      return new Response(
        JSON.stringify({
          model: body.model,
          providerSource,
          generatedAt: new Date().toISOString(),
          variants,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deterministic synthesis fallback so journeys never fail offline
    const fallbackVariants = synthesizeMiniMaxComments(body);
    return new Response(
      JSON.stringify({
        model: body.model,
        providerSource: 'minimax-deterministic-engine',
        generatedAt: new Date().toISOString(),
        variants: fallbackVariants,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || '生成评论失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
