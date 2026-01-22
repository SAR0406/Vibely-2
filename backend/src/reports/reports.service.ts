import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async create(reporterId: string, data: any) {
        return this.prisma.report.create({
            data: {
                type: data.type,
                reporterId,
                targetId: data.targetId || null,
                reason: data.category || data.reason,
                description: data.description || null,
                status: 'OPEN',
            },
        });
    }
}
