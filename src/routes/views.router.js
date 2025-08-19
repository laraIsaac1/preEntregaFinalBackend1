import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";
import { ensureCart } from "../middlewares/ensureCart.js";

export const viewsRouter = Router();

viewsRouter.get("/products", ensureCart, async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = (() => {
      if (!query) return {};
      const str = String(query);
      const colon = str.indexOf(":");
      if (colon !== -1) {
        const key = str.slice(0, colon).trim().toLowerCase();
        const val = str.slice(colon + 1).trim();
        if (key === "category") return { category: val };
        if (key === "status") return { status: /^true$/i.test(val) };
      }
      if (/^(available|disponible)$/i.test(str)) return { status: true };
      if (/^(unavailable|nodisponible|no-disponible)$/i.test(str))
        return { status: false };
      return { category: str };
    })();

    const sortOption =
      sort === "asc"
        ? { price: 1 }
        : sort === "desc"
        ? { price: -1 }
        : undefined;

    const lim = Math.max(parseInt(limit, 10) || 10, 1);
    const pg = Math.max(parseInt(page, 10) || 1, 1);

    const total = await ProductModel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);
    const skip = (pg - 1) * lim;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(lim)
      .lean();

    const hasPrevPage = pg > 1;
    const hasNextPage = pg < totalPages;

    const base = "/products";
    const qs = new URLSearchParams();
    if (limit) qs.set("limit", lim);
    if (sort) qs.set("sort", sort);
    if (query) qs.set("query", query);

    const prevLink = hasPrevPage
      ? `${base}?${new URLSearchParams({
          ...Object.fromEntries(qs),
          page: pg - 1,
        })}`
      : null;
    const nextLink = hasNextPage
      ? `${base}?${new URLSearchParams({
          ...Object.fromEntries(qs),
          page: pg + 1,
        })}`
      : null;

    res.render("products/index", {
      title: "Pastelería — Catálogo",
      products,
      pagination: {
        page: pg,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      },
      cartId: req.cartId,
      query: query || "",
      sort: sort || "",
      limit: lim,
      isAdmin: req.query.admin === "1",
    });
  } catch (err) {
    next(err);
  }
});

viewsRouter.get("/products/:pid", ensureCart, async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await ProductModel.findById(pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("products/show", {
      title: product.title,
      product,
      cartId: req.cartId,
    });
  } catch (err) {
    next(err);
  }
});

// Vista de carrito
viewsRouter.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    const items = cart.products.map((it) => ({
      ...it,
      subtotal: (it.product?.price || 0) * it.quantity,
    }));

    const total = items.reduce((acc, it) => acc + it.subtotal, 0);
    res.render("carts/show", {
      title: `Carrito ${cart._id}`,
      cart: { ...cart, products: items },
      total,
    });
  } catch (err) {
    next(err);
  }
});
