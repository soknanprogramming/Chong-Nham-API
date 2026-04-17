import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // Crucial: Allows AuthModule to inject this
})
export class UsersModule {}
