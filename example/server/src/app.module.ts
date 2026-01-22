import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [UserModule, FilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
