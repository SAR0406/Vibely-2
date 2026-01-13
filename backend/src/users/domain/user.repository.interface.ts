export interface IUserRepository {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findByUsername(username: string): Promise<any>;
  search(query: string, excludeId: string): Promise<any[]>;
  update(id: string, data: any): Promise<any>;
  updateStatus(id: string, isOnline: boolean): Promise<any>;
}

export const IUserRepository = Symbol('IUserRepository');
