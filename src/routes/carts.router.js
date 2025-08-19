import { Router } from "express";
import {
  addProductToCart,
  clearCart,
  createCart,
  deleteProductFromCart,
  getCart,
  updateCartProducts,
  updateProductQty,
} from "../controllers/cart.controller.js";

export const cartsRouter = Router();

cartsRouter.post("/", createCart);

cartsRouter.get("/:cid", getCart);

cartsRouter.post("/:cid/products/:pid", addProductToCart);

cartsRouter.delete("/:cid/products/:pid", deleteProductFromCart);

cartsRouter.put("/:cid", updateCartProducts);

cartsRouter.put("/:cid/products/:pid", updateProductQty);

cartsRouter.delete("/:cid", clearCart);
