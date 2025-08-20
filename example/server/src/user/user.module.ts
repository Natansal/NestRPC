import { Module } from '@nestjs/common';
import { UserMutationsRouter } from './user.mutations.router';
import { UserQueriesRouter } from './user.queries.router';

@Module({
  exports: [],
  providers: [UserQueriesRouter, UserMutationsRouter],
})
export class UserModule {}
