import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Enable CORS to allow requests from the client
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite dev server (default)
      'http://127.0.0.1:5173', // Alternative localhost
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    // Allow preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(PORT);
  console.log(`🚀 Server started on port: ${PORT}`);
}
bootstrap();
