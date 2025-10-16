export async function slackNotify(text: string) {
  const hook = process.env.SLACK_WEBHOOK_EXPERIMENTS;
  if (!hook) return; // optional
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text })
    });
  } catch (e) {
    // don't throw on Slack failures
    console.warn("[slack] post failed:", (e as any)?.message);
  }
}


