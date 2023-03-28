import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import createHttpError, { isHttpError } from "http-errors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import petSittersRoutes from "./routes/petSitterRoutes";
import petOwnersRoutes from "./routes/petOwnerRoutes";
import petRoutes from "./routes/petRoutes";

export const app = express();

const allowedOrigins = ["http://localhost:3000"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(options));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/petSitters", petSittersRoutes);
app.use("/api/petOwners", petOwnersRoutes);
app.use("/api/pets", petRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
