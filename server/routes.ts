import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, updateAdminStatusSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = loginSchema.parse(req.body);
      const user = await storage.getUserByPassword(password);
      
      if (!user) {
        return res.status(401).json({ message: "Geçersiz şifre" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if password already exists
      const existingUser = await storage.getUserByPassword(userData.password);
      if (existingUser) {
        return res.status(400).json({ message: "Bu şifre zaten kullanılıyor" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.filter(user => !user.isAdmin));
    } catch (error) {
      res.status(500).json({ message: "Kullanıcılar alınamadı" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Kullanıcı alınamadı" });
    }
  });

  // Messages
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Mesajlar alınamadı" });
    }
  });

  app.get("/api/messages/between/:userId1/:userId2", async (req, res) => {
    try {
      const { userId1, userId2 } = req.params;
      const messages = await storage.getMessagesBetweenUsers(userId1, userId2);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Mesajlar alınamadı" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Geçersiz mesaj verisi" });
    }
  });

  // Admin status
  app.get("/api/admin/status", async (req, res) => {
    try {
      const status = await storage.getAdminStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Admin durumu alınamadı" });
    }
  });

  app.put("/api/admin/status", async (req, res) => {
    try {
      const statusData = updateAdminStatusSchema.parse(req.body);
      const status = await storage.updateAdminStatus(statusData);
      res.json(status);
    } catch (error) {
      res.status(400).json({ message: "Geçersiz durum verisi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
