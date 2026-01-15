import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma/prisma.health'; // We need to create this too, or just check generic DB connectivity

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator,
        private db: PrismaHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'), // Example external check
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.db.isHealthy('database'),
        ]);
    }
}
