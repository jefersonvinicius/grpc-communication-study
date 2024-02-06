import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import productsGateway from './products-gateway';
import { Order } from './models';
import { randomUUID } from 'crypto';
import db from './db';
import morgan from 'morgan';

const server = express();

server.use(express.json());
server.use(morgan('dev'));

server.post('/orders', async (request, response) => {
  const items = request.body.items as { id: string; amount: number }[];
  const products = await productsGateway.grpc.fetchProducts(items.map((item) => item.id));
  const order: Order = {
    id: randomUUID(),
    items: products.map((product) => {
      const amount = items.find((item) => item.id === product.id)?.amount || 0;
      return { id: product.id, amount, price: product.price, name: product.name };
    }),
    total: items.reduce((total, item) => {
      const product = products.find((product) => product.id === item.id);
      const priceTotal = product?.price ?? 0 * item.amount;
      return total + priceTotal;
    }, 0),
    created_at: new Date(),
  };
  db.saveOrder(order);
  await productsGateway.grpc.orderProducts(items);
  return response.sendStatus(201);
});

server.get('/orders', (_, response) => {
  return response.json({ order: db.listOrders() });
});

server.use((error: any, __: Request, response: Response, _: NextFunction) => {
  console.log({ error });
  return response.status(500).json({ message: 'Server error' });
});

server.listen(3333, () => {
  console.log('Serving at 3333');
});
