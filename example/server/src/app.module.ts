import { Module } from '@nestjs/common';
import { AppRouter } from './app.router';
import { NestRPCModule } from 'server';
import { config } from './nest-rpc.config';

@Module({
  imports: [
    NestRPCModule.forRoot({
      apiPrefix: '/nest-rpc',
      routes: config,
    }),
  ],
  controllers: [],
  providers: [AppRouter],
})
export class AppModule {}
