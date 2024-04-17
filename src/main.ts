import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const docConfig = new DocumentBuilder()
    .setTitle('Nest api tutorial')
    .setDescription('Tutorial')
    .setVersion('0.0.1')
    .build();
  
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  await app.listen(5000);
}
bootstrap();
