import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@soldirectory/shared-types';
import User from '../models/User.js';

export interface AuthedRequest extends Request {
  user?: { id: string; role: Role; email: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthedRequest['user'];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Not authorized for this action' });
      return;
    }
    // With ADMIN_REQUIRE_2FA=true an administrator must have two-factor sign-in on before using the admin console.
    // /security stays reachable so they can switch it on. Off by default so nobody is locked out on deploy.
    if (req.user.role === 'admin' && process.env.ADMIN_REQUIRE_2FA === 'true') {
      void User.findById(req.user.id).select('twoFactor.enabled').lean().then((u) => {
        if (u?.twoFactor?.enabled) return next();
        res.status(403).json({ error: 'Turn on two-factor sign-in under Security to use the admin console.', code: 'TWO_FACTOR_SETUP_REQUIRED' });
      }).catch(() => res.status(500).json({ error: 'Could not check two-factor sign-in.' }));
      return;
    }
    next();
  };
}
