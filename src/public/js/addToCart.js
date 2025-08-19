async function addToCart(cartId, productId, qty = 1) {
  const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: qty }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(`Error: ${err?.message || res.statusText}`);
    return;
  }
  alert("Producto agregado al carrito");
}

async function removeFromCart(cartId, productId) {
  const ok = confirm("¿Eliminar este producto del carrito?");
  if (!ok) return;

  const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(`Error: ${err?.message || res.statusText}`);
    return;
  }

  location.reload();
}

async function updateCartItemQty(cartId, productId, newQty) {
  if (newQty <= 0) {
    // si llega a 0, borramos el ítem
    return removeFromCart(cartId, productId);
  }
  const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(`Error: ${err?.message || res.statusText}`);
    return;
  }
  location.reload();
}

function decreaseQty(cartId, productId, currentQty) {
  updateCartItemQty(cartId, productId, currentQty - 1);
}

function increaseQty(cartId, productId, currentQty) {
  updateCartItemQty(cartId, productId, currentQty + 1);
}
