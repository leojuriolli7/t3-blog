import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET || "changeme";

export function signJwt(data: object) {
  return jwt.sign(data, SECRET);
}

export function verifyJwt<T>(token: string) {
  return jwt.verify(token, SECRET) as T;
}
