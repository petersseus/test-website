document.addEventListener("DOMContentLoaded", function() {
    const cartBody = document.getElementById('cart-body');
    const totalUniqueProductsDisplay = document.getElementById('total-unique-products');
    const totalQuantityDisplay = document.getElementById('total-quantity');
    const totalAmountDisplay = document.getElementById('total-amount');

    // Handle input events on price changes
    const priceInputs = document.querySelectorAll('.price-change');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const stdPrice = parseFloat(row.querySelector('.unit-price-std').textContent);
            const change = parseFloat(this.value) || 0;
            const newPrice = stdPrice + change;
            const percentChange = (change / stdPrice) * 100;

            row.querySelector('.price-in-use').textContent = newPrice.toFixed(2);
            row.querySelector('.percent-change').textContent = `${percentChange.toFixed(2)}%`;

            const quantityInput = row.querySelector('.quantity');
            const addButton = row.querySelector('.add-cart');
            addButton.disabled = parseInt(quantityInput.value, 10) <= 0;
        });
    });

    // Handle quantity input changes
    const quantityInputs = document.querySelectorAll('.quantity');
    quantityInputs.forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const addButton = row.querySelector('.add-cart');
            addButton.disabled = !parseInt(this.value, 10) > 0;
        });
    });

    // Add items to the cart
    document.querySelectorAll('.add-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productRow = this.closest('tr');
            addToCart(productRow);
            disableRow(productRow);
        });
    });

    function addToCart(productRow) {
        const productId = productRow.querySelector('td:nth-child(2)').textContent;
        const productImg = productRow.querySelector('img').src;
        const priceInUse = parseFloat(productRow.querySelector('.price-in-use').textContent);
        const quantity = parseInt(productRow.querySelector('.quantity').value, 10);

        // Check if item already exists in cart
        let existingRow = Array.from(cartBody.querySelectorAll('tr')).find(row => row.querySelector('td:nth-child(2)').textContent === productId);
        if (existingRow) {
            // Update quantity and subtotal if item exists
            let currentQuantity = parseInt(existingRow.querySelector('.cart-quantity').textContent);
            currentQuantity += quantity;
            existingRow.querySelector('.cart-quantity').textContent = currentQuantity;
            existingRow.querySelector('.cart-subtotal').textContent = (currentQuantity * priceInUse).toFixed(2);
        } else {
            // Add new row if item does not exist
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><img src="${productImg}" alt="Product Image" width="50" height="50"></td>
                <td>${productId}</td>
                <td>${priceInUse.toFixed(2)}</td>
                <td class="cart-quantity">${quantity}</td>
                <td class="cart-subtotal">${(quantity * priceInUse).toFixed(2)}</td>
                <td><button class="btn btn-danger remove-item">Remove</button></td>
            `;
            cartBody.appendChild(newRow);

            newRow.querySelector('.remove-item').addEventListener('click', function() {
                newRow.remove();
                enableRow(productRow);
                updateTotals();
            });
        }
        updateTotals();
    }

    function disableRow(row) {
        row.querySelectorAll('input, button').forEach(element => {
            element.disabled = true;
        });
    }

    function enableRow(row) {
        row.querySelectorAll('input, button').forEach(element => {
            element.disabled = false;
        });
        row.querySelector('.price-change').value = ""; // Clear the price change input
        row.querySelector('.quantity').value = ""; // Clear the quantity input
        row.querySelector('.add-cart').disabled = true; // Keep 'Add to Cart' button disabled until inputs are valid
    }

    function updateTotals() {
      const rows = cartBody.querySelectorAll('tr');
      const totalUniqueProducts = rows.length;
      let totalQuantity = 0;
      let totalAmount = 0;

      rows.forEach(row => {
        const quantity = parseInt(row.querySelector('.cart-quantity').textContent, 10);
        const subtotal = parseFloat(row.querySelector('.cart-subtotal').textContent);
        totalQuantity += quantity;
        totalAmount += subtotal;
      });

      totalUniqueProductsDisplay.textContent = totalUniqueProducts;
      totalQuantityDisplay.textContent = totalQuantity;
      totalAmountDisplay.textContent = totalAmount.toFixed(2);

      // Enable or disable the export button based on cart contents
      document.getElementById('export-cart').disabled = (totalUniqueProducts === 0);
    }
});

document.getElementById('export-cart').addEventListener('click', function() {
  const confirmation = confirm("Please confirm the finish of adding cart");
  if (confirmation) {
    const customerName = prompt("Please enter the customer name:");
    if (customerName) {
      exportCartData(customerName);
    }
  }
});

function exportCartData(customerName) {
  const cartItems = [];
  document.querySelectorAll('#cart-body tr').forEach(row => {
    const item = {
      productId: row.children[1].textContent,
      unitPrice: row.children[2].textContent,
      quantity: row.children[3].textContent,
      subtotal: row.children[4].textContent
    };
    cartItems.push(item);
  });

  const jsonData = JSON.stringify(cartItems);
  const blob = new Blob([jsonData], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  link.download = `${date} ${customerName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
