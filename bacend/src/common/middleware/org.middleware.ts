import { Request, Response, NextFunction } from 'express';

// Organization middleware function
export function orgMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for auth routes (register/login/google callback)
  if (req.path.startsWith('/auth')) {
    return next();
  }
  
  // Skip for invitation routes (they handle org context differently)
  if (req.path.startsWith('/invitations')) {
    return next();
  }
  
  // Skip for organizations GET route (used to check user's organizations)
  if (req.path === '/organizations' && req.method === 'GET') {
    return next();
  }
  
  // Skip for auth organizations GET route (used to check user's organizations)
  if (req.path === '/auth/organizations' && req.method === 'GET') {
    return next();
  }
  
  // For other routes, check if they require organization context
  // Some endpoints might not require org context, but most do
  const orgId = req.headers['x-org-id'];
  
  if (!orgId) {
    return res.status(400).json({
      message: 'Organization ID missing (x-org-id header required)',
    });
  }
  
  // Add orgId to request object
  (req as any).orgId = String(orgId);
  next();
}