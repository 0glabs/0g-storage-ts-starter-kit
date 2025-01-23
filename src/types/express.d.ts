import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      file?: {
        path: string;
        originalname: string;
        mimetype: string;
        size: number;
      };
    }
  }
} 