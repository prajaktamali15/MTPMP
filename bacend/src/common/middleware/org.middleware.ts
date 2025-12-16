import { Request, Response, NextFunction } from 'express';

// Organization middleware function
export function orgMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`Middleware check - Path: ${req.path}, Method: ${req.method}`);

  // Skip for auth routes (register/login/google callback)
  if (req.path.startsWith('/auth')) {
    console.log('Skipping middleware for auth route');
    return next();
  }

  // Skip for invitation routes (they handle org context differently)
  if (req.path.startsWith('/invitations')) {
    console.log('Skipping middleware for invitations route');
    return next();
  }

  // Skip for organizations GET route (used to check user's organizations)
  if (req.path === '/organizations' && req.method === 'GET') {
    console.log('Skipping middleware for organizations GET route');
    return next();
  }

  // Skip for organizations POST route (used to create first organization)
  if (req.path === '/organizations' && req.method === 'POST') {
    console.log('Skipping middleware for organizations POST route');
    return next();
  }

  // Skip for auth organizations GET route (used to check user's organizations)
  if (req.path === '/auth/organizations' && req.method === 'GET') {
    console.log('Skipping middleware for auth/organizations GET route');
    return next();
  }

  // Skip for uploads routes (static files don't require org context)
  if (req.path.startsWith('/uploads/')) {
    console.log('Skipping middleware for uploads route');
    return next();
  }

  // For other routes, check if they require organization context
  // Some endpoints might not require org context, but most do
  const orgId = req.headers['x-org-id'];

  console.log('Organization ID from header:', orgId);

  if (!orgId) {
    console.log('Organization ID missing');
    return res.status(400).json({
      message: 'Organization ID missing (x-org-id header required)',
    });
  }

  // Add orgId to request object
  (req as any).orgId = String(orgId);
  console.log('Organization ID found, proceeding');
  next();
}