import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 1. Enable Global Validation (so our DTOs work)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // 2. Configure OpenAPI (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Chong Nham API')
    .setDescription('The core e-commerce and management backend for Chong Nham')
    .setVersion('1.0')
    // This tells Swagger that our endpoints use JWT Bearer tokens
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This is an internal reference name we will use later
    )
    .build();

  // 3. Generate the document
  const document = SwaggerModule.createDocument(app, config);

  // 4. Setup the UI endpoint
  // You will be able to access the documentation at http://localhost:3000/api
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
