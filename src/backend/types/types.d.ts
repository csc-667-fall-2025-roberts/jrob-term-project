export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface SecureUser extends User {
  password: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: Date;
}
