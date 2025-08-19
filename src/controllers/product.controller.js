import { ProductModel } from "../models/product.model.js";
import { buildPageLinks } from "../utils/buildLinks.js";

function parseQueryParam(q) {
  if (!q) return {};
  // Permite: query=category:alfajores  | query=status:true | query=available
  const str = String(q).trim();
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
}

export async function getProducts(req, res, next) {
  try {
    const {
      limit: limitRaw = "10",
      page: pageRaw = "1",
      sort,
      query,
    } = req.query;

    const limit = Math.max(parseInt(limitRaw, 10) || 10, 1);
    const page = Math.max(parseInt(pageRaw, 10) || 1, 1);

    const filter = parseQueryParam(query);

    const sortOption = ((s) => {
      if (!s) return undefined;
      if (String(s).toLowerCase() === "asc") return { price: 1 };
      if (String(s).toLowerCase() === "desc") return { price: -1 };
      return undefined;
    })(sort);

    const totalDocs = await ProductModel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const skip = (page - 1) * limit;

    const payload = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const basePath = "/api/products";
    const { prevLink, nextLink } = buildPageLinks(
      basePath,
      { page, limit, sort, query },
      hasPrevPage,
      hasNextPage
    );

    return res.json({
      status: "success",
      payload,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { pid } = req.params;
    const product = await ProductModel.findById(pid).lean();
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    res.json({ status: "success", payload: product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      price,
      stock,
      status = true,
      code,
      thumbnails = [],
    } = req.body;
    if (
      !title ||
      !description ||
      !category ||
      price == null ||
      stock == null ||
      !code
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message:
            "Datos faltantes: title, description, category, price, stock, code son obligatorios",
        });
    }
    const exists = await ProductModel.findOne({ code });
    if (exists)
      return res
        .status(409)
        .json({
          status: "error",
          message: "Ya existe un producto con ese code",
        });

    const doc = await ProductModel.create({
      title,
      description,
      category,
      price,
      stock,
      status,
      code,
      thumbnails,
    });
    res.status(201).json({ status: "success", payload: doc });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { pid } = req.params;
    const update = req.body || {};
    if (update.code) {
      const dup = await ProductModel.findOne({
        code: update.code,
        _id: { $ne: pid },
      });
      if (dup)
        return res
          .status(409)
          .json({ status: "error", message: "code en uso por otro producto" });
    }
    const doc = await ProductModel.findByIdAndUpdate(pid, update, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    res.json({ status: "success", payload: doc });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { pid } = req.params;
    const doc = await ProductModel.findByIdAndDelete(pid);
    if (!doc)
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (err) {
    next(err);
  }
}
