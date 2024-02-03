import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as E from 'fp-ts/Either';
import { useCaseGetProducts } from './usecases';

const packageDefinition = protoLoader.loadSync('./products.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const packageObject = grpc.loadPackageDefinition(packageDefinition);
const productsProto = packageObject.products as any;

class GRPCError extends Error {
  constructor(readonly code: grpc.status, message: string) {
    super(message);
  }
}

async function main() {
  const server = new grpc.Server();
  server.addService(productsProto.ProductsService.service, {
    getProductsByIds: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      const ids = call.request.ids;
      const getProducts = useCaseGetProducts();
      const result = getProducts(ids);
      if (E.isRight(result)) return callback(null, { products: result.right });
      const error = new GRPCError(grpc.status.NOT_FOUND, `Product ${result.left.productId} not found`);
      callback(error, null);
    },
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('grpc server started');
  });
}

main();
