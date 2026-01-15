import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(payload: any) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUserCredentials(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`Login failed: User not found with email ${email}`);
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    this.logger.warn(`Login failed: Password mismatch for ${email}`);
    return null;
  }

  async register(data: { email: string; password: string; name: string }) {
    this.logger.log(`Registration attempt for ${data.email}`);
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      this.logger.warn(
        `Registration failed: Email ${data.email} already exists`,
      );
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      },
    });

    const { password, ...result } = user;
    return this.login(result); // Auto login
  }
}
