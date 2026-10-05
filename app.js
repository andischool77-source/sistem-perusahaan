/* =========================================================
   PT. ANDIKA SANG PERKASA Tbk
   MAIN APPLICATION
========================================================= */


/* =========================================================
   DOM
========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* =========================================================
   STATE
========================================================= */

let currentPage = "dashboard";

let editingBrandId = null;

let editingProductId = null;


/* =========================================================
   PAGE INFORMATION
========================================================= */

const PAGE_INFO = {

    dashboard: [
        "Dashboard",
        "Ringkasan kondisi perusahaan"
    ],

    brands: [
        "Brand",
        "Kelola seluruh brand perusahaan"
    ],

    products: [
        "Produk",
        "Kelola seluruh produk perusahaan"
    ],

    stock: [
        "Stok",
        "Monitor persediaan produk"
    ],

    analytics: [
        "Analytics",
        "Analisis performa bisnis"
    ],

    ai: [
        "AI Business",
        "Insight dan rekomendasi berbasis data"
    ],

    backup: [
        "Backup & Restore",
        "Amankan data sistem"
    ],

    settings: [
        "Pengaturan",
        "Konfigurasi sistem perusahaan"
    ]

};


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    bindNavigation();

    bindButtons();

    bindSearch();

    updateHeaderDate();

    loadSettings();

    renderAll();

    showPage("dashboard");

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });


    $$("[data-page-link]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.pageLink
                );

            }
        );

    });


    $("#menuToggle").addEventListener(
        "click",
        () => {

            $("#sidebar")
                .classList.toggle("open");

        }
    );

}


function showPage(page) {

    if (!PAGE_INFO[page]) {
        return;
    }

    currentPage = page;


    $$(".page").forEach(section => {

        section.classList.remove("active");

    });


    const target =
        $(`#page-${page}`);

    if (target) {
        target.classList.add("active");
    }


    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });


    $("#pageTitle").textContent =
        PAGE_INFO[page][0];

    $("#pageSubtitle").textContent =
        PAGE_INFO[page][1];


    $("#sidebar")
        .classList.remove("open");


    if (page === "ai") {
        renderAI();
    }

    if (page === "analytics") {
        renderAnalytics();
    }

    if (page === "stock") {
        renderStock();
    }

    if (page === "backup") {
        renderBackupInfo();
    }

}


/* =========================================================
   BUTTONS
========================================================= */

function bindButtons() {

    $("#addBrandButton")
        .addEventListener(
            "click",
            () => openBrandModal()
        );


    $("#addProductButton")
        .addEventListener(
            "click",
            () => openProductModal()
        );


    $("#stockInButton")
        .addEventListener(
            "click",
            () => openStockModal()
        );


    $("#createBackup")
        .addEventListener(
            "click",
            createBackup
        );


    $("#quickBackup")
        .addEventListener(
            "click",
            createBackup
        );


    $("#restoreInput")
        .addEventListener(
            "change",
            restoreBackup
        );


    $("#resetData")
        .addEventListener(
            "click",
            resetSystem
        );


    $("#saveSettings")
        .addEventListener(
            "click",
            saveSettings
        );


    $("#runAIButton")
        .addEventListener(
            "click",
            () => {

                renderAI();

                showToast(
                    "Analisis AI berhasil diperbarui.",
                    "success"
                );

            }
        );


    $("#refreshAnalytics")
        .addEventListener(
            "click",
            () => {

                renderAnalytics();

                showToast(
                    "Analytics diperbarui.",
                    "success"
                );

            }
        );


    $("#modalClose")
        .addEventListener(
            "click",
            closeModal
        );


    $("#modalOverlay")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    $("#modalOverlay")
                ) {

                    closeModal();

                }

            }
        );

}


/* =========================================================
   SEARCH
========================================================= */

function bindSearch() {

    $("#brandSearch")
        .addEventListener(
            "input",
            renderBrands
        );


    $("#productSearch")
        .addEventListener(
            "input",
            renderProducts
        );


    $("#productBrandFilter")
        .addEventListener(
            "change",
            renderProducts
        );


    $("#productStatusFilter")
        .addEventListener(
            "change",
            renderProducts
        );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderDashboard();

    renderBrands();

    renderProductFilters();

    renderProducts();

    renderStock();

    renderAnalytics();

    renderAI();

    renderBackupInfo();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const products =
        appData.products;

    const brands =
        appData.brands;


    const inventory =
        products.reduce(
            (sum, product) =>
                sum +
                Number(product.stock || 0) *
                Number(product.costPrice || 0),
            0
        );


    const lowStock =
        products.filter(
            product =>
                Number(product.stock || 0) <=
                Number(product.minimumStock || 0)
        );


    $("#statBrands").textContent =
        formatNumber(brands.length);

    $("#statProducts").textContent =
        formatNumber(products.length);

    $("#statInventory").textContent =
        formatCurrency(
            inventory,
            appData.company.currency
        );

    $("#statLowStock").textContent =
        formatNumber(lowStock.length);


    renderDashboardBrands();

    renderDashboardAI();

    renderDashboardProducts();

}


function renderDashboardBrands() {

    const container =
        $("#dashboardBrands");

    const result =
        AIEngine.getBrandPerformance(
            appData.brands,
            appData.products
        );


    if (result.length === 0) {

        container.innerHTML = emptyHTML(
            "Belum ada Brand",
            "Tambahkan Brand terlebih dahulu."
        );

        return;

    }


    const max =
        Math.max(
            ...result.map(
                item => item.productCount
            ),
            1
        );


    container.innerHTML =
        result.slice(0, 5)
            .map(item => {

                const percentage =
                    (item.productCount / max) *
                    100;

                return `

                    <div class="performance-item">

                        <div class="performance-head">
                            <strong>${escapeHTML(item.name)}</strong>
                            <span>${item.productCount} produk</span>
                        </div>

                        <div class="progress">
                            <span style="width:${percentage}%"></span>
                        </div>

                    </div>

                `;

            })
            .join("");

}


function renderDashboardAI() {

    const container =
        $("#dashboardAI");

    const insights =
        AIEngine.quickInsights(appData);


    container.innerHTML =
        insights.map(insight => `

            <div class="insight ${insight.type}">

                <div class="insight-icon">
                    ${escapeHTML(insight.icon)}
                </div>

                <div>
                    <strong>
                        ${escapeHTML(insight.title)}
                    </strong>

                    <p>
                        ${escapeHTML(insight.text)}
                    </p>
                </div>

            </div>

        `).join("");

}


function renderDashboardProducts() {

    const tbody =
        $("#dashboardProducts");


    const products =
        [...appData.products]
            .reverse()
            .slice(0, 7);


    if (products.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    ${emptyHTML(
                        "Belum ada produk",
                        "Tambahkan produk untuk mulai mengelola portofolio."
                    )}
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        products.map(product => {

            const brand =
                findBrand(product.brandId);


            return `

                <tr>

                    <td>
                        <span class="product-name">
                            ${escapeHTML(product.name)}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            brand ? brand.name : "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            product.category || "-"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.sellPrice,
                            appData.company.currency
                        )}
                    </td>

                    <td>
                        ${formatNumber(product.stock)}
                    </td>

                    <td>
                        ${productStatusHTML(product)}
                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   BRAND
========================================================= */

function renderBrands() {

    const container =
        $("#brandGrid");

    const search =
        ($("#brandSearch").value || "")
            .toLowerCase()
            .trim();


    const brands =
        appData.brands.filter(brand => {

            if (!search) {
                return true;
            }

            return (
                brand.name
                    .toLowerCase()
                    .includes(search) ||

                (brand.description || "")
                    .toLowerCase()
                    .includes(search)
            );

        });


    const active =
        appData.brands.filter(
            b => b.status !== "Nonaktif"
        ).length;


    const productCount =
        appData.products.length;


    $("#brandTotal").textContent =
        formatNumber(appData.brands.length);

    $("#brandActive").textContent =
        formatNumber(active);

    $("#brandProducts").textContent =
        formatNumber(productCount);


    if (brands.length === 0) {

        container.innerHTML =
            emptyHTML(
                "Belum ada Brand",
                "Gunakan tombol Tambah Brand untuk membuat Brand."
            );

        return;

    }


    container.innerHTML =
        brands.map(brand => {

            const productCount =
                appData.products.filter(
                    p => p.brandId === brand.id
                ).length;


            return `

                <div class="brand-card">

                    <div class="brand-card-top">

                        <div class="brand-avatar">
                            ${escapeHTML(
                                getInitials(brand.name)
                            )}
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(brand.name)}
                            </h3>

                            <p>
                                ${brand.status === "Nonaktif"
                                    ? "Nonaktif"
                                    : "Brand Aktif"}
                            </p>

                        </div>

                        <div class="brand-actions">

                            <button
                                class="action-btn edit"
                                onclick="editBrand('${brand.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="action-btn delete"
                                onclick="deleteBrand('${brand.id}')"
                            >
                                Hapus
                            </button>

                        </div>

                    </div>


                    <div class="brand-description">

                        ${escapeHTML(
                            brand.description ||
                            "Belum ada deskripsi."
                        )}

                    </div>


                    <div class="brand-metrics">

                        <div>
                            <span>Produk</span>
                            <strong>
                                ${formatNumber(productCount)}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>
                                ${brand.status === "Nonaktif"
                                    ? "Nonaktif"
                                    : "Aktif"}
                            </strong>
                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   BRAND MODAL
========================================================= */

function openBrandModal(id = null) {

    editingBrandId = id;


    const brand =
        id
            ? appData.brands.find(
                item => item.id === id
            )
            : null;


    $("#modalTitle").textContent =
        brand
            ? "Edit Brand"
            : "Tambah Brand";


    $("#modalSubtitle").textContent =
        "Masukkan informasi Brand.";


    $("#modalBody").innerHTML = `

        <form class="modal-form" id="brandForm">

            <div class="form-grid">

                <div class="form-group full">

                    <label>Nama Brand *</label>

                    <input
                        id="brandName"
                        required
                        maxlength="100"
                        value="${escapeAttribute(
                            brand?.name || ""
                        )}"
                        placeholder="Contoh: Brand A"
                    >

                </div>


                <div class="form-group full">

                    <label>Deskripsi</label>

                    <textarea
                        id="brandDescription"
                        rows="4"
                        maxlength="500"
                        placeholder="Deskripsi Brand..."
                    >${escapeHTML(
                        brand?.description || ""
                    )}</textarea>

                </div>


                <div class="form-group">

                    <label>Status</label>

                    <select id="brandStatus">

                        <option
                            value="Aktif"
                            ${brand?.status !== "Nonaktif"
                                ? "selected"
                                : ""}
                        >
                            Aktif
                        </option>

                        <option
                            value="Nonaktif"
                            ${brand?.status === "Nonaktif"
                                ? "selected"
                                : ""}
                        >
                            Nonaktif
                        </option>

                    </select>

                </div>

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Batal
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Simpan Brand
                </button>

            </div>

        </form>

    `;


    $("#brandForm")
        .addEventListener(
            "submit",
            saveBrand
        );


    openModal();

}


function saveBrand(event) {

    event.preventDefault();


    const name =
        $("#brandName")
            .value
            .trim();


    if (!name) {

        showToast(
            "Nama Brand wajib diisi.",
            "error"
        );

        return;

    }


    const duplicate =
        appData.brands.some(
            brand =>
                brand.name
                    .trim()
                    .toLowerCase() ===
                name.toLowerCase() &&
                brand.id !== editingBrandId
        );


    if (duplicate) {

        showToast(
            "Brand dengan nama tersebut sudah ada.",
            "error"
        );

        return;

    }


    const payload = {

        name,

        description:
            $("#brandDescription")
                .value
                .trim(),

        status:
            $("#brandStatus")
                .value

    };


    if (editingBrandId) {

        const index =
            appData.brands.findIndex(
                b =>
                    b.id === editingBrandId
            );


        if (index !== -1) {

            appData.brands[index] = {
                ...appData.brands[index],
                ...payload,
                updatedAt:
                    new Date().toISOString()
            };

        }

    } else {

        appData.brands.push({

            id: generateId("BR"),

            ...payload,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        });

    }


    appData =
        saveData(appData);


    closeModal();

    renderAll();

    showToast(
        editingBrandId
            ? "Brand berhasil diperbarui."
            : "Brand berhasil ditambahkan.",
        "success"
    );


    editingBrandId = null;

}


/* =========================================================
   EDIT BRAND
========================================================= */

function editBrand(id) {

    openBrandModal(id);

}


/* =========================================================
   DELETE BRAND
========================================================= */

function deleteBrand(id) {

    const brand =
        findBrand(id);


    if (!brand) {
        return;
    }


    const linkedProducts =
        appData.products.filter(
            p => p.brandId === id
        );


    if (linkedProducts.length > 0) {

        showToast(
            `Brand tidak dapat dihapus karena masih digunakan oleh ${linkedProducts.length} produk.`,
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Hapus Brand "${brand.name}"?`
        );


    if (!confirmed) {
        return;
    }


    appData.brands =
        appData.brands.filter(
            b => b.id !== id
        );


    appData =
        saveData(appData);


    renderAll();


    showToast(
        "Brand berhasil dihapus.",
        "success"
    );

}


/* =========================================================
   PRODUCT FILTER
========================================================= */

function renderProductFilters() {

    const select =
        $("#productBrandFilter");


    const current =
        select.value;


    select.innerHTML = `
        <option value="">
            Semua Brand
        </option>
    `;


    appData.brands.forEach(brand => {

        const option =
            document.createElement("option");

        option.value =
            brand.id;

        option.textContent =
            brand.name;

        select.appendChild(option);

    });


    if (
        appData.brands.some(
            b => b.id === current
        )
    ) {

        select.value = current;

    }

}


/* =========================================================
   PRODUCTS
========================================================= */

function renderProducts() {

    const tbody =
        $("#productTable");


    const search =
        ($("#productSearch").value || "")
            .toLowerCase()
            .trim();


    const brandFilter =
        $("#productBrandFilter").value;


    const statusFilter =
        $("#productStatusFilter").value;


    let products =
        [...appData.products];


    products =
        products.filter(product => {

            const brand =
                findBrand(product.brandId);


            const text =
                [
                    product.name,
                    product.category,
                    brand?.name || ""
                ]
                    .join(" ")
                    .toLowerCase();


            const matchesSearch =
                !search ||
                text.includes(search);


            const matchesBrand =
                !brandFilter ||
                product.brandId === brandFilter;


            const matchesStatus =
                !statusFilter ||
                product.status === statusFilter;


            return (
                matchesSearch &&
                matchesBrand &&
                matchesStatus
            );

        });


    const active =
        appData.products.filter(
            p => p.status !== "Nonaktif"
        ).length;


    const low =
        appData.products.filter(
            p =>
                Number(p.stock) <=
                Number(p.minimumStock)
        ).length;


    const value =
        appData.products.reduce(
            (sum, p) =>
                sum +
                Number(p.stock || 0) *
                Number(p.costPrice || 0),
            0
        );


    $("#productTotal").textContent =
        formatNumber(appData.products.length);

    $("#productActive").textContent =
        formatNumber(active);

    $("#productLow").textContent =
        formatNumber(low);

    $("#productValue").textContent =
        formatCurrency(
            value,
            appData.company.currency
        );


    if (products.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    ${emptyHTML(
                        "Produk tidak ditemukan",
                        "Belum ada produk yang sesuai dengan filter."
                    )}
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        products.map(product => {

            const brand =
                findBrand(product.brandId);


            return `

                <tr>

                    <td>
                        <span class="product-name">
                            ${escapeHTML(product.name)}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            brand?.name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            product.category || "-"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.costPrice,
                            appData.company.currency
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.sellPrice,
                            appData.company.currency
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatNumber(product.stock)}
                        </strong>
                    </td>

                    <td>
                        ${productStatusHTML(product)}
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="action-btn edit"
                                onclick="editProduct('${product.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="action-btn"
                                onclick="openStockModal('${product.id}')"
                            >
                                + Stok
                            </button>

                            <button
                                class="action-btn delete"
                                onclick="deleteProduct('${product.id}')"
                            >
                                Hapus
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(id = null) {

    editingProductId = id;


    const product =
        id
            ? appData.products.find(
                item => item.id === id
            )
            : null;


    $("#modalTitle").textContent =
        product
            ? "Edit Produk"
            : "Tambah Produk";


    $("#modalSubtitle").textContent =
        "Lengkapi data produk.";


    const brandOptions =
        appData.brands.map(
            brand => `

                <option
                    value="${escapeAttribute(brand.id)}"
                    ${product?.brandId === brand.id
                        ? "selected"
                        : ""}
                >
                    ${escapeHTML(brand.name)}
                </option>

            `
        ).join("");


    $("#modalBody").innerHTML = `

        <form class="modal-form" id="productForm">

            <div class="form-grid">

                <div class="form-group full">

                    <label>Nama Produk *</label>

                    <input
                        id="productName"
                        required
                        maxlength="120"
                        value="${escapeAttribute(
                            product?.name || ""
                        )}"
                        placeholder="Nama produk"
                    >

                </div>


                <div class="form-group">

                    <label>Brand *</label>

                    <select id="productBrand" required>

                        <option value="">
                            Pilih Brand
                        </option>

                        ${brandOptions}

                    </select>

                </div>


                <div class="form-group">

                    <label>Kategori</label>

                    <input
                        id="productCategory"
                        maxlength="80"
                        value="${escapeAttribute(
                            product?.category || ""
                        )}"
                        placeholder="Contoh: Makanan"
                    >

                </div>


                <div class="form-group">

                    <label>Harga Modal *</label>

                    <input
                        id="productCost"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value="${product?.costPrice ?? ""}"
                    >

                </div>


                <div class="form-group">

                    <label>Harga Jual *</label>

                    <input
                        id="productSell"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value="${product?.sellPrice ?? ""}"
                    >

                </div>


                <div class="form-group">

                    <label>Stok *</label>

                    <input
                        id="productStock"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value="${product?.stock ?? 0}"
                        ${product ? "readonly" : ""}
                    >

                </div>


                <div class="form-group">

                    <label>Minimum Stok</label>

                    <input
                        id="productMinimum"
                        type="number"
                        min="0"
                        step="1"
                        value="${product?.minimumStock ?? 5}"
                    >

                </div>


                <div class="form-group">

                    <label>Status</label>

                    <select id="productStatus">

                        <option
                            value="Aktif"
                            ${product?.status !== "Nonaktif"
                                ? "selected"
                                : ""}
                        >
                            Aktif
                        </option>

                        <option
                            value="Nonaktif"
                            ${product?.status === "Nonaktif"
                                ? "selected"
                                : ""}
                        >
                            Nonaktif
                        </option>

                    </select>

                </div>

            </div>


            ${product
                ? `
                    <div style="
                        margin-top:15px;
                        padding:10px;
                        background:#f5f6fa;
                        border-radius:9px;
                        font-size:9px;
                        color:#747c8e;
                    ">
                        Stok dikelola melalui menu
                        <strong>Stok</strong> atau tombol
                        <strong>+ Stok</strong>.
                    </div>
                `
                : ""
            }


            <div class="modal-footer">

                <button
                    type="button"
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Batal
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Simpan Produk
                </button>

            </div>

        </form>

    `;


    $("#productForm")
        .addEventListener(
            "submit",
            saveProduct
        );


    openModal();

}


function saveProduct(event) {

    event.preventDefault();


    const name =
        $("#productName")
            .value
            .trim();


    const brandId =
        $("#productBrand")
            .value;


    const costPrice =
        Number(
            $("#productCost")
                .value
        );


    const sellPrice =
        Number(
            $("#productSell")
                .value
        );


    const minimumStock =
        Number(
            $("#productMinimum")
                .value
        );


    const status =
        $("#productStatus")
            .value;


    if (!name) {

        showToast(
            "Nama produk wajib diisi.",
            "error"
        );

        return;

    }


    if (!brandId) {

        showToast(
            "Pilih Brand terlebih dahulu.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(costPrice) ||
        costPrice < 0
    ) {

        showToast(
            "Harga modal tidak valid.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(sellPrice) ||
        sellPrice < 0
    ) {

        showToast(
            "Harga jual tidak valid.",
            "error"
        );

        return;

    }


    if (
        sellPrice <
        costPrice
    ) {

        const continueSave =
            confirm(
                "Harga jual lebih rendah dari harga modal. Tetap simpan?"
            );


        if (!continueSave) {
            return;
        }

    }


    const duplicate =
        appData.products.some(
            product =>
                product.name
                    .trim()
                    .toLowerCase() ===
                name.toLowerCase() &&
                product.brandId === brandId &&
                product.id !== editingProductId
        );


    if (duplicate) {

        showToast(
            "Produk dengan nama dan Brand tersebut sudah ada.",
            "error"
        );

        return;

    }


    const payload = {

        name,

        brandId,

        category:
            $("#productCategory")
                .value
                .trim(),

        costPrice,

        sellPrice,

        minimumStock:
            Math.max(
                0,
                minimumStock || 0
            ),

        status

    };


    if (editingProductId) {

        const index =
            appData.products.findIndex(
                p =>
                    p.id ===
                    editingProductId
            );


        if (index !== -1) {

            appData.products[index] = {

                ...appData.products[index],

                ...payload,

                updatedAt:
                    new Date().toISOString()

            };

        }

    } else {

        const initialStock =
            Math.max(
                0,
                Number(
                    $("#productStock")
                        .value
                ) || 0
            );


        const product = {

            id:
                generateId("PR"),

            ...payload,

            stock:
                initialStock,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        appData.products.push(
            product
        );


        if (initialStock > 0) {

            appData.stockMovements.push({

                id:
                    generateId("SM"),

                productId:
                    product.id,

                type:
                    "IN",

                quantity:
                    initialStock,

                note:
                    "Stok awal produk",

                createdAt:
                    new Date().toISOString()

            });

        }

    }


    appData =
        saveData(appData);


    closeModal();

    renderAll();


    showToast(
        editingProductId
            ? "Produk berhasil diperbarui."
            : "Produk berhasil ditambahkan.",
        "success"
    );


    editingProductId = null;

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    openProductModal(id);

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(id) {

    const product =
        appData.products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Hapus produk "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    appData.products =
        appData.products.filter(
            p => p.id !== id
        );


    appData.stockMovements =
        appData.stockMovements.filter(
            movement =>
                movement.productId !== id
        );


    appData =
        saveData(appData);


    renderAll();


    showToast(
        "Produk berhasil dihapus.",
        "success"
    );

}


/* =========================================================
   STOCK
========================================================= */

function renderStock() {

    const container =
        $("#stockList");

    const products =
        [...appData.products]
            .sort(
                (a, b) =>
                    Number(a.stock) -
                    Number(b.stock)
            );


    const low =
        products.filter(
            product =>
                Number(product.stock) <=
                Number(product.minimumStock)
        );


    if (low.length > 0) {

        $("#stockAlert").innerHTML = `

            <div class="alert-box">

                <strong>
                    ⚠ Perhatian:
                </strong>

                ${low.length}
                produk berada pada atau di bawah minimum stok.

            </div>

        `;

    } else {

        $("#stockAlert").innerHTML = "";

    }


    if (products.length === 0) {

        container.innerHTML =
            emptyHTML(
                "Belum ada produk",
                "Tambahkan produk terlebih dahulu."
            );

        return;

    }


    container.innerHTML =
        products.map(product => {

            const stock =
                Number(product.stock) || 0;

            const minimum =
                Number(product.minimumStock) || 0;


            let type =
                "safe";

            if (stock <= 0) {
                type = "danger";
            } else if (stock <= minimum) {
                type = "warning";
            }


            const percent =
                minimum > 0
                    ? Math.min(
                        100,
                        (stock / (minimum * 3)) * 100
                    )
                    : stock > 0
                        ? 100
                        : 0;


            const brand =
                findBrand(product.brandId);


            return `

                <div class="stock-row">

                    <div class="stock-product">

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                brand?.name || "-"
                            )}
                        </span>

                    </div>


                    <div class="stock-number">

                        ${formatNumber(stock)}

                        <small class="muted">
                            / min ${formatNumber(minimum)}
                        </small>

                    </div>


                    <div class="
                        stock-progress
                        ${type === "warning"
                            ? "warning"
                            : ""}
                        ${type === "danger"
                            ? "danger"
                            : ""}
                    ">

                        <span
                            style="width:${percent}%"
                        ></span>

                    </div>


                    <div>

                        <span class="
                            status
                            ${type}
                        ">

                            ${type === "safe"
                                ? "Aman"
                                : type === "warning"
                                    ? "Menipis"
                                    : "Habis"}

                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   STOCK MODAL
========================================================= */

function openStockModal(productId = "") {

    $("#modalTitle").textContent =
        "Tambah Stok";


    $("#modalSubtitle").textContent =
        "Tambahkan stok ke produk yang sudah ada.";


    const options =
        appData.products.map(product => `

            <option
                value="${escapeAttribute(product.id)}"
                ${product.id === productId
                    ? "selected"
                    : ""}
            >

                ${escapeHTML(product.name)}
                — stok ${formatNumber(product.stock)}

            </option>

        `).join("");


    $("#modalBody").innerHTML = `

        <form class="modal-form" id="stockForm">

            <div class="form-grid">

                <div class="form-group full">

                    <label>Produk *</label>

                    <select
                        id="stockProduct"
                        required
                    >

                        <option value="">
                            Pilih Produk
                        </option>

                        ${options}

                    </select>

                </div>


                <div class="form-group">

                    <label>Jumlah Stok Masuk *</label>

                    <input
                        id="stockQuantity"
                        type="number"
                        min="1"
                        step="1"
                        required
                        placeholder="Contoh: 10"
                    >

                </div>


                <div class="form-group">

                    <label>Keterangan</label>

                    <input
                        id="stockNote"
                        maxlength="200"
                        placeholder="Contoh: Restock supplier"
                    >

                </div>

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Batal
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Tambah Stok
                </button>

            </div>

        </form>

    `;


    $("#stockForm")
        .addEventListener(
            "submit",
            saveStock
        );


    openModal();

}


function saveStock(event) {

    event.preventDefault();


    const productId =
        $("#stockProduct")
            .value;


    const quantity =
        Number(
            $("#stockQuantity")
                .value
        );


    const note =
        $("#stockNote")
            .value
            .trim();


    if (!productId) {

        showToast(
            "Pilih produk.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        showToast(
            "Jumlah stok harus lebih dari 0.",
            "error"
        );

        return;

    }


    const product =
        appData.products.find(
            p => p.id === productId
        );


    if (!product) {

        showToast(
            "Produk tidak ditemukan.",
            "error"
        );

        return;

    }


    /*
        PENTING:
        Tidak membuat produk baru.
        Hanya mencari ID produk lalu
        menambahkan quantity ke stok.
    */

    product.stock =
        Number(product.stock || 0) +
        quantity;


    product.updatedAt =
        new Date().toISOString();


    appData.stockMovements.push({

        id:
            generateId("SM"),

        productId,

        type:
            "IN",

        quantity,

        note:
            note || "Penambahan stok",

        createdAt:
            new Date().toISOString()

    });


    appData =
        saveData(appData);


    closeModal();

    renderAll();


    showToast(
        `Stok ${product.name} bertambah ${formatNumber(quantity)}.`,
        "success"
    );

}


/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalytics() {

    renderBrandChart();

    renderCategoryChart();

    renderInventoryTable();

}


function renderBrandChart() {

    const container =
        $("#brandChart");


    const data =
        AIEngine.getBrandPerformance(
            appData.brands,
            appData.products
        );


    if (data.length === 0) {

        container.innerHTML =
            emptyHTML(
                "Belum ada data",
                "Tambahkan Brand dan Produk."
            );

        return;

    }


    const max =
        Math.max(
            ...data.map(
                item => item.productCount
            ),
            1
        );


    container.innerHTML =
        data.map(item => {

            const width =
                (item.productCount / max) *
                100;


            return `

                <div class="bar-item">

                    <div class="bar-item-head">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <span>
                            ${formatNumber(
                                item.productCount
                            )} produk
                        </span>

                    </div>

                    <div class="bar-track">

                        <span
                            style="width:${width}%"
                        ></span>

                    </div>

                </div>

            `;

        }).join("");

}


function renderCategoryChart() {

    const container =
        $("#categoryChart");


    const data =
        AIEngine.getCategoryPerformance(
            appData.products
        );


    if (data.length === 0) {

        container.innerHTML =
            emptyHTML(
                "Belum ada kategori",
                "Tambahkan produk."
            );

        return;

    }


    const max =
        Math.max(
            ...data.map(
                item => item.count
            ),
            1
        );


    container.innerHTML =
        data.map(item => {

            const width =
                (item.count / max) *
                100;


            return `

                <div class="bar-item">

                    <div class="bar-item-head">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <span>
                            ${formatNumber(item.count)}
                        </span>

                    </div>

                    <div class="bar-track">

                        <span
                            style="width:${width}%"
                        ></span>

                    </div>

                </div>

            `;

        }).join("");

}


function renderInventoryTable() {

    const tbody =
        $("#inventoryTable");


    const products =
        [...appData.products]
            .sort(
                (a, b) =>
                    (
                        Number(b.stock) *
                        Number(b.costPrice)
                    ) -
                    (
                        Number(a.stock) *
                        Number(a.costPrice)
                    )
            )
            .slice(0, 10);


    if (products.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    ${emptyHTML(
                        "Belum ada data",
                        "Tambahkan produk."
                    )}
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        products.map(product => {

            const brand =
                findBrand(product.brandId);


            const value =
                Number(product.stock || 0) *
                Number(product.costPrice || 0);


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            brand?.name || "-"
                        )}
                    </td>

                    <td>
                        ${formatNumber(product.stock)}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.costPrice,
                            appData.company.currency
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatCurrency(
                                value,
                                appData.company.currency
                            )}
                        </strong>
                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   AI
========================================================= */

function renderAI() {

    const analysis =
        AIEngine.analyze(appData);


    const summary =
        analysis.summary;


    $("#aiSummary").innerHTML = `

        <div class="ai-summary-card">

            <span>Total Brand</span>

            <strong>
                ${formatNumber(summary.brands)}
            </strong>

        </div>


        <div class="ai-summary-card">

            <span>Total Produk Aktif</span>

            <strong>
                ${formatNumber(summary.activeProducts)}
            </strong>

        </div>


        <div class="ai-summary-card">

            <span>Nilai Inventori</span>

            <strong>
                ${formatCurrency(
                    summary.inventoryValue,
                    appData.company.currency
                )}
            </strong>

        </div>

    `;


    $("#aiInsights").innerHTML =
        analysis.insights
            .map(item => `

                <div class="ai-result">

                    <div class="ai-result-icon">
                        ${escapeHTML(item.icon)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <p>
                            ${escapeHTML(item.text)}
                        </p>

                    </div>

                </div>

            `)
            .join("");


    $("#aiRecommendations").innerHTML =
        analysis.recommendations
            .map(item => `

                <div class="ai-result">

                    <div class="ai-result-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <p>
                            ${escapeHTML(item.text)}
                        </p>

                    </div>

                </div>

            `)
            .join("");


    const products =
        [
            ...analysis.lowStockProducts,
            ...analysis.marginProducts
        ];


    const unique = [];


    products.forEach(product => {

        if (
            !unique.some(
                item => item.id === product.id
            )
        ) {

            unique.push(product);

        }

    });


    $("#aiProducts").innerHTML =
        unique
            .slice(0, 9)
            .map(product => {

                const margin =
                    AIEngine.margin(product);


                return `

                    <div class="ai-product">

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            Stok:
                            ${formatNumber(product.stock)}
                        </span>

                        <span>
                            Margin:
                            ${formatNumber(margin)}%
                        </span>

                    </div>

                `;

            })
            .join("") ||
        emptyHTML(
            "Belum ada analisis produk",
            "Tambahkan produk untuk mendapatkan analisis."
        );

}


/* =========================================================
   BACKUP
========================================================= */

function createBackup() {

    try {

        const payload =
            createBackupPayload(appData);


        const json =
            JSON.stringify(
                payload,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const date =
            new Date()
                .toISOString()
                .replace(/[:.]/g, "-");


        const filename =
            `andika-sang-perkasa-backup-${date}.json`;


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            filename;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


        appData.settings.lastBackup =
            new Date().toISOString();


        appData =
            saveData(appData);


        renderBackupInfo();


        showToast(
            "Backup berhasil dibuat.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Backup gagal dibuat.",
            "error"
        );

    }

}


/* =========================================================
   RESTORE
========================================================= */

function restoreBackup(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const payload =
                    JSON.parse(
                        reader.result
                    );


                const validation =
                    validateBackup(
                        payload
                    );


                if (!validation.valid) {

                    showToast(
                        validation.message,
                        "error"
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Restore akan mengganti data sistem saat ini dengan data dari backup. Lanjutkan?"
                    );


                if (!confirmed) {
                    return;
                }


                appData =
                    normalizeData(
                        payload.data
                    );


                appData =
                    saveData(appData);


                loadSettings();

                renderAll();

                showPage("dashboard");


                showToast(
                    "Data berhasil di-restore.",
                    "success"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "File backup tidak dapat dibaca.",
                    "error"
                );

            }

        };


    reader.readAsText(file);


    event.target.value = "";

}


/* =========================================================
   BACKUP INFO
========================================================= */

function renderBackupInfo() {

    const container =
        $("#backupInfo");


    const size =
        JSON.stringify(appData)
            .length;


    const sizeKB =
        (size / 1024)
            .toFixed(2);


    container.innerHTML = `

        <div class="info-item">

            <span>Brand</span>

            <strong>
                ${formatNumber(
                    appData.brands.length
                )}
            </strong>

        </div>


        <div class="info-item">

            <span>Produk</span>

            <strong>
                ${formatNumber(
                    appData.products.length
                )}
            </strong>

        </div>


        <div class="info-item">

            <span>Ukuran Data</span>

            <strong>
                ${sizeKB} KB
            </strong>

        </div>


        <div class="info-item">

            <span>Backup Terakhir</span>

            <strong>
                ${appData.settings.lastBackup
                    ? formatDateTime(
                        appData.settings.lastBackup
                    )
                    : "Belum ada"}
            </strong>

        </div>


        <div class="info-item">

            <span>Storage</span>

            <strong>
                LocalStorage
            </strong>

        </div>


        <div class="info-item">

            <span>Versi</span>

            <strong>
                ${APP_CONFIG.version}
            </strong>

        </div>

    `;

}


/* =========================================================
   RESET
========================================================= */

function resetSystem() {

    const first =
        confirm(
            "PERINGATAN: Semua Brand, Produk, Stok dan pengaturan akan dihapus."
        );


    if (!first) {
        return;
    }


    const second =
        confirm(
            "Pastikan Anda sudah memiliki backup jika data masih diperlukan. Reset sekarang?"
        );


    if (!second) {
        return;
    }


    localStorage.removeItem(
        APP_CONFIG.storageKey
    );


    appData =
        loadData();


    loadSettings();

    renderAll();

    showPage("dashboard");


    showToast(
        "Sistem berhasil direset.",
        "success"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

    $("#settingCompanyName").value =
        appData.company.name || "";


    $("#settingAddress").value =
        appData.company.address || "";


    $("#settingContact").value =
        appData.company.contact || "";


    $("#settingEmail").value =
        appData.company.email || "";


    $("#settingCurrency").value =
        appData.company.currency || "IDR";

}


function saveSettings() {

    const name =
        $("#settingCompanyName")
            .value
            .trim();


    if (!name) {

        showToast(
            "Nama perusahaan wajib diisi.",
            "error"
        );

        return;

    }


    appData.company = {

        ...appData.company,

        name,

        address:
            $("#settingAddress")
                .value
                .trim(),

        contact:
            $("#settingContact")
                .value
                .trim(),

        email:
            $("#settingEmail")
                .value
                .trim(),

        currency:
            $("#settingCurrency")
                .value

    };


    appData =
        saveData(appData);


    renderAll();


    showToast(
        "Pengaturan berhasil disimpan.",
        "success"
    );

}


/* =========================================================
   MODAL
========================================================= */

function openModal() {

    $("#modalOverlay")
        .classList.add("show");

}


function closeModal() {

    $("#modalOverlay")
        .classList.remove("show");

    $("#modalBody").innerHTML = "";

}


/* =========================================================
   HELPERS
========================================================= */

function findBrand(id) {

    return appData.brands.find(
        brand => brand.id === id
    );

}


function productStatusHTML(product) {

    if (
        product.status ===
        "Nonaktif"
    ) {

        return `
            <span class="status inactive">
                Nonaktif
            </span>
        `;

    }


    const stock =
        Number(product.stock) || 0;

    const minimum =
        Number(product.minimumStock) || 0;


    if (stock <= 0) {

        return `
            <span class="status danger">
                Habis
            </span>
        `;

    }


    if (stock <= minimum) {

        return `
            <span class="status warning">
                Menipis
            </span>
        `;

    }


    return `
        <span class="status active">
            Aktif
        </span>
    `;

}


function getInitials(name) {

    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
                    .toUpperCase()
        )
        .join("") || "BR";

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


function emptyHTML(title, text) {

    return `

        <div class="empty-state">

            <strong>
                ${escapeHTML(title)}
            </strong>

            <span>
                ${escapeHTML(text)}
            </span>

        </div>

    `;

}


function formatDateTime(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }


    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        $("#toastContainer");


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateY(-8px)";

            setTimeout(
                () =>
                    toast.remove(),
                250
            );

        },
        3000
    );

}


/* =========================================================
   HEADER DATE
========================================================= */

function updateHeaderDate() {

    const now =
        new Date();


    $("#headerDate")
        .textContent =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editBrand =
    editBrand;

window.deleteBrand =
    deleteBrand;

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.openStockModal =
    openStockModal;

window.openBrandModal =
    openBrandModal;

window.openProductModal =
    openProductModal;

window.closeModal =
    closeModal;