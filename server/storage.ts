import { users, clients, invoices, enquiries, type User, type InsertUser, type Client, type InsertClient, type Invoice, type InsertInvoice, type Enquiry, type InsertEnquiry } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Invoice methods
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByClient(clientId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Enquiry methods
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  updateEnquiry(id: number, enquiry: Partial<InsertEnquiry>): Promise<Enquiry | undefined>;
  deleteEnquiry(id: number): Promise<boolean>;

  // Statistics
  getStats(): Promise<{
    totalRevenue: number;
    pendingInvoices: number;
    activeClients: number;
    openEnquiries: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  private enquiries: Map<number, Enquiry>;
  private currentUserId: number;
  private currentClientId: number;
  private currentInvoiceId: number;
  private currentEnquiryId: number;
  private invoiceNumberCounter: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.invoices = new Map();
    this.enquiries = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentInvoiceId = 1;
    this.currentEnquiryId = 1;
    this.invoiceNumberCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date(),
      phone: insertClient.phone || null,
      address: insertClient.address || null,
      company: insertClient.company || null
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated: Client = { ...existing, ...clientData };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.clientId === clientId);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(this.invoiceNumberCounter++).padStart(3, '0')}`;
    
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      invoiceNumber,
      createdAt: new Date() 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;
    
    const updated: Invoice = { ...existing, ...invoiceData };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Enquiry methods
  async getEnquiries(): Promise<Enquiry[]> {
    return Array.from(this.enquiries.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEnquiry(id: number): Promise<Enquiry | undefined> {
    return this.enquiries.get(id);
  }

  async createEnquiry(insertEnquiry: InsertEnquiry): Promise<Enquiry> {
    const id = this.currentEnquiryId++;
    const enquiry: Enquiry = { 
      ...insertEnquiry, 
      id, 
      createdAt: new Date() 
    };
    this.enquiries.set(id, enquiry);
    return enquiry;
  }

  async updateEnquiry(id: number, enquiryData: Partial<InsertEnquiry>): Promise<Enquiry | undefined> {
    const existing = this.enquiries.get(id);
    if (!existing) return undefined;
    
    const updated: Enquiry = { ...existing, ...enquiryData };
    this.enquiries.set(id, updated);
    return updated;
  }

  async deleteEnquiry(id: number): Promise<boolean> {
    return this.enquiries.delete(id);
  }

  // Statistics
  async getStats(): Promise<{
    totalRevenue: number;
    pendingInvoices: number;
    activeClients: number;
    openEnquiries: number;
  }> {
    const invoices = Array.from(this.invoices.values());
    const enquiries = Array.from(this.enquiries.values());
    
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;
    const activeClients = this.clients.size;
    const openEnquiries = enquiries.filter(enq => enq.status === 'open').length;

    return {
      totalRevenue,
      pendingInvoices,
      activeClients,
      openEnquiries,
    };
  }
}

export const storage = new MemStorage();
