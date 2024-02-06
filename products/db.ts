import { Product } from './models';
import { faker } from '@faker-js/faker';

const products = new Map<string, Product>();

function saveProduct(product: Product) {
  products.set(product.id, product);
}

function findProductById(id: string) {
  return products.get(id);
}

saveProduct({ id: 'bc1c480d-a3f5-43bd-a416-ada79fd7c5b7', name: faker.commerce.productName(), stock: 10, price: 1 });
saveProduct({ id: '4ae5958e-4201-4e86-8c85-4f440ab2d7b5', name: faker.commerce.productName(), stock: 0, price: 20 });
saveProduct({ id: '2bdd8d8b-e160-466a-9ad3-7d1349f27c9a', name: faker.commerce.productName(), stock: 1, price: 2 });

export default {
  saveProduct,
  findProductById,
};
