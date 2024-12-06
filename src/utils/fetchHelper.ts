export const fetchRateLimit = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  let rateLimitWait = 0;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (true) {
    if (rateLimitWait > 0) {
      console.log(`waitng ${rateLimitWait}ms for rate limit to reset`);
      await sleep(rateLimitWait);
    }

    const response = await fetch(url, options);

    const headers = response.headers;
    const remainingRequests = Number(headers.get("X-RateLimit-Remaining"));
    const resetAfter = Number(headers.get("X-RateLimit-Reset-After"));

    rateLimitWait = remainingRequests === 0 ? resetAfter * 1000 : 0;

    const status = response.status;

    if (status === 429) {
      const responseJson = await response.json();
      const retryAfter = responseJson.retry_after;
      rateLimitWait = retryAfter * 1000;
      console.log("Rate limit exceeded");
      continue;
    }

    if (status >= 400) {
      throw new Error(`request failed ${await response.text()}`);
    }

    return response;
  }
};
