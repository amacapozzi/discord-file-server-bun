export const fetchRateLimit = async (
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<Response> => {
  let rateLimitWait = 0;
  let retries = 0;

  while (true) {
    if (retries > maxRetries) {
      throw new Error("Max retries reached");
    }

    if (rateLimitWait > 0) {
      console.log(`Waiting ${rateLimitWait}ms for rate limit to reset`);
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
      retries++;
      continue;
    }

    if (status >= 400) {
      throw new Error(`Request failed: ${await response.text()}`);
    }

    return response;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
