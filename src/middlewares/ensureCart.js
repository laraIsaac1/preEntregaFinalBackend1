// src/middlewares/ensureCart.js
import cookieParser from "cookie-parser";
import { CartModel } from "../models/cart.model.js";

export const cookies = cookieParser();

export async function ensureCart(req, res, next) {
  try {
    let cartId = req.cookies?.cartId;

    // Si hay cookie pero el carrito ya no existe en BD, crea uno nuevo
    if (cartId) {
      const exists = await CartModel.exists({ _id: cartId });
      if (!exists) cartId = null;
    }

    // Si no hay cartId válido, crear carrito vacío y setear cookie
    if (!cartId) {
      const cart = await CartModel.create({ products: [] });
      cartId = cart._id.toString();
      res.cookie("cartId", cartId, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      });
      console.log("🛒 Carrito creado y cookie seteada:", cartId);
    }

    req.cartId = cartId;
    next();
  } catch (err) {
    next(err);
  }
}
