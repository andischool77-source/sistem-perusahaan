/* =========================================================
   AI ENGINE
   PT. ANDIKA SANG PERKASA Tbk
========================================================= */

/*
    Catatan:

    Engine ini merupakan AI analitik lokal.
    Tidak membutuhkan API internet.

    Engine membaca:
    - Brand
    - Produk
    - Stok
    - Harga
    - Margin
    - Kategori
*/


const AIEngine = {

    /* =====================================================
       ANALYZE
    ===================================================== */

    analyze(data) {

        const brands = Array.isArray(data.brands)
            ? data.brands
            : [];

        const products = Array.isArray(data.products)
            ? data.products
            : [];


        const activeProducts = products.filter(
            p => p.status !== "Nonaktif"
        );


        const lowStock = products.filter(
            p => Number(p.stock) <= Number(p.minimumStock)
        );


        const outOfStock = products.filter(
            p => Number(p.stock) <= 0
        );


        const inventoryValue = products.reduce(
            (sum, p) =>
                sum +
                (Number(p.stock) || 0) *
                (Number(p.costPrice) || 0),
            0
        );


        const salesValue = products.reduce(
            (sum, p) =>
                sum +
                (Number(p.stock) || 0) *
                (Number(p.sellPrice) || 0),
            0
        );


        const potentialProfit = products.reduce(
            (sum, p) =>
                sum +
                (Number(p.stock) || 0) *
                (
                    (Number(p.sellPrice) || 0) -
                    (Number(p.costPrice) || 0)
                ),
            0
        );


        const brandPerformance =
            this.getBrandPerformance(brands, products);


        const categoryPerformance =
            this.getCategoryPerformance(products);


        const highValueProducts =
            [...products]
                .sort(
                    (a, b) =>
                        this.inventoryValue(b) -
                        this.inventoryValue(a)
                )
                .slice(0, 5);


        const lowStockProducts =
            [...lowStock]
                .sort(
                    (a, b) =>
                        Number(a.stock) -
                        Number(b.stock)
                );


        const marginProducts =
            [...activeProducts]
                .map(product => ({
                    ...product,
                    margin: this.margin(product)
                }))
                .sort(
                    (a, b) =>
                        b.margin -
                        a.margin
                );


        const insights = [];


        /* STOK HABIS */

        if (outOfStock.length > 0) {

            insights.push({
                type: "warning",
                icon: "!",
                title: "Ada produk kehabisan stok",
                text:
                    `${outOfStock.length} produk memiliki stok 0. ` +
                    `Segera lakukan restock agar tidak kehilangan peluang penjualan.`
            });

        }


        /* STOK MENIPIS */

        if (
            lowStock.length > 0 &&
            outOfStock.length === 0
        ) {

            insights.push({
                type: "warning",
                icon: "!",
                title: "Stok perlu diperhatikan",
                text:
                    `${lowStock.length} produk berada pada atau di bawah minimum stok.`
            });

        }


        /* MARGIN */

        if (marginProducts.length > 0) {

            const best = marginProducts[0];

            insights.push({
                type: "good",
                icon: "↑",
                title: "Produk dengan margin terbaik",
                text:
                    `${best.name} memiliki estimasi margin ` +
                    `${formatNumber(best.margin)}%.`
            });

        }


        /* BRAND */

        if (brandPerformance.length > 0) {

            const bestBrand =
                brandPerformance[0];

            insights.push({
                type: "good",
                icon: "★",
                title: "Brand dengan portofolio terbesar",
                text:
                    `${bestBrand.name} memiliki ` +
                    `${bestBrand.productCount} produk.`
            });

        }


        /* KATEGORI */

        if (categoryPerformance.length > 0) {

            const category =
                categoryPerformance[0];

            insights.push({
                type: "info",
                icon: "◈",
                title: "Kategori dominan",
                text:
                    `Kategori ${category.name} memiliki ` +
                    `${category.count} produk.`
            });

        }


        /* DATA KOSONG */

        if (products.length === 0) {

            insights.push({
                type: "info",
                icon: "i",
                title: "Belum ada data produk",
                text:
                    "Tambahkan produk agar AI dapat menghasilkan analisis yang lebih lengkap."
            });

        }


        /* REKOMENDASI */

        const recommendations = [];


        if (outOfStock.length > 0) {

            recommendations.push({
                title: "Prioritaskan restock",
                text:
                    "Lakukan penambahan stok untuk produk yang sudah habis terlebih dahulu."
            });

        }


        if (lowStock.length > 0) {

            recommendations.push({
                title: "Tetapkan prioritas persediaan",
                text:
                    "Produk yang mendekati minimum stok sebaiknya dimasukkan ke daftar restock."
            });

        }


        if (products.length > 0 && brands.length === 0) {

            recommendations.push({
                title: "Bangun struktur Brand",
                text:
                    "Tambahkan Brand dan hubungkan setiap produk dengan Brand yang sesuai."
            });

        }


        if (products.length > 0) {

            const zeroMargin =
                products.filter(
                    p =>
                        Number(p.sellPrice) <=
                        Number(p.costPrice)
                );

            if (zeroMargin.length > 0) {

                recommendations.push({
                    title: "Periksa harga jual",
                    text:
                        `${zeroMargin.length} produk memiliki harga jual ` +
                        `tidak lebih tinggi dari harga modal.`
                });

            }

        }


        if (recommendations.length === 0) {

            recommendations.push({
                title: "Pertahankan monitoring",
                text:
                    "Data bisnis berada dalam kondisi yang dapat terus dipantau melalui dashboard dan analytics."
            });

        }


        return {

            summary: {
                brands: brands.length,
                products: products.length,
                activeProducts: activeProducts.length,
                lowStock: lowStock.length,
                outOfStock: outOfStock.length,
                inventoryValue,
                salesValue,
                potentialProfit
            },

            insights,

            recommendations,

            brandPerformance,

            categoryPerformance,

            highValueProducts,

            lowStockProducts,

            marginProducts

        };

    },


    /* =====================================================
       BRAND PERFORMANCE
    ===================================================== */

    getBrandPerformance(brands, products) {

        const result = brands.map(brand => {

            const brandProducts =
                products.filter(
                    product =>
                        product.brandId === brand.id
                );

            const value =
                brandProducts.reduce(
                    (sum, p) =>
                        sum +
                        (Number(p.stock) || 0) *
                        (Number(p.costPrice) || 0),
                    0
                );

            return {

                id: brand.id,

                name: brand.name,

                productCount:
                    brandProducts.length,

                inventoryValue:
                    value

            };

        });


        return result.sort(
            (a, b) =>
                b.productCount -
                a.productCount
        );

    },


    /* =====================================================
       CATEGORY PERFORMANCE
    ===================================================== */

    getCategoryPerformance(products) {

        const map = {};

        products.forEach(product => {

            const category =
                product.category ||
                "Tanpa Kategori";

            if (!map[category]) {
                map[category] = 0;
            }

            map[category]++;

        });


        return Object.keys(map)
            .map(name => ({
                name,
                count: map[name]
            }))
            .sort(
                (a, b) =>
                    b.count -
                    a.count
            );

    },


    /* =====================================================
       INVENTORY VALUE
    ===================================================== */

    inventoryValue(product) {

        return (
            (Number(product.stock) || 0) *
            (Number(product.costPrice) || 0)
        );

    },


    /* =====================================================
       MARGIN
    ===================================================== */

    margin(product) {

        const sell =
            Number(product.sellPrice) || 0;

        const cost =
            Number(product.costPrice) || 0;

        if (sell <= 0) {
            return 0;
        }

        return ((sell - cost) / sell) * 100;

    },


    /* =====================================================
       QUICK INSIGHT
    ===================================================== */

    quickInsights(data) {

        return this.analyze(data).insights.slice(0, 4);

    }

};