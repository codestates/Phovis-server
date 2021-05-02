import session from 'express-session';
import express from 'express';
declare module 'express-session' {
  export interface SessionData {
    token?: string;
  }
}

declare module 'express' {
  export interface Request {
    checkedId?: string;
  }
}
