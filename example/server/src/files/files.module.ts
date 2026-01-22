import { Module } from '@nestjs/common';
import { FilesRouter } from './files.router';

@Module({
  exports: [],
  controllers: [FilesRouter],
  providers: [],
})
export class FilesModule {}
