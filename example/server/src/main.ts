import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3000;

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

  // TODO remove this when implementing batch
  // Configure body parser to handle different content types
  app.use((req, res, next) => {
    // Handle string bodies by converting them to a format the server can process
    if (req.headers['content-type'] === 'application/json') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          // Try to parse as JSON first
          req.body = JSON.parse(body);
        } catch (error) {
          // If it's not valid JSON, treat it as a string
          req.body = body;
        }
        next();
      });
    } else {
      next();
    }
  });

  // Add global prefix if needed
  app.setGlobalPrefix('');

  await app.listen(PORT);
  console.log(`🚀 Server started on port: ${PORT}`);
}
bootstrap();
