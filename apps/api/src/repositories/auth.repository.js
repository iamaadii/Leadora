import { userRepository } from './user.repository.js';
import { refreshTokenRepository } from './refresh-token.repository.js';

export const authRepository = {
  ...userRepository,
  ...refreshTokenRepository,
};

