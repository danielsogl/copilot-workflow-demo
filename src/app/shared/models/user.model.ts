export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "developer" | "manager" | "viewer";
  createdAt: string;
}
