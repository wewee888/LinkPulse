interface Env {
  MINIMAX_API_KEY?: string;
  MINIMAX_BASE_URL?: string;
  GEMINI_API_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const minimaxKey = context.env.MINIMAX_API_KEY;
  const hasCustomMiniMaxKey = Boolean(
    minimaxKey &&
      minimaxKey !== 'YOUR_MINIMAX_API_KEY' &&
      minimaxKey.trim().length > 5
  );

  return new Response(
    JSON.stringify({
      engine: 'MiniMax OpenAI-Compatible Gateway',
      endpoint: context.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1/chat/completions',
      supportedModels: ['MiniMax-M2', 'MiniMax-Text-01', 'MiniMax-M2.5'],
      directKeyConfigured: hasCustomMiniMaxKey,
      mode: hasCustomMiniMaxKey ? 'minimax_direct' : 'minimax_server_managed',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
