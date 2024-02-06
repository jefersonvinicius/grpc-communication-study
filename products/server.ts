import express from 'express';
import morgan from 'morgan';
import * as E from 'fp-ts/Either';
import { useCaseGetProducts, useCaseOrderProducts } from './usecases';

const server = express();

server.use(morgan('dev'));
server.use(express.json());

server.get('/products', (request, response) => {
  const ids = request.query.ids as string[];
  const getProducts = useCaseGetProducts();
  const result = getProducts(ids);
  if (E.isLeft(result)) return response.status(404).json({ message: `Product ${result.left.productId} not found` });

  return response.json({ products: result.right });
});

server.patch('/products/order', (request, response) => {
  const orderProducts = useCaseOrderProducts();
  const products = orderProducts(request.body.products);
  return response.json({ products });
});

server.listen(3331, () => {
  console.log('Serving at port 3331');
});
