export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message: string;
  data?: {
    userId: string | number;
    role: string;
    email: string;
    name: string;
    phone: string;
    isProfileComplete: boolean;
    isSubscribed: boolean;
    requiresPayment: boolean;
  };
}
