import axios from 'axios';

export default {
  async fetchProducts(ids: string[]) {
    const { data } = await axios.get('http://localhost:3331/rest/products', { params: { ids } });
    return data.products;
  },

  async orderProducts(products: { id: string; amount: number }[]) {
    await axios.patch('http://localhost:3331/rest/products/order', { products });
  },
};
