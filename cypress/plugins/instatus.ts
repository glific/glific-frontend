export async function reportToInstatus(
  apiKey: string,
  pageId: string,
  componentId: string,
  passed: boolean
): Promise<null> {
  if (!apiKey || !pageId || !componentId) {
    console.warn('Instatus credentials not set — skipping status report');
    return null;
  }
  const status = passed ? 'OPERATIONAL' : 'MAJOROUTAGE';
  const url = `https://api.instatus.com/v2/${pageId}/components/${componentId}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    console.log(`Instatus report: ${status} → HTTP ${res.status}`);
  } catch (err) {
    console.error('Instatus report failed:', err);
  }
  return null;
}
