import { type User, type InsertUser, type Message, type InsertMessage, type AdminStatus, type UpdateAdminStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPassword(password: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  getUserMessages(userId: string): Promise<Message[]>;
  
  // Admin status operations
  getAdminStatus(): Promise<AdminStatus>;
  updateAdminStatus(status: UpdateAdminStatus): Promise<AdminStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private adminStatusData: AdminStatus;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.adminStatusData = {
      id: "admin_status",
      status: "available",
      updatedAt: new Date(),
    };
    
    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      name: "Orhan",
      password: "4499",
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPassword(password: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.password === password);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getAdminStatus(): Promise<AdminStatus> {
    return this.adminStatusData;
  }

  async updateAdminStatus(status: UpdateAdminStatus): Promise<AdminStatus> {
    this.adminStatusData = {
      ...this.adminStatusData,
      ...status,
      updatedAt: new Date(),
    };
    return this.adminStatusData;
  }
}

export const storage = new MemStorage();
