import db from './db';
import { Product } from './models';
import * as E from 'fp-ts/Either';

type GetProductsError = { error: 'PRODUCT_NOT_FOUND'; productId: string };

export function useCaseGetProducts() {
  return (ids: string[]): E.Either<GetProductsError, Product[]> => {
    const result: Product[] = [];
    for (const id of ids) {
      const product = db.findProductById(id);
      if (!product) return E.left({ error: 'PRODUCT_NOT_FOUND', productId: id });
      result.push(product);
    }
    return E.right(result);
  };
}

type OrderProductsError = { error: 'STOCK_NOT_ENOUGH'; productId: string; currentStock: number; stockRequired: number };

type ProductOrderRequest = { id: string; amount: number };

export function useCaseOrderProducts() {
  return (productRequestsList: ProductOrderRequest[]): E.Either<OrderProductsError, Product[]> => {
    const productsRequests = productRequestsList.reduce((result, current) => {
      result[current.id] = current;
      return result;
    }, {} as Record<string, ProductOrderRequest>);

    const products = Object.keys(productsRequests)
      .map((productId) => db.findProductById(productId)!)
      .filter((product) => !!product);

    for (const product of products) {
      const stockRequired = productsRequests[product.id].amount;
      if (stockRequired > product.stock) {
        return E.left({ error: 'STOCK_NOT_ENOUGH', productId: product.id, currentStock: product.stock, stockRequired });
      }
    }

    products.forEach((product) => {
      if (!product) return;
      product.stock -= productsRequests[product.id].amount;
      db.saveProduct(product);
    });
    return E.right(products);
  };
}
