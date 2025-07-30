// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  messages;
  adminStatusData;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.adminStatusData = {
      id: "admin_status",
      status: "available",
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.createDefaultAdmin();
  }
  async createDefaultAdmin() {
    const adminId = randomUUID();
    const admin = {
      id: adminId,
      name: "Orhan",
      password: "4499",
      isAdmin: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(adminId, admin);
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByPassword(password) {
    return Array.from(this.users.values()).find((user) => user.password === password);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async createMessage(insertMessage) {
    const id = randomUUID();
    const message = {
      ...insertMessage,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  async getMessagesBetweenUsers(userId1, userId2) {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId1 && message.receiverId === userId2 || message.senderId === userId2 && message.receiverId === userId1
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async getUserMessages(userId) {
    return Array.from(this.messages.values()).filter((message) => message.senderId === userId || message.receiverId === userId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async getAdminStatus() {
    return this.adminStatusData;
  }
  async updateAdminStatus(status) {
    this.adminStatusData = {
      ...this.adminStatusData,
      ...status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.adminStatusData;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  password: text("password").notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var adminStatus = pgTable("admin_status", {
  id: varchar("id").primaryKey().default("admin_status"),
  status: text("status", { enum: ["available", "busy"] }).notNull().default("available"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var updateAdminStatusSchema = createInsertSchema(adminStatus).pick({
  status: true
});

// server/routes.ts
import { z } from "zod";
var loginSchema = z.object({
  password: z.string().min(1)
});
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = loginSchema.parse(req.body);
      const user = await storage.getUserByPassword(password);
      if (!user) {
        return res.status(401).json({ message: "Ge\xE7ersiz \u015Fifre" });
      }
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Ge\xE7ersiz veri" });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByPassword(userData.password);
      if (existingUser) {
        return res.status(400).json({ message: "Bu \u015Fifre zaten kullan\u0131l\u0131yor" });
      }
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Ge\xE7ersiz veri" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2.filter((user) => !user.isAdmin));
    } catch (error) {
      res.status(500).json({ message: "Kullan\u0131c\u0131lar al\u0131namad\u0131" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Kullan\u0131c\u0131 al\u0131namad\u0131" });
    }
  });
  app2.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages2 = await storage.getUserMessages(userId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Mesajlar al\u0131namad\u0131" });
    }
  });
  app2.get("/api/messages/between/:userId1/:userId2", async (req, res) => {
    try {
      const { userId1, userId2 } = req.params;
      const messages2 = await storage.getMessagesBetweenUsers(userId1, userId2);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Mesajlar al\u0131namad\u0131" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Ge\xE7ersiz mesaj verisi" });
    }
  });
  app2.get("/api/admin/status", async (req, res) => {
    try {
      const status = await storage.getAdminStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Admin durumu al\u0131namad\u0131" });
    }
  });
  app2.put("/api/admin/status", async (req, res) => {
    try {
      const statusData = updateAdminStatusSchema.parse(req.body);
      const status = await storage.updateAdminStatus(statusData);
      res.json(status);
    } catch (error) {
      res.status(400).json({ message: "Ge\xE7ersiz durum verisi" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
