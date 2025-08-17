import { type InferNestRpcRouterApp } from 'server';
import { type ConfigType } from './nest-rpc.config';

export type NestRPCConfigType = InferNestRpcRouterApp<ConfigType>;
