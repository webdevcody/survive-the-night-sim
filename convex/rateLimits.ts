import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  submitMap: { kind: "fixed window", rate: 3, period: MINUTE, capacity: 3 },
});
