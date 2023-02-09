import jwt from "jsonwebtoken";
import express, { NextFunction, Request, Response } from "express";
import env from "../util/validateEnv";

//this middleware will be used in chat page and order page
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization?.split(" ")[0];

  if (authHeader !== "Bearer") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = req.headers.authorization?.split(" ")[1] as string;

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    next();
  });
};
