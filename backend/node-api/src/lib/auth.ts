import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

// JWT payload schema
const JwtPayloadSchema = z.object({
  sub: z.string(),           // User ID
  role: z.enum(["patient", "doctor", "admin"]),
  provinceCode: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional()
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      sessionId?: string;
    }
  }
}

export interface AuthOptions {
  required?: boolean;           // Default: true
  roles?: ("patient" | "doctor" | "admin")[];
  allowUnverified?: boolean;     // Allow requests without valid JWT
}

const JWT_SECRET = process.env.JWT_SECRET ?? "replace-me";
const JWT_EXPIRY = "12h";
const JWT_REFRESH_EXPIRY = "7d";

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: {
  sub: string;
  role: "patient" | "doctor" | "admin";
  provinceCode?: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: { sub: string }): string {
  return jwt.sign({ sub: payload.sub }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const parsed = JwtPayloadSchema.safeParse(decoded);
    
    if (!parsed.success) {
      console.error("JWT payload validation failed:", parsed.error);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.expiredAt);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token:", error.message);
    }
    return null;
  }
}

/**
 * Extract token from Authorization header or cookie
 */
function extractToken(request: Request): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  
  // Check cookie
  const cookieToken = request.cookies?.token || request.cookies?.access_token;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Check query parameter (for WebSocket/legacy)
  const queryToken = request.query.token;
  if (typeof queryToken === "string") {
    return queryToken;
  }
  
  return null;
}

/**
 * Authentication middleware factory
 */
export function authenticate(options: AuthOptions = {}): RequestHandler {
  const {
    required = true,
    roles,
    allowUnverified = false
  } = options;

  return (request: Request, response: Response, next: NextFunction) => {
    const token = extractToken(request);

    // No token provided
    if (!token) {
      if (!required || allowUnverified) {
        // Continue without user context
        return next();
      }
      return response.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Please provide a valid token."
      });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      if (allowUnverified) {
        return next();
      }
      return response.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token. Please authenticate again."
      });
    }

    // Check role authorization
    if (roles && !roles.includes(payload.role)) {
      return response.status(403).json({
        error: "Forbidden",
        message: `Access denied. Required role: ${roles.join(" or ")}`,
        yourRole: payload.role
      });
    }

    // Attach user to request
    request.user = payload;
    next();
  };
}

/**
 * Require patient role
 */
export const requirePatient: RequestHandler = authenticate({ roles: ["patient"] });

/**
 * Require doctor role
 */
export const requireDoctor: RequestHandler = authenticate({ roles: ["doctor"] });

/**
 * Require admin role
 */
export const requireAdmin: RequestHandler = authenticate({ roles: ["admin"] });

/**
 * Require doctor or admin role
 */
export const requireDoctorOrAdmin: RequestHandler = authenticate({ 
  roles: ["doctor", "admin"] 
});

/**
 * Optional authentication (attach user if present)
 */
export const optionalAuth: RequestHandler = authenticate({ 
  required: false, 
  allowUnverified: true 
});

/**
 * Require authentication but any role
 */
export const requireAuth: RequestHandler = authenticate();

/**
 * Middleware to check if user owns the resource
 */
export function requireOwnership(getResourceId: (req: Request) => string): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({
        error: "Unauthorized",
        message: "Authentication required."
      });
    }

    const resourceId = getResourceId(request);
    
    // Admin can access any resource
    if (request.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    if (request.user.sub !== resourceId) {
      return response.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this resource."
      });
    }

    next();
  };
}

/**
 * Rate limit by user ID (prevent abuse)
 */
const userRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitByUser(options: {
  maxRequests?: number;
  windowMs?: number;
} = {}): RequestHandler {
  const { maxRequests = 100, windowMs = 60000 } = options;

  return (request: Request, response: Response, next: NextFunction) => {
    // Skip rate limit if not authenticated
    if (!request.user) {
      return next();
    }

    const userId = request.user.sub;
    const now = Date.now();
    
    let record = userRequestCounts.get(userId);
    
    // Reset if window expired
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + windowMs };
      userRequestCounts.set(userId, record);
    }

    record.count++;

    // Set rate limit headers
    response.setHeader("X-RateLimit-Limit", maxRequests);
    response.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    response.setHeader("X-RateLimit-Reset", record.resetAt);

    if (record.count > maxRequests) {
      return response.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)} seconds.`
      });
    }

    next();
  };
}

/**
 * Clean up rate limit cache periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, record] of userRequestCounts.entries()) {
    if (record.resetAt < now) {
      userRequestCounts.delete(userId);
    }
  }
}, 60000);

/**
 * Audit log middleware - track sensitive operations
 */
export function auditLog(action: string): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    // Store original end function
    const originalEnd = response.end;
    
    // Override end to capture response
    response.end = ((...args: any[]) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId: request.user?.sub,
        role: request.user?.role,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        ip: request.ip,
        userAgent: request.headers["user-agent"]
      };

      console.log("[AUDIT]", JSON.stringify(logEntry));
      return originalEnd.apply(response, args as any);
    }) as typeof response.end;
    
    next();
  };
}

/**
 * Extract user context for logging
 */
export function getUserContext(request: Request): {
  userId?: string;
  role?: string;
  provinceCode?: string;
} {
  if (!request.user) {
    return {};
  }
  
  return {
    userId: request.user.sub,
    role: request.user.role,
    provinceCode: request.user.provinceCode
  };
}

