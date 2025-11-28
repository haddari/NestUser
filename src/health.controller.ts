import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class HealthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root() {
    return this.appService.getHello();
  }
}
