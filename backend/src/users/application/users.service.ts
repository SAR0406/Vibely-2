import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) { }

  async searchUsers(query: string, currentUserId: string) {
    return this.userRepository.search(query, currentUserId);
  }

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  async updateProfile(userId: string, data: any) {
    return this.userRepository.update(userId, data);
  }

  async updateStatus(userId: string, isOnline: boolean) {
    try {
      return await this.userRepository.updateStatus(userId, isOnline);
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}
