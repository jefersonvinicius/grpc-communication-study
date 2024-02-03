import { Order } from './models';

const orders = new Map<string, Order>();

function saveOrder(order: Order) {
  orders.set(order.id, order);
}

function listOrders() {
  return Array.from(orders.values());
}

export default {
  saveOrder,
  listOrders,
};
