const KEY = "schoolInventory";

function getItems() {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
}

function saveItems(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// Display inventory records
function displayInventory(filter = "") {
    const tbody = document.getElementById("inventoryRows");
    if (!tbody) return;

    const items = getItems().filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (items.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6">No inventory records found.</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.category)}</td>
            <td>${item.quantity}</td>
            <td>${item.minimum}</td>
            <td>
                <span class="status ${
                    item.quantity <= item.minimum ? "low" : "good"
                }">
                ${item.quantity <= item.minimum ? "Low Stock" : "In Stock"}
                </span>
            </td>
            <td>
                <button data-edit="${item.id}">Edit</button>
                <button data-delete="${item.id}">Delete</button>
            </td>
        </tr>
    `).join("");
}

// Dashboard statistics
function updateDashboard() {
    const items = getItems();

    const totalItems = document.getElementById("totalItems");
    if (!totalItems) return;

    totalItems.textContent = items.length;

    document.getElementById("totalQuantity").textContent =
        items.reduce((sum, item) => sum + Number(item.quantity), 0);

    document.getElementById("lowStock").textContent =
        items.filter(item => item.quantity <= item.minimum).length;

    const recent = document.getElementById("recentItems");

    const latest = [...items].reverse().slice(0, 5);

    recent.innerHTML = latest.length ? latest.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.category)}</td>
            <td>${item.quantity}</td>
            <td>${item.quantity <= item.minimum ? "Low Stock" : "In Stock"}</td>
        </tr>
    `).join("") : '<tr><td colspan="4">No items recorded yet.</td></tr>';
}

// Add or update inventory
document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("itemForm");

    displayInventory();
    updateDashboard();

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            const id = document.getElementById("editId").value;
            const name = document.getElementById("itemName").value.trim();
            const category = document.getElementById("category").value;
            const quantity = Number(document.getElementById("quantity").value);
            const minimum = Number(document.getElementById("minimum").value);
            const description = document.getElementById("description").value.trim();

            if (!name || !category ||
                !Number.isInteger(quantity) || quantity < 0 ||
                !Number.isInteger(minimum) || minimum < 0) {
                document.getElementById("formMessage").textContent =
                    "Enter valid item details.";
                return;
            }

            let items = getItems();

            const record = {
                id: id || Date.now().toString(),
                name,
                category,
                quantity,
                minimum,
                description
            };

            const index = items.findIndex(item => item.id === id);

            if (index >= 0) {
                items[index] = record;
            } else {
                items.push(record);
            }

            saveItems(items);

            document.getElementById("formMessage").textContent =
                index >= 0 ? "Item updated successfully!" :
                "Item added successfully!";

            form.reset();
            document.getElementById("editId").value = "";
            document.getElementById("minimum").value = 5;
            document.getElementById("saveButton").textContent = "Add Item";
            document.getElementById("cancelEdit").hidden = true;

            displayInventory();
            updateDashboard();
        });
    }

    // Search inventory
    const search = document.getElementById("searchInput");

    if (search) {
        search.addEventListener("input", function() {
            displayInventory(this.value);
        });
    }

    // Edit and delete inventory
    const rows = document.getElementById("inventoryRows");

    if (rows) {
        rows.addEventListener("click", function(event) {
            const id = event.target.dataset.edit;
            const deleteId = event.target.dataset.delete;

            let items = getItems();

            if (id) {
                const item = items.find(entry => entry.id === id);

                if (!item) return;

                document.getElementById("editId").value = item.id;
                document.getElementById("itemName").value = item.name;
                document.getElementById("category").value = item.category;
                document.getElementById("quantity").value = item.quantity;
                document.getElementById("minimum").value = item.minimum;
                document.getElementById("description").value = item.description;

                document.getElementById("saveButton").textContent = "Update Item";
                document.getElementById("cancelEdit").hidden = false;

                window.scrollTo({top: 0, behavior: "smooth"});
            }

            if (deleteId) {
                const item = items.find(entry => entry.id === deleteId);

                if (item && confirm("Delete " + item.name + "?")) {
                    saveItems(items.filter(entry => entry.id !== deleteId));
                    displayInventory();
                    updateDashboard();
                }
            }
        });
    }

    // Cancel editing
    const cancel = document.getElementById("cancelEdit");

    if (cancel) {
        cancel.addEventListener("click", function() {
            form.reset();
            document.getElementById("editId").value = "";
            document.getElementById("minimum").value = 5;
            document.getElementById("saveButton").textContent = "Add Item";
            cancel.hidden = true;
        });
    }
});