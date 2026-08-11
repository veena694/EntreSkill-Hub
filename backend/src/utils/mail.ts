import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  console.log(`[Email Mock] Sending verification email to ${email}. Token: ${token}`);
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  console.log(`[Email Mock] Sending password reset email to ${email}. Token: ${token}`);
};
