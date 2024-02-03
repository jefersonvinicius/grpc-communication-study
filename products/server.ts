import express from 'express';
import db from './db';
import { faker } from '@faker-js/faker';
import morgan from 'morgan';
import * as E from 'fp-ts/Either';
import { useCaseGetProducts } from './usecases';

db.saveProduct({ id: 'bc1c480d-a3f5-43bd-a416-ada79fd7c5b7', name: faker.commerce.productName(), stock: 10, price: 1 });
db.saveProduct({ id: '4ae5958e-4201-4e86-8c85-4f440ab2d7b5', name: faker.commerce.productName(), stock: 0, price: 20 });
db.saveProduct({ id: '2bdd8d8b-e160-466a-9ad3-7d1349f27c9a', name: faker.commerce.productName(), stock: 1, price: 2 });

const server = express();

server.use(morgan('dev'));
server.use(express.json());

server.get('/rest/products', (request, response) => {
  const ids = request.query.ids as string[];
  const getProducts = useCaseGetProducts();
  const result = getProducts(ids);
  if (E.isLeft(result)) return response.status(404).json({ message: `Product ${result.left.productId} not found` });

  return response.json({ products: result.right });
});

server.patch('/rest/products/order', (request, response) => {
  const productsRequests = request.body.products.reduce((result, current) => {
    result[current.id] = current;
    return result;
  });
  const products = Object.keys(productsRequests).map((productId) => db.findProductById(productId));

  products.forEach((product) => {
    if (!product) return;
    product.stock -= productsRequests[product.id].amount;
    db.saveProduct(product);
  });
  return response.json({ products });
});

server.listen(3331, () => {
  console.log('Serving at port 3331');
});
