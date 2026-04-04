import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'fallback-secret';

export function signToken(payload: object, expiresIn = '7d'): string {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, SECRET);
}
