import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
// Use memory store for simplicity - in production, use redis or postgres
import MemoryStore from "memorystore";
const MemorySession = MemoryStore(session);
const scryptAsync = promisify(scrypt);

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '30d';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// JWT Token utilities
export function generateAccessToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function verifyAccessToken(token: string): { id: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as { id: string; role: string };
  } catch (error) {
    return null;
  }
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Set JWT cookies
function setJWTCookies(res: any, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    domain: COOKIE_DOMAIN,
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    domain: COOKIE_DOMAIN,
  });
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+971|0)(50|52|54|55|56|58|2|3|4|6|7|9)[0-9]{7}$/,
      "Enter a valid UAE phone number: +971XXXXXXXX or 0XXXXXXXX (mobile: 50,52,54,55,56,58)"
    ),
  address: z.string().min(1, "Address is required"),
  role: z.enum(["homeowner", "company", "admin"]).default("homeowner"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Hybrid authentication middleware - supports both JWT and legacy sessions
export function isAuthenticated(req: any, res: any, next: any) {
  // Check JWT first (from cookies or Authorization header)
  const accessToken = req.cookies?.accessToken || 
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      req.user = payload;
      return next();
    }
  }
  
  // Fallback to legacy session authentication (for migration period)
  if (req.session?.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.userRole
    };
    
    // Optionally issue JWT tokens for legacy session users (silent migration)
    try {
      const accessToken = generateAccessToken({ id: req.user.id, role: req.user.role });
      const refreshToken = generateRefreshToken();
      
      // Save refresh token
      storage.saveRefreshToken({
        userId: req.user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
      });
      
      setJWTCookies(res, accessToken, refreshToken);
      console.log(`[AUTH] Migrated session to JWT for user ${req.user.id}`);
    } catch (error) {
      console.error('[AUTH] Failed to migrate session to JWT:', error);
    }
    
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
}

export function setupAuth(app: Express) {
  // Session configuration
  app.use(session({
    store: new MemorySession({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    name: 'sessionId',
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  }));

  // Register endpoint
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const newUser = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address,
        role: validatedData.role,
      });

      // Create session
      req.session.userId = newUser.id;
      req.session.userRole = newUser.role;

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isPasswordValid = await comparePasswords(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Role switching endpoint
  app.post('/api/auth/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.body;
      
      if (!["homeowner", "company"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Get current user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user role in database using upsertUser
      const updatedUser = await storage.upsertUser({
        ...user,
        role,
        updatedAt: new Date(),
      });
      
      // Update session
      req.session.userRole = role;

      // Return updated user
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Role switch error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}