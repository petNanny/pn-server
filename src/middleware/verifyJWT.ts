import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import env from "../util/validateEnv";
import createHttpError from "http-errors";

interface RequestWithUserRole extends Request {
  id?: string;
  email?: string;
  roles?: string[];
}

//this middleware will be used in profile page, chat page and order page
export const verifyJWT = (req: RequestWithUserRole, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string | undefined);

  if (!authHeader?.startsWith("Bearer ")) {
    throw createHttpError("401", "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, async (err: Error | null, decoded: any) => {
    if (err) throw createHttpError("403", "Forbidden");
    req.id = decoded.PetOwnerInfo.id;
    req.email = decoded.PetOwnerInfo.email;
    req.roles = decoded.PetOwnerInfo.roles;

    next();
  });
};
