import { Module } from '@nestjs/common';
import { UserMutationsRouter } from './user.mutations.router';
import { UserQueriesRouter } from './user.queries.router';

@Module({
  exports: [],
  controllers: [UserQueriesRouter, UserMutationsRouter],
  providers: [],
})
export class UserModule {}
