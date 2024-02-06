import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as E from 'fp-ts/Either';
import { useCaseGetProducts, useCaseOrderProducts } from './usecases';
import { Product } from './models';

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

type GetProductsByIdsParams = {
  ids: string[];
};

type GetProductsByIdsOutput = {
  products: Product[];
};

type OrderProductsParams = {
  products: { id: string; amount: number }[];
};

type OrderProductsOutput = {
  products: Product[];
};

async function main() {
  const server = new grpc.Server();
  server.addService(productsProto.ProductsService.service, {
    getProductsByIds: (
      call: grpc.ServerUnaryCall<GetProductsByIdsParams, GetProductsByIdsOutput>,
      callback: grpc.sendUnaryData<GetProductsByIdsOutput>
    ) => {
      const ids = call.request.ids;
      const getProducts = useCaseGetProducts();
      const result = getProducts(ids);
      if (E.isRight(result)) return callback(null, { products: result.right });
      const error = new GRPCError(grpc.status.NOT_FOUND, `Product ${result.left.productId} not found`);
      callback(error, null);
    },
    orderProducts: (
      call: grpc.ServerUnaryCall<OrderProductsParams, OrderProductsParams>,
      callback: grpc.sendUnaryData<OrderProductsOutput>
    ) => {
      const orderProducts = useCaseOrderProducts();
      const products = orderProducts(call.request.products);
      if (E.isRight(products)) return callback(null, { products: products.right });
      const error = new GRPCError(
        grpc.status.INVALID_ARGUMENT,
        `Product ${products.left.productId} does not have enough stock`
      );
      return callback(error, null);
    },
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('grpc server started');
  });
}

main();
