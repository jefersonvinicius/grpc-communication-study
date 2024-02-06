import axios from 'axios';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { Product } from './models';

const packageDefinition = protoLoader.loadSync('./products.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productsProto: any = grpc.loadPackageDefinition(packageDefinition).products;

const productsService = new productsProto.ProductsService('0.0.0.0:50051', grpc.credentials.createInsecure());

type OrderProductRequest = { id: string; amount: number };

export default {
  http: {
    async fetchProducts(ids: string[]): Promise<Product[]> {
      const { data } = await axios.get('http://localhost:3331/products', { params: { ids } });
      return data.products;
    },

    async orderProducts(products: OrderProductRequest[]): Promise<void> {
      await axios.patch('http://localhost:3331/products/order', { products });
    },
  },
  grpc: {
    async fetchProducts(ids: string[]): Promise<Product[]> {
      return new Promise((resolve, reject) => {
        productsService.getProductsByIds({ ids }, (error: any, response: any) => {
          if (error) reject(error);
          else resolve(response.products);
        });
      });
    },
    async orderProducts(productsRequests: OrderProductRequest[]): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        productsService.orderProducts({ products: productsRequests }, (error: any) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
  },
};
