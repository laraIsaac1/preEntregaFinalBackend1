function readBool(v) {
  return String(v).toLowerCase() === "true" || v === "1";
}

async function createProductFromForm(e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    category: form.category.value.trim(),
    price: Number(form.price.value),
    stock: Number(form.stock.value),
    status: readBool(form.status.value),
    code: form.code.value.trim(),
    thumbnails: form.thumbnails.value
      ? form.thumbnails.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };

  if (
    !data.title ||
    !data.description ||
    !data.category ||
    !data.code ||
    isNaN(data.price) ||
    isNaN(data.stock)
  ) {
    alert("Completá: title, description, category, price, stock, code");
    return;
  }

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    alert(`Error: ${json?.message || json?.error || res.statusText}`);
    return;
  }

  alert("Producto creado ✅");
  // Recargamos para verlo en la grilla (respetando query/orden actual)
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-create-product-form");
  if (form) form.addEventListener("submit", createProductFromForm);
});
