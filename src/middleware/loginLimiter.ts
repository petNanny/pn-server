import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per window per minute
  message: {
    message: "Too many login attempts from this IP, please try again after a 60 second pause",
  },
  standardHeaders: true, // Return rate limit info
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
