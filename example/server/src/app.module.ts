import { Module } from '@nestjs/common';
import { AppRouter } from './app.router';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppRouter],
  providers: [],
})
export class AppModule {}
