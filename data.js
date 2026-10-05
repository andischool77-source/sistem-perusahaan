/* =========================================================
   PT. ANDIKA SANG PERKASA Tbk
   DATA / STORAGE ENGINE
========================================================= */

const APP_CONFIG = {
    appName: "PT. ANDIKA SANG PERKASA Tbk",
    version: "1.0.0",
    storageKey: "andika_sang_perkasa_brand_product_v1",
    backupVersion: 1,
    currency: "IDR"
};


/* =========================================================
   DATA AWAL
========================================================= */

const DEFAULT_DATA = {

    company: {
        name: "PT. ANDIKA SANG PERKASA Tbk",
        address: "",
        contact: "",
        email: "",
        currency: "IDR"
    },

    brands: [],

    products: [],

    stockMovements: [],

    settings: {
        lastBackup: null
    },

    meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

};


/* =========================================================
   ID GENERATOR
========================================================= */

function generateId(prefix) {

    return prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 8);

}


/* =========================================================
   DEEP CLONE
========================================================= */

function cloneDefaultData() {

    return JSON.parse(JSON.stringify(DEFAULT_DATA));

}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeData(data) {

    const base = cloneDefaultData();

    if (!data || typeof data !== "object") {
        return base;
    }

    base.company = {
        ...base.company,
        ...(data.company || {})
    };

    base.brands = Array.isArray(data.brands)
        ? data.brands
        : [];

    base.products = Array.isArray(data.products)
        ? data.products
        : [];

    base.stockMovements = Array.isArray(data.stockMovements)
        ? data.stockMovements
        : [];

    base.settings = {
        ...base.settings,
        ...(data.settings || {})
    };

    base.meta = {
        ...base.meta,
        ...(data.meta || {})
    };

    return base;

}


/* =========================================================
   LOAD
========================================================= */

function loadData() {

    try {

        const raw = localStorage.getItem(APP_CONFIG.storageKey);

        if (!raw) {

            const initial = cloneDefaultData();

            saveData(initial);

            return initial;

        }

        const parsed = JSON.parse(raw);

        return normalizeData(parsed);

    } catch (error) {

        console.error("Gagal membaca data:", error);

        return cloneDefaultData();

    }

}


/* =========================================================
   SAVE
========================================================= */

function saveData(data) {

    const normalized = normalizeData(data);

    normalized.meta.updatedAt = new Date().toISOString();

    localStorage.setItem(
        APP_CONFIG.storageKey,
        JSON.stringify(normalized)
    );

    return normalized;

}


/* =========================================================
   EXPORT BACKUP
========================================================= */

function createBackupPayload(data) {

    return {

        application: APP_CONFIG.appName,

        version: APP_CONFIG.version,

        backupVersion: APP_CONFIG.backupVersion,

        exportedAt: new Date().toISOString(),

        data: normalizeData(data)

    };

}


/* =========================================================
   VALIDATE BACKUP
========================================================= */

function validateBackup(payload) {

    if (!payload || typeof payload !== "object") {
        return {
            valid: false,
            message: "Format file tidak valid."
        };
    }

    if (!payload.data || typeof payload.data !== "object") {
        return {
            valid: false,
            message: "Data backup tidak ditemukan."
        };
    }

    if (!Array.isArray(payload.data.brands)) {
        return {
            valid: false,
            message: "Data Brand tidak valid."
        };
    }

    if (!Array.isArray(payload.data.products)) {
        return {
            valid: false,
            message: "Data Produk tidak valid."
        };
    }

    return {
        valid: true,
        message: "Backup valid."
    };

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatCurrency(value, currency = "IDR") {

    const number = Number(value) || 0;

    if (currency === "USD") {

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(number);

    }

    return "Rp " + new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0
    }).format(number);

}


/* =========================================================
   FORMAT ANGKA
========================================================= */

function formatNumber(value) {

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2
    }).format(Number(value) || 0);

}


/* =========================================================
   DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


/* =========================================================
   INITIAL DATA
========================================================= */

let appData = loadData();