import fs from "fs/promises";
import path from "path";
import { __dirname } from "../utils.js";

const dataFolderPath = path.join(__dirname, "data");
const cartsFilePath = path.join(dataFolderPath, "carts.json");

export class CartManager {
  constructor(filename = "carts.json") {
    this.path = cartsFilePath;
    this.carts = [];
    this.loadCarts();
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      const parsedData = JSON.parse(data);
      this.carts = parsedData.data || [];
    } catch (error) {
      this.carts = [];
    }
  }

  async saveCarts() {
    await fs.writeFile(
      this.path,
      JSON.stringify({ data: this.carts }, null, 2)
    );
  }

  async createCart() {
    const newCart = {
      id: this.carts.length > 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
      products: [],
    };
    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCarts() {
    await this.loadCarts();
    return [...this.carts];
  }

  async getCartById(id) {
    await this.loadCarts();
    return this.carts.find((cart) => cart.id === id);
  }

  async addProductToCart(id, productId) {
    let updatedCart;
    try {
      this.carts = await this.getCarts();
      const cartIndex = this.carts.findIndex((cart) => cart.id === id);

      if (cartIndex === -1) {
        throw new Error("Cart not found");
      }

      const cart = this.carts[cartIndex];
      const indexProd = cart.products.findIndex(
        (prod) => prod.id === productId
      );
      if (indexProd === -1) {
        cart.products.push({ id: productId, quantity: 1 });
      } else {
        cart.products[indexProd].quantity += 1;
      }

      updatedCart = cart;
      this.carts[cartIndex] = cart;

      await this.saveCarts();
      return updatedCart;
    } catch (error) {
      console.error("Error in addProductToCart:", error);
      throw error;
    }
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error("Cart not found");

    const productIndex = cart.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) throw new Error("Product not found in cart");

    cart.products.splice(productIndex, 1);
    await this.saveCarts();
    return cart;
  }

  async updateCartProducts(cartId, products) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error("Cart not found");

    cart.products = products;
    await this.saveCarts();
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error("Cart not found");

    const product = cart.products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found in cart");

    product.quantity = quantity;
    await this.saveCarts();
    return cart;
  }
}