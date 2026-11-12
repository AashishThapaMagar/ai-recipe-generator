export function request(ctx) {
  const ingredients = ctx.args.ingredients.join(', ');

  return {
    method: 'POST',
    resourcePath: '/model/amazon.nova-lite-v1:0/converse',
    params: {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: `Suggest one short recipe using: ${ingredients}.` }],
        }],
        inferenceConfig: { maxTokens: 350 },
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) return { error: ctx.error.message };

  if (ctx.result.statusCode === 429) {
    return { error: 'Bedrock is throttling requests. Check your token quota.' };
  }

  if (ctx.result.statusCode !== 200) {
    return { error: `Bedrock returned HTTP ${ctx.result.statusCode}.` };
  }

  const result = JSON.parse(ctx.result.body);
  return { body: result.output.message.content[0].text };
}