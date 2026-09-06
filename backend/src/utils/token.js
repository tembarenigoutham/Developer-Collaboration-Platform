import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Sign a JWT token for a user
 * @param {Object} payload { id, email, name }
 * @returns {string} token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
