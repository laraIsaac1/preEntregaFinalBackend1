# Pastelería — Backend (Entrega Final)

Servidor Express con MongoDB y Handlebars para gestionar productos y carritos de una pastelería.

## Requisitos
- Node 18+
- MongoDB local o Atlas

## Setup
1. `cp .env.example .env` y completar `MONGODB_URI`.
2. `npm install`
3. `npm run seed`
4. `npm run dev`

## Endpoints clave
- `GET /api/products?limit&sort&query&page`
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`
- `POST /api/carts`
- `GET /api/carts/:cid` (populate)
- `POST /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid` (reemplaza arreglo)
- `PUT /api/carts/:cid/products/:pid` (actualiza cantidad)
- `DELETE /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`

## Vistas
- `/products` — catálogo con paginación y agregar al carrito
- `/products/:pid` — detalle de producto
- `/carts/:cid` — ver carrito
