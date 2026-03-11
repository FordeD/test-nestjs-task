import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '../../repositories/user';
import { UserService } from './user.service';

@Module({
  imports: [UserRepositoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
