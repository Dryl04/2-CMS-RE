import { Module } from '@nestjs/common';
import { GlobalHfController } from './global-hf.controller';
import { GlobalHfService } from './global-hf.service';

@Module({
  controllers: [GlobalHfController],
  providers: [GlobalHfService],
  exports: [GlobalHfService],
})
export class GlobalHfModule {}
