import { Module } from '@nestjs/common';
import { AppRouter } from './app.router';
import { NestRPCModule } from 'server';
import { config } from './nest-rpc.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    NestRPCModule.forRoot({
      routes: config,
      apiPrefix: 'api',
    }),
    UserModule,
  ],
  controllers: [],
  providers: [AppRouter],
})
export class AppModule {}
