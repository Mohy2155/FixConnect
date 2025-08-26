import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { storage } from "./storage";
import { sendVerificationEmail } from "./emailService";
// Use memory store for simplicity - in production, use redis or postgres
import MemoryStore from "memorystore";
const MemorySession = MemoryStore(session);
const scryptAsync = promisify(scrypt);

// Generate verification token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

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
  role: z.enum(["homeowner", "company", "admin"]).default("homeowner"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.userId) {
    // Add user info to request for compatibility
    req.user = {
      id: req.session.userId,
      role: req.session.userRole
    };
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

      // Create user (not verified initially)
      const newUser = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: validatedData.role,
        isEmailVerified: false,
      });

      // Generate verification token and expiration (24 hours)
      const verificationToken = generateVerificationToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Save verification token
      await storage.setEmailVerificationToken(newUser.id, verificationToken, expires);

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}`
        : `http://localhost:5000`;
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      await sendVerificationEmail({
        firstName: validatedData.firstName,
        email: validatedData.email,
        verificationLink,
        userType: validatedData.role === 'company' ? 'company' : 'homeowner'
      });

      // Return success without logging them in
      res.status(201).json({ 
        message: 'Registration successful! Please check your email to verify your account.',
        email: validatedData.email,
        requiresVerification: true
      });
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

      // Check if email is verified (except for admin)
      if (user.role !== 'admin' && !user.isEmailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email address before logging in. Check your inbox for the verification link.",
          requiresVerification: true,
          email: user.email
        });
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

  // Email verification endpoint
  app.get('/verify-email', async (req: any, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).send(`
          <html>
            <head><title>Invalid Link - FixConnect</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #d32f2f;">Invalid Verification Link</h1>
              <p>The verification link is missing or invalid.</p>
              <p><a href="/auth">Return to Login</a></p>
            </body>
          </html>
        `);
      }

      // Verify the token
      const user = await storage.verifyEmailToken(token as string);
      if (!user) {
        return res.status(400).send(`
          <html>
            <head><title>Expired Link - FixConnect</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #d32f2f;">Link Expired</h1>
              <p>This verification link has expired or is invalid.</p>
              <p>Please request a new verification email from the login page.</p>
              <p><a href="/auth" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to Login</a></p>
            </body>
          </html>
        `);
      }

      // Mark email as verified
      await storage.markEmailAsVerified(user.id);

      // Success page
      return res.send(`
        <html>
          <head><title>Email Verified - FixConnect</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <h1 style="color: #4CAF50;">Email Verified Successfully! ✅</h1>
              <p style="font-size: 18px; margin: 20px 0;">Welcome to FixConnect, ${user.firstName}!</p>
              <p>Your email address has been verified. You can now:</p>
              <ul style="text-align: left; display: inline-block;">
                ${user.role === 'company' ? 
                  `<li>Complete your company profile</li>
                   <li>Wait for admin approval</li>
                   <li>Start receiving service requests</li>` :
                  `<li>Browse maintenance companies</li>
                   <li>Request services for your property</li>
                   <li>Manage your service requests</li>`
                }
              </ul>
              <p style="margin-top: 30px;">
                <a href="/auth" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px;">
                  Login to Your Account
                </a>
              </p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).send(`
        <html>
          <head><title>Error - FixConnect</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #d32f2f;">Verification Error</h1>
            <p>An error occurred during email verification. Please try again.</p>
            <p><a href="/auth">Return to Login</a></p>
          </body>
        </html>
      `);
    }
  });

  // Resend verification email endpoint
  app.post('/api/auth/resend-verification', async (req: any, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await storage.setEmailVerificationToken(user.id, verificationToken, expires);

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}`
        : `http://localhost:5000`;
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      await sendVerificationEmail({
        firstName: user.firstName || 'User',
        email: user.email!,
        verificationLink,
        userType: user.role === 'company' ? 'company' : 'homeowner'
      });

      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });
}