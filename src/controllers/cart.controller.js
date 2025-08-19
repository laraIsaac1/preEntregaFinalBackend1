import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

export async function createCart(req, res, next) {
  try {
    const cart = await CartModel.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
}

export async function getCart(req, res, next) {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
}

export async function addProductToCart(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;
    if (quantity <= 0) return res.status(400).json({ status: 'error', message: 'quantity debe ser > 0' });

    const prod = await ProductModel.findById(pid);
    if (!prod) return res.status(404).json({ status: 'error', message: 'Producto no existe' });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx === -1) {
      cart.products.push({ product: pid, quantity });
    } else {
      cart.products[idx].quantity += quantity;
    }
    await cart.save();

    const populated = await cart.populate('products.product');
    res.status(201).json({ status: 'success', payload: populated });
  } catch (err) { next(err); }
}

export async function updateCartProducts(req, res, next) {
  try {
    const { cid } = req.params;
    let { products } = req.body; // [{ product, quantity }]
    if (!Array.isArray(products)) return res.status(400).json({ status: 'error', message: 'Se espera un arreglo de productos' });

    // Validar que existan los productos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ status: 'error', message: 'Cada item debe tener product y quantity > 0' });
      }
      const exists = await ProductModel.exists({ _id: item.product });
      if (!exists) return res.status(400).json({ status: 'error', message: `Producto no válido: ${item.product}` });
    }

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: products.map(p => ({ product: p.product, quantity: p.quantity })) },
      { new: true }
    ).populate('products.product');

    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
}

export async function updateProductQty(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ status: 'error', message: 'quantity debe ser > 0' });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx === -1) return res.status(404).json({ status: 'error', message: 'Producto no está en el carrito' });

    cart.products[idx].quantity = quantity;
    await cart.save();

    const populated = await cart.populate('products.product');
    res.json({ status: 'success', payload: populated });
  } catch (err) { next(err); }
}

export async function deleteProductFromCart(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    const before = cart.products.length;
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    if (cart.products.length === before) return res.status(404).json({ status: 'error', message: 'Producto no estaba en el carrito' });
    await cart.save();
    const populated = await cart.populate('products.product');
    res.json({ status: 'success', payload: populated });
  } catch (err) { next(err); }
}

export async function clearCart(req, res, next) {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true }).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
}
