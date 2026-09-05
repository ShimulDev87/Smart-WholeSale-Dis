// ==========================================
// 1. UTILITY: বাংলা সংখ্যা কনভার্টার
// ==========================================
function toBanglaNum(num) {
    if (num === null || num === undefined) return '';
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, digit => banglaDigits[digit]);
}

// ==========================================
// 2. MODAL HELPERS & STORAGE
// ==========================================
function getModalInstance(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (window.bootstrap && window.bootstrap.Modal) {
        return bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    }
    return null;
}
function showModal(id) { const m = getModalInstance(id); if (m) m.show(); }
function hideModal(id) { const m = getModalInstance(id); if (m) m.hide(); }

function saveDataToLocalStorage() {
    localStorage.setItem('companyName', state.companyName);
    localStorage.setItem('orders', JSON.stringify(state.orders));
    localStorage.setItem('routesData', JSON.stringify(routesData));
    localStorage.setItem('products', JSON.stringify(products));
}

function loadDataFromLocalStorage() {
    const savedName = localStorage.getItem('companyName');
    if (savedName) state.companyName = savedName;

    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) state.orders = JSON.parse(savedOrders);

    const savedRoutes = localStorage.getItem('routesData');
    if (savedRoutes) routesData = JSON.parse(savedRoutes);

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
}
// ==========================================
// ১. নির্ভুল ফায়ারবেজ কনফিগারেশন
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyD3-W9Y-2w3ZdnsHjgc0qo6Hl_i2fMiv6I",
    authDomain: "smart-wholesale.firebaseapp.com",
    // Realtime Database-এর জন্য এই লাইনটি আবশ্যক:
    databaseURL: "https://smart-wholesale-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    projectId: "smart-wholesale",
    storageBucket: "smart-wholesale.firebasestorage.app",
    messagingSenderId: "449335656306",
    appId: "1:449335656306:web:cc1dbc1cdfaafbc488a7eb",
    measurementId: "G-1YS0NF32LT"
};

// ==========================================
// ২. ফায়ারবেজ ইনিশিয়ালাইজেশন (Auth + Database)
// ==========================================
let auth = null;
let db = null;

if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.database(); // ফায়ারবেজ ডাটাবেজ অন করা হলো
        console.log("✅ Firebase Database সফলভাবে কানেক্ট হয়েছে!");
    } catch (e) {
        console.error("Firebase Init Error:", e.message);
    }
}

function openAuthModal() { showModal('userAuthModal'); }

function firebaseSignUp() {
    const email = document.getElementById('authUserEmail').value.trim();
    const pass = document.getElementById('authUserPass').value.trim();
    if (!email || !pass) return alert("দয়া করে ইমেইল ও পাসওয়ার্ড লিখুন!");
    if (!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
        alert("ডেমো মোডে সাইন আপ সম্পন্ন দেখাচ্ছে।");
        hideModal('userAuthModal');
        return;
    }
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => { alert("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!"); hideModal('userAuthModal'); })
        .catch((error) => alert("সাইন আপ ত্রুটি: " + error.message));
}
function firebaseLogin() {
    const email = document.getElementById('authUserEmail').value.trim();
    const pass = document.getElementById('authUserPass').value.trim();
    if (!email || !pass) return alert("দয়া করে ইমেইল ও পাসওয়ার্ড লিখুন!");
    if (!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
        alert("ডেমো মোডে লগইন সফল হয়েছে!");
        hideModal('userAuthModal');
        const authBtnText = document.getElementById('authBtnText');
        if (authBtnText) authBtnText.innerText = `লগআউট (${email.split('@')[0]})`;
        return;
    }
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => { alert("সফলভাবে লগইন হয়েছে!"); hideModal('userAuthModal'); })
        .catch((error) => alert("লগইন ত্রুটি: " + error.message));
}
function firebaseLogout() {
    if (!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
        alert("লগআউট সম্পন্ন হয়েছে!");
        const authBtnText = document.getElementById('authBtnText');
        if (authBtnText) authBtnText.innerText = "সাইন ইন / অ্যাকাউন্ট";
        return;
    }
    auth.signOut().then(() => alert("লগআউট সম্পন্ন হয়েছে!")).catch((error) => alert("ত্রুটি: " + error.message));
}

// ==========================================
// 4. DATA & APP STATE
// ==========================================
const divisionsData = {
    "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "নরসিংদী", "রাজবাড়ী", "শরীয়তপুর", "গোপালগঞ্জ", "মাদারীপুর", "কিশোরগঞ্জ"],
    "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ফেনী", "ব্রাহ্মণবাড়িয়া", "নোয়াখালী", "লক্ষ্মীপুর", "চাঁদপুর", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি"],
    "রাজশাহী": ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নাটোর", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট"],
    "খুলনা": ["খুলনা", "যশোর", "কুষ্টিয়া", "সাতক্ষীরা", "বাগেরহাট", "ঝিনাইদহ", "চুয়াডাঙ্গা", "মেহেরপুর", "মাগুরা", "নড়াইল"],
    "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"],
    "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
    "রংপুর": ["রংপুর", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "লালমনিরহাট"],
    "ময়মনসিংহ": ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোণা"]
};

const ALL_BUSINESS_CATEGORIES = ["মুদি ও খাদ্য", "ফার্মেসি", "কনফেকশনারি", "ইলেক্ট্রনিক্স", "স্টেশনারি"];

let state = {
    companyName: "স্মার্ট হোলসেল ডিস্ট্রিবিউশন",
    orders: []
};
let routesData = {};
let products = [];
let cart = [];

const categoryList = [
    { name: "মুদি ও খাদ্য", unit: "বস্তা", count: 10, baseNames: ["মিনিকেট চাল", "নাজিরশাইল চাল", "মসুর ডাল", "আটা", "ময়দা", "চিনি", "লবণ", "সুজি", "সোয়াবিন তেল", "সরিষার তেল"] },
    { name: "ফার্মেসি", unit: "প্যাকেট", count: 8, baseNames: ["নাপা এক্সট্রা", "সেফ-৩", "সার্জেল ২০", "অ্যান্টাসিড প্লাস", "ফ্লেক্সো ১২০", "এজিথ্রোমাইসিন", "অমিপ্রাজল", "প্যারাসিটামল সিরাপ"] },
    { name: "কনফেকশনারি", unit: "পিস", count: 6, baseNames: ["অলটাইম কেক", "ডেয়ারি মিল্ক চকলেট", "পটেটো চিপস", "মিষ্টার বিস্কুট", "ওয়েফার বার", "বুমবুম চিউয়িংগাম"] },
    { name: "ইলেক্ট্রনিক্স", unit: "পিস", count: 5, baseNames: ["এলইডি বাল্ব ১২W", "মাল্টিপ্লাগ ৫গ্যাং", "সুইচ বোর্ড", "সিলিং ফ্যান", "চার্জার ক্যাবল টাইপ-সি"] },
    { name: "স্টেশনারি", unit: "ডজন", count: 5, baseNames: ["এ৪ পেপার রিম", "মেটাডোর অলটাইম কলম", "পেন্সিল বক্স", "খাতা ১২০ পেজ", "ইরেজার প্যাক"] }
];

function initializeDefaultProducts() {
    if (products.length > 0) return;
    let pId = 101;
    categoryList.forEach(cat => {
        for (let i = 1; i <= cat.count; i++) {
            const baseName = cat.baseNames[(i - 1) % cat.baseNames.length];
            let price = (baseName === "মিনিকেট চাল") ? 347 : Math.floor(Math.random() * 400) + 40;
            let kgValue = (cat.unit === "বস্তা") ? `${[5, 10, 20, 30][i % 4]} kg` : "";
            products.push({
                id: pId++,
                name: `${baseName} (ভ্যারিয়েন্ট ${toBanglaNum(Math.ceil(i / 2))})`,
                category: cat.name,
                unit: cat.unit,
                kg: kgValue,
                price: price,
                stock: Math.floor(Math.random() * 150) + 20
            });
        }
    });
}

// ==========================================
// 5. NAVIGATION (বাগ ফিক্সড)
// ==========================================
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('d-none');
}

function showHomeView() {
    showSection('home-view');
    const memoPane = document.getElementById('memo-pane');
    if (memoPane) memoPane.classList.remove('show', 'active');
    const inventoryTabBtn = document.getElementById('inventory-tab');
    if (inventoryTabBtn && typeof bootstrap !== 'undefined') {
        new bootstrap.Tab(inventoryTabBtn).show();
    }
}

// ==========================================
// 6. MANAGER / OWNER LOGIC
// ==========================================
function getOwnerProfile() {
    const raw = localStorage.getItem('activeOwnerProfile');
    return raw ? JSON.parse(raw) : null;
}

function openManagerPanel() {
    const owner = getOwnerProfile();
    const isLoggedIn = sessionStorage.getItem('isManagerLoggedIn') === 'true';

    if (!owner) {
        showManagerAuthModal('register');
    } else if (!isLoggedIn) {
        showManagerAuthModal('login');
    } else {
        loadManagerPanelData();
    }
}
function openManagerAuthModal() { openManagerPanel(); }

function showManagerAuthModal(mode) {
    const regForm = document.getElementById('managerRegisterForm');
    const loginForm = document.getElementById('managerLoginForm');
    const title = document.getElementById('managerModalTitle');

    if (mode === 'login') {
        if (regForm) regForm.classList.add('d-none');
        if (loginForm) loginForm.classList.remove('d-none');
        if (title) title.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i>ম্যানেজার প্যানেল লগইন';
    } else {
        if (loginForm) loginForm.classList.add('d-none');
        if (regForm) regForm.classList.remove('d-none');
        if (title) title.innerHTML = '<i class="fa-solid fa-user-shield me-2"></i>স্টোর ও ম্যানেজার অ্যাকাউন্ট সেটআপ';
    }
    showModal('managerAuthModal');
}

function handleManagerRegister(e) {
    e.preventDefault();
    const selectedCategories = [];
    document.querySelectorAll('.owner-cat-checkbox:checked').forEach(cb => selectedCategories.push(cb.value));

    if (selectedCategories.length === 0) return alert('কমপক্ষে একটি বিজনেস ক্যাটাগরি সিলেক্ট করুন!');

    const companyName = document.getElementById('setupCompanyName').value.trim();
    const phone = document.getElementById('setupPhone').value.trim();

    if (!companyName || !phone) return alert('কোম্পানির নাম ও ফোন নম্বর আবশ্যক!');

    const ownerProfile = {
        companyName: companyName,
        ownerName: document.getElementById('setupOwnerName').value.trim(),
        phone: phone,
        password: document.getElementById('setupPassword').value,
        categories: selectedCategories
    };

    localStorage.setItem('activeOwnerProfile', JSON.stringify(ownerProfile));
    sessionStorage.setItem('isManagerLoggedIn', 'true');

    hideModal('managerAuthModal');
    applyOwnerConfig(ownerProfile);
    loadManagerPanelData();
}

function handleManagerLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginManagerPhone').value.trim();
    const pass = document.getElementById('loginManagerPassword').value;
    const owner = getOwnerProfile();

    if (owner && owner.phone === phone && owner.password === pass) {
        sessionStorage.setItem('isManagerLoggedIn', 'true');
        hideModal('managerAuthModal');
        applyOwnerConfig(owner);
        loadManagerPanelData();
    } else {
        alert('ফোন নম্বর বা পাসওয়ার্ড ভুল হয়েছে!');
    }
}

function logoutManager() {
    if (confirm('আপনি কি ম্যানেজার প্যানেল থেকে লগআউট করতে চান?')) {
        sessionStorage.removeItem('isManagerLoggedIn');
        showHomeView();
    }
}

function loadManagerPanelData() {
    showSection('manager-view');
    renderCategorySettingsCheckboxes();
    renderManagerTable();
    initDivisions();
    updateRouteDropdowns();
    updateSrSetupRouteDropdown();
    loadBazarForm();
    generateDailySummary();
    renderMemoList();
    renderSRListTable(); // পেজ লোডে এসআর টেবিল রেন্ডার
}

function applyOwnerConfig(owner) {
    if (!owner) return;
    state.companyName = owner.companyName;
    localStorage.setItem('companyName', owner.companyName);
    syncCompanyNameToUI(owner.companyName);
    localStorage.setItem('selectedCategories', JSON.stringify(owner.categories || []));
    syncCategoriesGlobally(owner.categories || []);
    saveDataToLocalStorage();
}

function syncCompanyNameToUI(name) {
    const header = document.getElementById('displayCompanyName');
    if (header) header.innerText = name;
    const welcome = document.getElementById('welcomeCompanyName');
    if (welcome) welcome.innerText = name;
    const printName = document.getElementById('printCompanyName');
    if (printName) printName.innerText = name;
}

function syncCategoriesGlobally(categories) {
    if (!categories || categories.length === 0) categories = ALL_BUSINESS_CATEGORIES;

    const mgrSelect = document.getElementById('mgrCategorySelect');
    if (mgrSelect) {
        const current = mgrSelect.value;
        let html = '';
        categories.forEach((cat, idx) => {
            html += `<option value="${cat}" ${idx === 0 ? 'selected' : ''}>ক্যাটাগরি: ${cat}</option>`;
        });
        html += `<option value="ALL">সকল ক্যাটাগরি</option>`;
        mgrSelect.innerHTML = html;
        if (categories.includes(current) || current === 'ALL') mgrSelect.value = current;
        filterMgrProducts();
    }

    const srFilter = document.getElementById('categoryFilter');
    if (srFilter) {
        const current = srFilter.value || 'ALL';
        let html = `<option value="ALL">সকল ক্যাটাগরি</option>`;
        categories.forEach(cat => { html += `<option value="${cat}">${cat}</option>`; });
        srFilter.innerHTML = html;
        if (categories.includes(current) || current === 'ALL') srFilter.value = current;
    }

    const modalCat = document.getElementById('modalProductCategory');
    if (modalCat) {
        const current = modalCat.value;
        let html = '';
        categories.forEach(cat => { html += `<option value="${cat}">${cat}</option>`; });
        modalCat.innerHTML = html;
        if (categories.includes(current)) modalCat.value = current;
    }
}

function renderCategorySettingsCheckboxes() {
    const container = document.getElementById('categorySettingsCheckboxArea');
    if (!container) return;

    const owner = getOwnerProfile();
    const selected = owner ? (owner.categories || []) : ALL_BUSINESS_CATEGORIES;

    let html = '';
    ALL_BUSINESS_CATEGORIES.forEach((cat, i) => {
        const checked = selected.includes(cat) ? 'checked' : '';
        html += `
            <div class="col-md-4 col-6">
                <div class="form-check">
                    <input class="form-check-input category-settings-checkbox" type="checkbox" value="${cat}" id="catSetting_${i}" ${checked}>
                    <label class="form-check-label" for="catSetting_${i}">${cat}</label>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function saveOwnerCategories() {
    const owner = getOwnerProfile();
    if (!owner) return alert('আগে ম্যানেজার অ্যাকাউন্ট সেটআপ করুন!');

    const selected = [];
    document.querySelectorAll('.category-settings-checkbox:checked').forEach(cb => selected.push(cb.value));

    if (selected.length === 0) return alert('কমপক্ষে একটি ক্যাটাগরি সিলেক্ট রাখতে হবে!');

    owner.categories = selected;
    localStorage.setItem('activeOwnerProfile', JSON.stringify(owner));
    applyOwnerConfig(owner);
    alert('✅ ক্যাটাগরি তালিকা সফলভাবে আপডেট করা হয়েছে!');
}

function openEditCompanyModal() {
    const owner = getOwnerProfile();
    const currentName = (owner && owner.companyName) || localStorage.getItem('companyName') || state.companyName;

    const input = document.getElementById('modalCompanyNameInput');
    const pinInput = document.getElementById('modalOwnerPinInput');
    if (input) input.value = currentName;
    if (pinInput) pinInput.value = '';

    showModal('editCompanyModal');
}

function updateCompanyNameFromModal() {
    const newName = document.getElementById('modalCompanyNameInput')?.value.trim();
    const enteredPin = document.getElementById('modalOwnerPinInput')?.value.trim();
    const owner = getOwnerProfile();

    if (!newName) return alert('⚠️ দয়া করে কোম্পানির একটি নাম দিন!');
    if (!owner) return alert('⚠️ প্রথমে ম্যানেজার অ্যাকাউন্ট সেটআপ করুন!');
    if (!enteredPin) return alert('⚠️ নিরাপত্তা নিশ্চিত করতে ওনার পাসওয়ার্ড দিন!');

    if (enteredPin !== owner.password) return alert('❌ ভুল পাসওয়ার্ড!');

    owner.companyName = newName;
    localStorage.setItem('activeOwnerProfile', JSON.stringify(owner));
    applyOwnerConfig(owner);

    hideModal('editCompanyModal');
    alert('✅ কোম্পানির নাম সফলভাবে আপডেট করা হয়েছে।');
}

// ==========================================
// 7. INVENTORY CONTROL (কলাম কন্সিস্টেন্সি বাগ ফিক্সড)
// ==========================================
function renderManagerTable() { filterMgrProducts(); }

function filterMgrProducts() {
    const searchInput = document.getElementById('mgrSearchInput');
    const catSelect = document.getElementById('mgrCategorySelect');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCat = catSelect ? catSelect.value : 'ALL';

    const filtered = products.filter(p => {
        const matchName = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        const matchCat = (selectedCat === "ALL" || p.category === selectedCat);
        return matchName && matchCat;
    });

    const countElem = document.getElementById('totalProductCount');
    if (countElem) countElem.innerText = filtered.length;

    const tbody = document.getElementById('mgrProductTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">কোনো প্রোডাক্ট পাওয়া যায়নি!</td></tr>';
        return;
    }

    filtered.forEach(p => {
        let unitDisplay = p.unit === "বস্তা" ? `বস্তা (${p.kg ? p.kg : '20 kg'})` : p.unit;
        tbody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td class="fw-bold">${p.name}</td>
                <td><span class="badge bg-secondary">${p.category}</span></td>
                <td><span class="badge bg-light text-dark border">${unitDisplay}</span></td>
                <td>${p.stock} টি</td>
                <td class="text-success fw-bold">৳ ${p.price}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditProductModal(${p.id})" title="এডিট করুন"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})" title="ডিলিট করুন"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function toggleKgDropdown() {
    const unit = document.getElementById('modalProductUnit').value;
    const kgWrapper = document.getElementById('kgDropdownWrapper');
    if (kgWrapper) unit === "বস্তা" ? kgWrapper.classList.remove('d-none') : kgWrapper.classList.add('d-none');
}

function handleCustomKgInput() {
    const kgSelect = document.getElementById('modalProductKgSelect').value;
    const customInput = document.getElementById('modalCustomKgInput');
    if (customInput) kgSelect === "CUSTOM" ? customInput.classList.remove('d-none') : customInput.classList.add('d-none');
}

function openAddProductModal() {
    document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2"></i>নতুন প্রোডাক্ট যুক্ত করুন';
    document.getElementById('editProductId').value = '';
    document.getElementById('modalProductName').value = '';

    const mgrCat = document.getElementById('mgrCategorySelect').value;
    const modalCatSelect = document.getElementById('modalProductCategory');
    if (modalCatSelect) {
        modalCatSelect.value = (mgrCat && mgrCat !== 'ALL') ? mgrCat : modalCatSelect.options[0]?.value;
    }

    document.getElementById('modalProductUnit').value = 'বস্তা';
    document.getElementById('modalProductKgSelect').value = '20 kg';
    document.getElementById('modalCustomKgInput').value = '';
    document.getElementById('modalCustomKgInput').classList.add('d-none');
    document.getElementById('modalProductStock').value = '100';
    document.getElementById('modalProductPrice').value = '350';

    toggleKgDropdown();
    showModal('productFormModal');
}

function openEditProductModal(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2"></i>প্রোডাক্ট এডিট করুন';
    document.getElementById('editProductId').value = p.id;
    document.getElementById('modalProductName').value = p.name;
    document.getElementById('modalProductCategory').value = p.category;
    document.getElementById('modalProductUnit').value = p.unit;

    if (p.unit === "বস্তা") {
        const kgVal = p.kg || "20 kg";
        if (["5 kg", "10 kg", "20 kg", "30 kg", "50 kg"].includes(kgVal)) {
            document.getElementById('modalProductKgSelect').value = kgVal;
            document.getElementById('modalCustomKgInput').classList.add('d-none');
        } else {
            document.getElementById('modalProductKgSelect').value = "CUSTOM";
            document.getElementById('modalCustomKgInput').value = kgVal;
            document.getElementById('modalCustomKgInput').classList.remove('d-none');
        }
    }

    document.getElementById('modalProductStock').value = p.stock;
    document.getElementById('modalProductPrice').value = p.price;

    toggleKgDropdown();
    showModal('productFormModal');
}

function saveProduct() {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('modalProductName').value.trim();
    const category = document.getElementById('modalProductCategory').value;
    const unit = document.getElementById('modalProductUnit').value;
    const stock = parseInt(document.getElementById('modalProductStock').value) || 0;
    const price = parseInt(document.getElementById('modalProductPrice').value) || 0;

    if (!name) return alert("দয়া করে প্রোডাক্টের নাম লিখুন!");

    let kgValue = "";
    if (unit === "বস্তা") {
        const kgSelect = document.getElementById('modalProductKgSelect').value;
        kgValue = (kgSelect === "CUSTOM") ? (document.getElementById('modalCustomKgInput').value.trim() || "20 kg") : kgSelect;
    }

    if (id) {
        const p = products.find(item => item.id == id);
        if (p) {
            p.name = name; p.category = category; p.unit = unit; p.kg = kgValue; p.stock = stock; p.price = price;
            alert("প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!");
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 101;
        products.unshift({ id: newId, name, category, unit, kg: kgValue, stock, price });
        alert("নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!");
    }

    saveDataToLocalStorage();
    hideModal('productFormModal');
    filterMgrProducts();
}

function deleteProduct(id) {
    if (confirm("আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products.splice(index, 1);
            saveDataToLocalStorage();
            filterMgrProducts();
            alert("প্রোডাক্ট ডিলিট করা হয়েছে!");
        }
    }
}

// ==========================================
// 8. ROUTE, BAZAR & SHOP SETUP
// ==========================================
function initDivisions() {
    const divSelect = document.getElementById('divisionSelect');
    if (!divSelect) return;
    divSelect.innerHTML = '<option value="">-- বিভাগ বেছে নিন --</option>';
    Object.keys(divisionsData).forEach(div => divSelect.innerHTML += `<option value="${div}">${div}</option>`);
}

function loadDistricts() {
    const divSelect = document.getElementById('divisionSelect');
    const distSelect = document.getElementById('districtSelect');
    if (!divSelect || !distSelect) return;
    const div = divSelect.value;
    distSelect.innerHTML = '<option value="">-- জেলা বেছে নিন --</option>';
    if (div && divisionsData[div]) divisionsData[div].forEach(d => distSelect.innerHTML += `<option value="${d}">${d}</option>`);
}

function addRoute() {
    const routeInput = document.getElementById('newRouteInput');
    const routeName = routeInput ? routeInput.value.trim() : '';
    if (!routeName) return alert("রুটের নাম লিখুন!");

    if (!routesData[routeName]) {
        routesData[routeName] = { bazars: [], shops: {} };
        alert(`'${routeName}' সফলভাবে যুক্ত হয়েছে!`);
        if (routeInput) routeInput.value = '';
        saveDataToLocalStorage();
        updateRouteDropdowns();
        updateSrSetupRouteDropdown();
    } else {
        alert("এই রুটটি আগেই তৈরি করা আছে!");
    }
}

function updateRouteDropdowns() {
    const setupSelect = document.getElementById('setupRouteSelect');
    if (setupSelect) {
        setupSelect.innerHTML = '<option value="">-- রুট নির্বাচন করুন --</option>';
        Object.keys(routesData).forEach(r => setupSelect.innerHTML += `<option value="${r}">${r}</option>`);
    }
}

let currentRoute = "";
let activeBazarIndex = 0;

function loadBazarForm() {
    const routeSelect = document.getElementById('setupRouteSelect');
    currentRoute = routeSelect ? routeSelect.value : "";
    activeBazarIndex = 0;

    renderTopBazarInputs();
    renderShopTableRows();
}

function renderTopBazarInputs() {
    const container = document.getElementById('bazarInputsContainer');
    if (!container) return;
    container.innerHTML = '';
    const bazars = (currentRoute && routesData[currentRoute] && routesData[currentRoute].bazars) ? routesData[currentRoute].bazars : [];

    for (let i = 0; i < 5; i++) {
        const isActive = (i === activeBazarIndex);
        const val = bazars[i] || '';
        container.innerHTML += `
            <div class="col-md-4 col-6 mb-2">
                <input type="text" class="form-control ${isActive ? 'border-primary border-2 fw-bold shadow-sm' : ''}"
                       value="${val}" onfocus="switchActiveBazar(${i})" oninput="onTopBazarType(${i}, this.value)"
                       placeholder="বাজারের নাম ${i + 1}">
            </div>`;
    }
}

function onTopBazarType(index, newValue) {
    if (!currentRoute || !routesData[currentRoute]) return;
    if (!routesData[currentRoute].bazars) routesData[currentRoute].bazars = [];
    routesData[currentRoute].bazars[index] = newValue;
    if (index === activeBazarIndex) updateShopSectionTitle(newValue);
}

function switchActiveBazar(newIndex) {
    if (newIndex === activeBazarIndex) return;
    saveCurrentShopInputs();
    activeBazarIndex = newIndex;
    renderTopBazarInputs();
    renderShopTableRows();
}

function updateShopSectionTitle(bazarName) {
    const shopTitle = document.getElementById('shopSectionTitle');
    if (!shopTitle) return;
    const routeText = currentRoute ? `"${currentRoute}" রুটের, ` : '';
    const nameText = bazarName ? `"${bazarName}"-এর ` : '';
    shopTitle.innerText = `${routeText}${nameText}১০টি দোকানের তথ্য ইনপুট দিন:`;
}

function saveCurrentShopInputs() {
    if (!currentRoute) return;
    const rows = document.querySelectorAll('#shopInputsContainer tr');
    const shopsList = [];
    rows.forEach(row => {
        const sName = row.querySelector('.shop-name-input').value.trim();
        const owner = row.querySelector('.shop-owner-input').value.trim();
        const phone = row.querySelector('.shop-phone-input').value.trim();
        shopsList.push({ name: sName, owner, phone });
    });
    if (!routesData[currentRoute].shops) routesData[currentRoute].shops = {};
    routesData[currentRoute].shops[activeBazarIndex] = shopsList;
}

function renderShopTableRows() {
    const sContainer = document.getElementById('shopInputsContainer');
    if (!sContainer) return;

    let activeBazarName = '';
    if (currentRoute && routesData[currentRoute]) {
        const bazars = routesData[currentRoute].bazars || [];
        activeBazarName = bazars[activeBazarIndex] || '';
    }

    updateShopSectionTitle(activeBazarName);

    let existingShops = [];
    if (currentRoute && routesData[currentRoute]) {
        existingShops = (routesData[currentRoute].shops && routesData[currentRoute].shops[activeBazarIndex]) || [];
    }

    sContainer.innerHTML = '';
    for (let j = 0; j < 10; j++) {
        const shop = existingShops[j] || { name: '', owner: '', phone: '' };
        sContainer.innerHTML += `
            <tr>
                <td class="text-center fw-bold text-muted">${j + 1}</td>
                <td><input type="text" class="form-control shop-name-input" value="${shop.name || ''}" placeholder="দোকানের নাম"></td>
                <td><input type="text" class="form-control shop-owner-input" value="${shop.owner || ''}" placeholder="মালিকের নাম"></td>
                <td><input type="tel" class="form-control shop-phone-input" value="${shop.phone || ''}" placeholder="ফোন নম্বর"></td>
            </tr>`;
    }
}

function saveBazarAndShops() {
    if (!currentRoute) return alert("দয়া করে রুট নির্বাচন করুন!");
    saveCurrentShopInputs();
    saveDataToLocalStorage();
    alert(`'${currentRoute}' রুটের সকল বাজার ও দোকান সফলভাবে সেভ করা হয়েছে!`);
}

// ==========================================
// 9. MANAGER SR SETUP & SYSTEM INTEGRATION (বাগ ফিক্সড)
// ==========================================
function updateSrSetupRouteDropdown() {
    const srRouteSelect = document.getElementById('newSrRouteSelect');
    if (!srRouteSelect) return;
    let options = '<option value="">-- রুট নির্বাচন করুন --</option>';
    Object.keys(routesData || {}).forEach(r => options += `<option value="${r}">${r}</option>`);
    srRouteSelect.innerHTML = options;
}

function onSrSetupRouteSelect() {
    const routeSelect = document.getElementById('newSrRouteSelect');
    const bazarSelect = document.getElementById('newSrBazarSelect');
    if (!routeSelect || !bazarSelect) return;

    const selectedRoute = routeSelect.value;
    let options = '<option value="">-- বাজার নির্বাচন করুন --</option>';

    if (selectedRoute && routesData[selectedRoute] && Array.isArray(routesData[selectedRoute].bazars)) {
        routesData[selectedRoute].bazars.forEach(bazar => {
            const bName = typeof bazar === 'string' ? bazar : (bazar ? bazar.name : '');
            if (bName) options += `<option value="${bName}">${bName}</option>`;
        });
    }
    bazarSelect.innerHTML = options;
}
// ==========================================
// ১. ম্যানেজার নতুন SR তৈরি করার ফাংশন (লোকাল + ফায়ারবেজ)
// ==========================================
function handleManagerCreateSR(event) {
    event.preventDefault();
    const name = document.getElementById('newSrName')?.value.trim();
    const phone = document.getElementById('newSrPhone')?.value.trim();
    const route = document.getElementById('newSrRouteSelect')?.value || '';
    const bazar = document.getElementById('newSrBazarSelect')?.value || '';

    if (!name || !phone) return alert('নাম ও ফোন নম্বর প্রদান করুন!');

    const generatedSrID = 'SR-' + Math.floor(1000 + Math.random() * 9000);
    const defaultPassword = '123456';

    // স্ট্যান্ডার্ড অবজেক্ট তৈরি (সব ধরনের কি-নাম কভার করা হয়েছে)
    const newSrObj = {
        id: generatedSrID,
        srId: generatedSrID,
        name: name,
        phone: phone,
        route: route,
        assignedRoute: route,
        bazar: bazar,
        assignedBazar: bazar,
        password: defaultPassword,
        address: 'ম্যানেজার প্যানেল হতে রেজিস্টার্ড'
    };

    // ১. লোকাল স্টোরেজে সেভ
    let appSrAccounts = JSON.parse(localStorage.getItem('app_sr_accounts') || '[]');
    appSrAccounts.push(newSrObj);
    localStorage.setItem('app_sr_accounts', JSON.stringify(appSrAccounts));

    let srAccounts = JSON.parse(localStorage.getItem('srAccounts') || '[]');
    if (!srAccounts.find(a => a.phone === phone)) {
        srAccounts.push(newSrObj);
        localStorage.setItem('srAccounts', JSON.stringify(srAccounts));
    }

    if (typeof state !== 'undefined') {
        if (!Array.isArray(state.srs)) state.srs = [];
        state.srs.push(newSrObj);
        if (typeof saveDataToLocalStorage === 'function') saveDataToLocalStorage();
    }

    // ২. ফায়ারবেজ ক্লাউড ডাটাবেজে সেভ (অন্যান্য ডিভাইসে সাথে সাথে পাঠানোর জন্য)
    saveSRToCloud(newSrObj);

    alert(`✅ এসআর অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!\nএসআর আইডি: ${generatedSrID}\nডিফল্ট পাসওয়ার্ড: ${defaultPassword}`);
    
    const form = document.getElementById('managerCreateSrForm');
    if (form) form.reset();
    
    if (typeof renderSRListTable === 'function') renderSRListTable();
}

// ==========================================
// ২. ক্লাউডে সেভ করার ফিক্সড ফাংশন (সংশোধিত)
// ==========================================
function saveSRToCloud(srData) {
    // ফায়ারবেজ কানেক্টেড থাকলে ক্লাউডে পুশ করবে
    if (typeof db !== 'undefined' && db) {
        const keyId = srData.id || srData.srId;
        db.ref('srs/' + keyId).set(srData)
            .then(() => console.log("✅ SR অ্যাকাউন্ট ক্লাউডে সফলভাবে সেভ হয়েছে!"))
            .catch((err) => console.error("❌ Cloud Save Error:", err));
    } else {
        console.warn("⚠️ Firebase DB রেডি নেই, ডাটা ক্লাউডে সেভ হয়নি।");
    }
}

// ==========================================
// ৩. অন্য ডিভাইস থেকে অটো-সিঙ্ক হওয়ার ফিক্সড ফাংশন (সংশোধিত)
// ==========================================
function syncSRsFromCloud() {
    // ফায়ারবেজ না থাকলে স্কিপ করবে
    if (typeof db === 'undefined' || !db) return;

    db.ref('srs').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const srList = Object.values(data);
            
            // ১. Local State ও Storage সিঙ্ক
            if (typeof state !== 'undefined') {
                state.srs = srList;
                if (typeof saveDataToLocalStorage === 'function') saveDataToLocalStorage();
            }

            localStorage.setItem('app_sr_accounts', JSON.stringify(srList));
            localStorage.setItem('srAccounts', JSON.stringify(srList));
            
            // ২. ম্যানেজার প্যানেলের SR টেবিল রিয়েল-টাইমে রিফ্রেশ
            if (typeof renderSRListTable === 'function') renderSRListTable();
        }
    });
}

// অ্যাপ লোড হওয়ার সময় ফায়ারবেজ লিস্টেনার অন হবে
document.addEventListener('DOMContentLoaded', () => {
    syncSRsFromCloud();
});


function renderSRListTable() {
    const srList = JSON.parse(localStorage.getItem('app_sr_accounts') || '[]');
    const tbody = document.getElementById('srListTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (srList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">কোনো এসআর অ্যাকাউন্ট পাওয়া যায়নি</td></tr>';
        return;
    }

    srList.forEach(sr => {
        tbody.innerHTML += `
            <tr>
                <td><span class="badge bg-primary fs-6">${sr.srId}</span></td>
                <td><strong>${sr.name}</strong></td>
                <td>${sr.phone}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSRAccount('${sr.srId}', '${sr.phone}')" title="মুছে ফেলুন">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function deleteSRAccount(srId, phone) {
    if (confirm(`আপনি কি সত্যিই SR ID: ${srId} মুছে ফেলতে চান?`)) {
        let appSrList = JSON.parse(localStorage.getItem('app_sr_accounts') || '[]');
        appSrList = appSrList.filter(sr => sr.srId !== srId);
        localStorage.setItem('app_sr_accounts', JSON.stringify(appSrList));

        let srAccounts = JSON.parse(localStorage.getItem('srAccounts') || '[]');
        srAccounts = srAccounts.filter(sr => sr.phone !== phone);
        localStorage.setItem('srAccounts', JSON.stringify(srAccounts));

        renderSRListTable();
    }
}
// ==========================================
// 10. SR PANEL AUTH & ROUTING
// ==========================================

function switchToSRView() {
    const activeSR = localStorage.getItem('activeSR');
    if (activeSR) {
        sessionStorage.removeItem('isManagerLoggedIn');
        loadSRProfileIntoPanel();
        showSection('sr-view');
        populateSRRoutes();
        renderDefaultShopSlots();
        renderSRProducts(products || []);
    } else {
        showModal('srAuthModal');
    }
}

// পাসওয়ার্ড ছাড়াই শুধুমাত্র SR ID দিয়ে সরাসরি প্রবেশ
// LocalStorage ব্যবহার করে পাসওয়ার্ড ছাড়া সরাসরি SR Login
// ==========================================
// স্মার্ট এসআর লগইন (সব ডিভাইস ও ফায়ারবেজ সামঞ্জস্যপূর্ণ)
// ==========================================
async function handleSRLogin(event) {
    if (event) event.preventDefault(); // পেইজ রিলোড হওয়া আটকানো

    const inputElem = document.getElementById('loginSrId');
    let userSrId = inputElem ? inputElem.value.trim() : '';

    if (!userSrId) return alert("দয়া করে এসআর আইডি লিখুন!");

    // ১. আইডি ফরম্যাট ঠিক করা (যেমন: 6811 লিখলে অটো SR-6811 বানিয়ে নেওয়া)
    userSrId = userSrId.toUpperCase();
    if (!userSrId.startsWith('SR-') && !isNaN(userSrId)) {
        userSrId = 'SR-' + userSrId;
    }

    let foundSR = null;

    // ২. ফায়ারবেজ থেকে সরাসরি আইডি খোঁজা
    if (typeof db !== 'undefined' && db) {
        try {
            // সরাসরি আইডি নোডে চেক করা
            const snapshot = await db.ref('srs/' + userSrId).once('value');
            if (snapshot.exists()) {
                foundSR = snapshot.val();
            } else {
                // সব SR লিস্ট থেকে ফ্লেক্সিবল চেক
                const allSrsSnap = await db.ref('srs').once('value');
                if (allSrsSnap.exists()) {
                    const allData = allSrsSnap.val();
                    foundSR = Object.values(allData).find(sr => {
                        const sId = (sr.id || sr.srId || '').toUpperCase();
                        return sId === userSrId || sId === userSrId.replace('SR-', '');
                    });
                }
            }
        } catch (err) {
            console.error("Firebase Search Error:", err);
        }
    }

    // ৩. ফায়ারবেজে না পেলে লোকাল ডাটাবেজে খোজা (Fallback)
    if (!foundSR) {
        const localSrs = JSON.parse(localStorage.getItem('app_sr_accounts') || '[]')
            .concat(JSON.parse(localStorage.getItem('srAccounts') || '[]'));

        foundSR = localSrs.find(sr => {
            const sId = (sr.id || sr.srId || '').toUpperCase();
            return sId === userSrId || sId === userSrId.replace('SR-', '');
        });
    }

    // ৪. ফলাফল যাচাই
    if (foundSR) {
        alert(`✅ স্বাগতম, ${foundSR.name || 'এসআর'}!\nলগইন সফল হয়েছে।`);

        // একটিভ SR সেভ করা
        localStorage.setItem('activeSR', JSON.stringify(foundSR));

        // নাম ও রুট অটো সিলেক্ট করা
        const srNameInput = document.getElementById('srNameInput');
        if (srNameInput) srNameInput.value = foundSR.name || '';

        const assignedRoute = foundSR.route || foundSR.assignedRoute;
        if (assignedRoute) {
            const routeSelect = document.getElementById('srRouteSelect');
            if (routeSelect) {
                routeSelect.value = assignedRoute;
                if (typeof onSRRouteSelect === 'function') onSRRouteSelect();
            }
        }

        // মডাল বন্ধ করা
        const modalElem = document.getElementById('srAuthModal');
        if (modalElem) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modalInstance = bootstrap.Modal.getInstance(modalElem) || new bootstrap.Modal(modalElem);
                modalInstance.hide();
            } else if (typeof hideModal === 'function') {
                hideModal('srAuthModal');
            }
        }

        if (typeof switchToSRView === 'function') switchToSRView();

    } else {
        alert(`❌ ভুল এসআর আইডি: "${userSrId}"\nকোনো ডাটা পাওয়া যায়নি। অনুগ্রহ করে আইডিনম্বরটি আবার নিশ্চিত করুন।`);
    }
}

function loadSRProfileIntoPanel() {
    const activeSR = localStorage.getItem('activeSR');
    if (activeSR) {
        const srData = JSON.parse(activeSR);
        const srNameInput = document.getElementById('srNameInput');
        if (srNameInput) { 
            srNameInput.value = srData.name || srData.id; 
            srNameInput.readOnly = true; 
        }
    }
}


function logoutSR(event) {
    if (event) event.preventDefault();
    if (confirm('আপনি কি অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
        // ১. LocalStorage থেকে ডাটা ডিলিট
        localStorage.removeItem('activeSR');

        // ২. এসআর নাম ফিল্ড ফাঁকা করা
        const srNameInput = document.getElementById('srNameInput');
        if (srNameInput) {
            srNameInput.value = '';
        }

        // ৩. ভিউ চেঞ্জ করা (SR View লুকিয়ে Home View দেখানো)
        const srView = document.getElementById('sr-view');
        const homeView = document.getElementById('home-view'); // আপনার হোম সেকশনের ID

        if (srView) srView.classList.add('d-none');
        if (homeView) homeView.classList.remove('d-none');

        // অথবা যদি আপনার প্রজেক্টে showHomeView() বা showSection() ফাংশন থাকে:
        if (typeof showHomeView === 'function') {
            showHomeView();
        } else if (typeof showSection === 'function') {
            showSection('home-view');
        }

        // ৪. পুরো স্টেট ক্লিয়ার ও হোমপেজে পাঠানোর জন্য রিলোড (সবচেয়ে নির্ভরযোগ্য)
        window.location.reload();
    }
}


// ==========================================
// 11. SR POS, CARTS & SHOP GRID
// ==========================================
let selectedSRShop = null;
let selectedShopIndex = null;

function renderDefaultShopSlots() {
    const gridContainer = document.getElementById('srShopGridContainer');
    const countBadge = document.getElementById('shopCountBadge');
    if (countBadge) countBadge.classList.add('d-none');
    if (!gridContainer) return;

    let html = '';
    for (let i = 0; i < 5; i++) {
        const slotNum = toBanglaNum(i + 1);
        html += `
            <div class="col-12">
                <div class="card p-2 bg-light text-muted border-secondary border-opacity-25">
                    <div class="d-flex justify-content-between align-items-center">
                        <div><span class="badge bg-secondary me-2">#${slotNum}</span><em class="small text-secondary">দোকান নির্বাচন করা হয়নি</em></div>
                        <span class="badge bg-white text-secondary border">খালি স্লট</span>
                    </div>
                </div>
            </div>`;
    }
    gridContainer.innerHTML = html;
}

function populateSRRoutes() {
    const srRoute = document.getElementById('srRouteSelect');
    if (!srRoute) return;
    let options = '<option value="">-- রুট নির্বাচন করুন --</option>';
    Object.keys(routesData || {}).forEach(r => options += `<option value="${r}">${r}</option>`);
    srRoute.innerHTML = options;

    const bazarSelect = document.getElementById('srBazarSelect');
    if (bazarSelect) bazarSelect.innerHTML = '<option value="">-- বাজার নির্বাচন করুন --</option>';

    renderDefaultShopSlots();
}

function onSRRouteSelect() {
    const srRoute = document.getElementById('srRouteSelect');
    const bazarSelect = document.getElementById('srBazarSelect');
    const posArea = document.getElementById('posSectionArea');
    
    if (posArea) posArea.classList.add('d-none');
    selectedSRShop = null;
    if (!srRoute || !bazarSelect) return;

    const route = srRoute.value;
    let optionsHtml = '<option value="">-- বাজার নির্বাচন করুন --</option>';

    if (route && routesData[route] && Array.isArray(routesData[route].bazars)) {
        routesData[route].bazars.forEach((bazar, index) => {
            const bName = typeof bazar === 'string' ? bazar : (bazar ? bazar.name : '');
            if (bName && bName.trim() !== '') {
                optionsHtml += `<option value="${index}">${bName}</option>`;
            }
        });
    }

    bazarSelect.innerHTML = optionsHtml;
    renderDefaultShopSlots();
}

function onSRBazarSelect() {
    const srRoute = document.getElementById('srRouteSelect');
    const bazarSelect = document.getElementById('srBazarSelect');
    const gridContainer = document.getElementById('srShopGridContainer');
    const countBadge = document.getElementById('shopCountBadge');
    
    if (!srRoute || !bazarSelect || !gridContainer) return;

    const route = srRoute.value;
    const bIndex = bazarSelect.value;

    if (!route || bIndex === "" || bIndex === null) { 
        renderDefaultShopSlots(); 
        return; 
    }

    let shopList = [];
    if (routesData[route] && routesData[route].shops) {
        shopList = routesData[route].shops[bIndex] || [];
    }

    const activeShops = shopList.filter(s => s && s.name && s.name.trim() !== '');
    const totalSlots = Math.max(10, shopList.length);

    if (countBadge) {
        countBadge.classList.remove('d-none');
        countBadge.innerText = `সক্রিয় দোকান: ${activeShops.length}টি | মোট স্লট: ${totalSlots}টি`;
    }

    let html = '';
    for (let i = 0; i < totalSlots; i++) {
        const shop = shopList[i];
        const sName = shop ? shop.name || '' : '';
        const hasShop = sName.trim() !== '';

        let existingOrder = null;
        if (hasShop && state && Array.isArray(state.orders)) {
            existingOrder = state.orders.find(o => o && o.shop === sName && o.route === route);
        }
        const isOrdered = !!existingOrder;

        if (hasShop) {
            const ownerName = shop.owner || 'মালিকের নাম নেই';
            const ownerPhone = shop.phone || '';
            
            const statusBadge = isOrdered
                ? `<span class="text-success fw-bold ms-1" style="font-size: 0.85rem;">(অর্ডার সম্পন্ন)</span>`
                : `<span class="text-danger fw-bold ms-1" style="font-size: 0.85rem;">(অর্ডার বাকি)</span>`;
            
            const callBtn = ownerPhone
                ? `<a href="tel:${ownerPhone}" class="btn btn-sm btn-success rounded-circle px-2 py-1 ms-2" title="কল করুন" onclick="event.stopPropagation();"><i class="fa-solid fa-phone"></i></a>`
                : `<button class="btn btn-sm btn-outline-secondary rounded-circle px-2 py-1 ms-2" disabled><i class="fa-solid fa-phone"></i></button>`;
            
            const safeShopName = sName.replace(/'/g, "\\'");

            html += `
                <div class="col-12 mb-2">
                    <div class="card p-3 shadow-sm shop-slot-card bg-white" style="cursor: pointer; border-left: 5px solid ${isOrdered ? '#198754' : '#0d6efd'};" onclick="selectShopFromGrid('${safeShopName}', ${i})">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="d-flex align-items-center gap-1 mb-1">
                                    <span class="badge bg-primary me-1">#${i + 1}</span>
                                    <strong class="text-dark fs-6">${sName}</strong>
                                    ${statusBadge}
                                </div>
                                <div class="text-muted small">
                                    <i class="fa-solid fa-user me-1 text-secondary"></i>মালিক: <strong>${ownerName}</strong>
                                    ${ownerPhone ? `<span class="ms-2"><i class="fa-solid fa-phone me-1 text-secondary"></i>${ownerPhone}</span>` : ''}
                                </div>
                            </div>
                            <div>${callBtn}</div>
                        </div>
                    </div>
                </div>`;
        } else {
            html += `
                <div class="col-12 mb-2">
                    <div class="card p-2 bg-light text-muted border-secondary border-opacity-25">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><span class="badge bg-secondary me-2">#${i + 1}</span><em class="small text-secondary">খালি স্লট</em></div>
                            <span class="badge bg-white text-secondary border">খালি</span>
                        </div>
                    </div>
                </div>`;
        }
    }
    gridContainer.innerHTML = html;
}


function selectShopFromGrid(shopName, index) {
    selectedSRShop = shopName;
    selectedShopIndex = index;

    document.querySelectorAll('.shop-slot-card').forEach((card, idx) => {
        if (idx === index) card.classList.add('border-3', 'border-success', 'shadow');
        else card.classList.remove('border-3', 'border-success', 'shadow');
    });

    const activeShopTitle = document.getElementById('activeShopTitle');
    const posArea = document.getElementById('posSectionArea');
    const shopGrid = document.getElementById('srShopGridArea');

    if (activeShopTitle) activeShopTitle.innerText = shopName;

    // ১. অটোমেটিক আজকের তারিখ 'orderDateInput'-এ বসানো
    const dateInput = document.getElementById('orderDateInput');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // ২. দোকান সিলেক্ট হলে ৫টি দোকান স্লট লুকিয়ে ফেলা
    if (shopGrid) shopGrid.classList.add('d-none');

    // ৩. POS সেকশন অন করা
    if (posArea) posArea.classList.remove('d-none');

    cart = [];
    updateCartUI();
    renderSRProducts(products || []);

    // ৪. স্মুথ স্ক্রোল করে একদম কার্টের উপরে চলে যাওয়া
    if (posArea) posArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetShopSelection() {
    resetProductPricesToDefault();
    selectedSRShop = null;

    const posArea = document.getElementById('posSectionArea');
    const shopGrid = document.getElementById('srShopGridArea'); // ১. শপ গ্রিড সেকশন ধরা

    // ২. POS সেকশন লুকিয়ে ফেলা
    if (posArea) posArea.classList.add('d-none');

    // ৩. আবার দোকান স্লট সেকশনটি ফিরিয়ে আনা
    if (shopGrid) shopGrid.classList.remove('d-none');

    document.querySelectorAll('.shop-slot-card').forEach(card => card.classList.remove('border-3', 'border-success', 'shadow'));
}

function renderSRProducts(items) {
    const container = document.getElementById('productListContainer');
    if (!container) return;
    container.innerHTML = '';
    window.currentSRProducts = items.map(p => ({ ...p }));

    window.currentSRProducts.forEach(p => {
        let displayUnit = p.unit === "বস্তা" ? `বস্তা (${p.kg || '20 kg'})` : p.unit;
        container.innerHTML += `
            <div class="col-md-6 mb-2">
                <div class="product-card p-2 border rounded shadow-sm bg-white">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="w-100 me-2">
                            <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.9rem;">${p.name}</h6>
                            <span class="badge bg-light text-dark border mb-1">${p.category}</span>
                            <div id="priceViewArea_${p.id}" class="d-flex align-items-center gap-1 text-success fw-bold my-1">
                                <span>৳ <span id="priceText_${p.id}">${p.price}</span></span>
                                <small class="text-muted">/ ${displayUnit}</small>
                                <button class="btn btn-sm text-primary border-0 p-0 ms-1" onclick="togglePriceEdit('${p.id}')" title="মূল্য সংশোধন"><i class="fa-solid fa-pen-to-square"></i></button>
                            </div>
                            <div id="priceEditArea_${p.id}" class="d-none d-flex align-items-center gap-1 my-1">
                                <span class="text-success fw-bold fs-7">৳</span>
                                <input type="number" id="priceInput_${p.id}" class="form-control form-control-sm p-1 fw-bold text-success" style="width: 75px; height: 26px;" value="${p.price}">
                                <button class="btn btn-sm btn-success py-0 px-2" style="height: 26px;" onclick="saveProductPrice('${p.id}')"><i class="fa-solid fa-check fs-7"></i></button>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary rounded-circle flex-shrink-0" onclick="addToCart('${p.id}')"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;
    });
}

function resetProductPricesToDefault() {
    if (Array.isArray(products)) renderSRProducts(products);
}

function addToCart(productId) {
    let prod = null;
    if (window.currentSRProducts) prod = window.currentSRProducts.find(p => p.id == productId);
    if (!prod && Array.isArray(products)) prod = products.find(p => p.id == productId);
    if (!prod) return;

    const displayUnit = prod.unit === "বস্তা" ? `বস্তা (${prod.kg || '20 kg'})` : prod.unit;
    if (typeof cart === 'undefined') window.cart = [];

    const exist = cart.find(item => item.id == productId);
    if (exist) { exist.qty += 1; exist.price = prod.price; }
    else cart.push({ ...prod, unit: displayUnit, displayUnit, qty: 1 });

    updateCartUI();
}

function togglePriceEdit(id) {
    document.getElementById(`priceViewArea_${id}`)?.classList.add('d-none');
    document.getElementById(`priceEditArea_${id}`)?.classList.remove('d-none');
}

function saveProductPrice(id) {
    const inputEl = document.getElementById(`priceInput_${id}`);
    if (!inputEl) return;
    const newPrice = parseFloat(inputEl.value);
    if (!isNaN(newPrice) && newPrice >= 0) {
        if (window.currentSRProducts) {
            const p = window.currentSRProducts.find(item => item.id == id);
            if (p) p.price = newPrice;
        }
        const priceText = document.getElementById(`priceText_${id}`);
        if (priceText) priceText.innerText = newPrice;
        document.getElementById(`priceEditArea_${id}`)?.classList.add('d-none');
        document.getElementById(`priceViewArea_${id}`)?.classList.remove('d-none');
    }
}

function filterProducts() {
    const searchInput = document.getElementById('productSearchInput');
    const catFilter = document.getElementById('categoryFilter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const cat = catFilter ? catFilter.value : 'ALL';

    const filtered = products.filter(p => {
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = (cat === "ALL" || p.category === cat);
        return matchName && matchCat;
    });
    renderSRProducts(filtered);
}

function updateQuantity(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
    }
    updateCartUI();
}

function updateCartUI() {
    const tbody = document.getElementById('cartTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">কোনো প্রোডাক্ট যোগ করা হয়নি</td></tr>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            tbody.innerHTML += `
                <tr>
                    <td><small class="fw-bold">${item.name}</small></td>
                    <td><span class="badge bg-info text-dark">${item.displayUnit}</span></td>
                    <td>৳${item.price}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary py-0" onclick="updateQuantity(${index}, -1)">-</button>
                            <span class="btn btn-light py-0 disabled text-dark">${item.qty}</span>
                            <button class="btn btn-outline-secondary py-0" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td>৳${itemTotal}</td>
                    <td><button class="btn btn-sm text-danger p-0" onclick="updateQuantity(${index}, -${item.qty})"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`;
        });
    }
    const cartTotalElem = document.getElementById('cartTotal');
    if (cartTotalElem) cartTotalElem.innerText = total;
}

// ==========================================
// ১. আপডেট করা submitOrder (টাইমজোন ও তারিখ ফিক্সড)
// ==========================================
function submitOrder() {
    if (!cart || cart.length === 0) return alert("কার্টে কোনো প্রোডাক্ট যোগ করা হয়নি!");
    if (!selectedSRShop) return alert("কোনো দোকান নির্বাচন করা হয়নি!");

    const srName = document.getElementById('srNameInput')?.value.trim() || 'এসআর';
    const route = document.getElementById('srRouteSelect').value;
    const bazarIndex = document.getElementById('srBazarSelect').value;

    let bazarName = '';
    if (routesData && routesData[route] && routesData[route].bazars) bazarName = routesData[route].bazars[bazarIndex] || '';

    const now = new Date();
    const orderTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // তারিখ ঠিকভাবে প্রসেস করা (টাইমজোন বাগ ফিক্স)
    const dateInputValue = document.getElementById('orderDateInput')?.value;
    let targetDate = new Date();
    
    if (dateInputValue) {
        const [yyyy, mm, dd] = dateInputValue.split('-');
        targetDate = new Date(yyyy, parseInt(mm) - 1, dd);
    }

    const orderDate = targetDate.toLocaleDateString('bn-BD');
    const dayName = targetDate.toLocaleDateString('bn-BD', { weekday: 'long' });

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

    const newOrder = {
        id: 'ORD-' + Date.now(),
        srName: srName,
        shopName: selectedSRShop,
        shop: selectedSRShop,
        route: route,
        market: bazarName,
        items: JSON.parse(JSON.stringify(cart)),
        totalAmount: totalAmount,
        total: totalAmount,
        time: orderTime,
        date: orderDate,
        dayName: dayName,
        timestamp: now.getTime()
    };

    if (!Array.isArray(state.orders)) state.orders = [];
    state.orders.push(newOrder);

    saveDataToLocalStorage();
    generateDailySummary();
    renderMemoList();

    alert(`অর্ডার সফলভাবে কনফার্ম করা হয়েছে! (${selectedSRShop})`);

    cart = [];
    updateCartUI();
    document.getElementById('posSectionArea')?.classList.add('d-none');
    
    const shopGrid = document.getElementById('srShopGridArea');
    if (shopGrid) shopGrid.classList.remove('d-none');

    selectedSRShop = null;
    onSRBazarSelect();
    resetProductPricesToDefault();

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

// ==========================================
// ২. আপডেট করা generateDailySummary (স্মার্ট ম্যাচিং)
// ==========================================
function generateDailySummary() {
    try {
        const summaryTable = document.getElementById('dailySummaryTable');
        if (!summaryTable) return;
        if (!state || !state.orders) {
            summaryTable.innerHTML = '<tr><td colspan="4" class="text-center text-danger">ডাটা লোড হয়নি!</td></tr>';
            return;
        }
        summaryTable.innerHTML = '';

        const today = new Date().toLocaleDateString('bn-BD');
        if (document.getElementById('summaryDate')) document.getElementById('summaryDate').innerText = `তারিখ: ${today}`;

        // তারিখ তুলনা করার জন্য জিরো রিমুভ করার হেলপার ফাংশন
        const normalizeDate = (str) => str ? str.toString().replace(/^০+|(?<=\/)০+/g, '').trim() : '';

        // আজকের তারিখের সাথে নিখুঁত ফিল্টারিং
        const todaysOrders = state.orders.filter(order => {
            if (!order || !order.date) return false;
            return normalizeDate(order.date) === normalizeDate(today);
        });

        let totalOrders = todaysOrders.length, grandTotalAmount = 0, totalItemsCount = 0;
        let productSummaryMap = {};

        todaysOrders.forEach(order => {
            grandTotalAmount += (parseFloat(order.totalAmount || order.total) || 0);
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const itemQty = parseFloat(item.qty || item.quantity) || 0;
                    if (!productSummaryMap[item.name]) {
                        productSummaryMap[item.name] = { category: item.category || 'সাধারণ', qty: 0, unit: item.displayUnit || item.unit || 'pcs', price: parseFloat(item.price) || 0 };
                    }
                    productSummaryMap[item.name].qty += itemQty;
                });
            }
        });

        const keys = Object.keys(productSummaryMap);
        if (keys.length === 0) {
            summaryTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">আজকের তারিখে কোনো কনফার্মড অর্ডার নেই।</td></tr>';
        } else {
            keys.forEach(name => {
                const item = productSummaryMap[name];
                const totalItemPrice = item.qty * item.price;
                totalItemsCount += item.qty;
                summaryTable.innerHTML += `<tr>
                    <td class="fw-bold">${name}</td>
                    <td><span class="badge bg-light text-dark border">${item.category}</span></td>
                    <td class="fw-bold text-primary">${toBanglaNum(item.qty)} ${item.unit}</td>
                    <td class="fw-bold text-success">৳ ${toBanglaNum(totalItemPrice.toLocaleString('en-US'))}</td>
                </tr>`;
            });
        }

        if (document.getElementById('summaryTotalOrders')) document.getElementById('summaryTotalOrders').innerText = toBanglaNum(totalOrders);
        if (document.getElementById('summaryTotalAmount')) document.getElementById('summaryTotalAmount').innerText = `৳ ${toBanglaNum(grandTotalAmount.toLocaleString('en-US'))}`;
        if (document.getElementById('summaryTotalItems')) document.getElementById('summaryTotalItems').innerText = `${toBanglaNum(totalItemsCount)} টি`;
    } catch (e) { console.error("Summary Error: ", e); }
}


// ==========================================
// ৩. তারিখ অনুযায়ী গ্রুপ করা মেমো লিস্ট
// ==========================================
function renderMemoList() {
    try {
        const memoTbody = document.getElementById('memoListTable');
        if (!memoTbody) return;
        if (!state || !state.orders || state.orders.length === 0) {
            memoTbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">কোনো মেমো পাওয়া যায়নি</td></tr>';
            return;
        }
        memoTbody.innerHTML = '';

        // ১. অর্ডারগুলোকে তারিখ অনুযায়ী গ্রুপ করা
        const groupedOrders = {};
        state.orders.forEach(ord => {
            const dateKey = ord.date || 'অন্যান্য';
            if (!groupedOrders[dateKey]) {
                groupedOrders[dateKey] = [];
            }
            groupedOrders[dateKey].push(ord);
        });

        // ২. প্রতিটি তারিখের জন্য আলাদা সেকশন বানিয়ে রেন্ডার করা
        Object.keys(groupedOrders).reverse().forEach(date => {
            const ordersInDate = groupedOrders[date];
            const dayName = ordersInDate[0]?.dayName ? ` - ${ordersInDate[0].dayName}` : '';

            // তারিখের হেডার রো (Header Row)
            memoTbody.innerHTML += `
                <tr class="table-dark text-white fw-bold">
                    <td colspan="6" class="py-2 px-3">
                        <i class="fa-solid fa-calendar-days me-2 text-warning"></i>তারিখ: ${date}${dayName} 
                        <span class="badge bg-warning text-dark ms-2">${toBanglaNum(ordersInDate.length)} টি মেমো</span>
                    </td>
                </tr>`;

            // ওই তারিখের সমস্ত মেমো রেন্ডার করা
            ordersInDate.forEach((ord, idx) => {
                memoTbody.innerHTML += `
                    <tr>
                        <td><span class="badge bg-primary">#${ord.id || (idx + 1001)}</span></td>
                        <td>${ord.time || '-'}</td>
                        <td><strong>${ord.srName || ord.sr || 'এসআর'}</strong></td>
                        <td>${ord.shopName || ord.shop || '-'} (${ord.market || ord.bazar || '-'})</td>
                        <td class="fw-bold text-success">৳ ${ord.totalAmount || ord.total || 0}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-dark" onclick="printSingleMemo('${ord.id}')">
                                <i class="fa-solid fa-print me-1"></i>প্রিন্ট
                            </button>
                        </td>
                    </tr>`;
            });
        });
    } catch (e) { console.error("Memo List Error: ", e); }
}

function printSingleMemo(ordId) {
    const ord = state.orders.find(o => o.id === ordId);
    if (!ord) return alert('মেমো পাওয়া যায়নি!');

    document.getElementById('printMemoId').innerText = ord.id;
    document.getElementById('printShopName').innerText = ord.shopName || ord.shop || '-';
    document.getElementById('printMarketName').innerText = `${ord.route || ''} / ${ord.market || ord.bazar || ''}`;
    document.getElementById('printMemoDate').innerText = `${ord.date || ''} ${ord.time || ''}`;
    document.getElementById('printSrName').innerText = ord.srName || ord.sr || '-';

    const itemsTbody = document.getElementById('printMemoItems');
    itemsTbody.innerHTML = '';
    if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((item, index) => {
            itemsTbody.innerHTML += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.name}</td>
                    <td class="text-center">${item.qty} ${item.displayUnit || item.unit || ''}</td>
                    <td class="text-end">৳${item.price}</td>
                    <td class="text-end">৳${item.price * item.qty}</td>
                </tr>`;
        });
    }
    document.getElementById('printMemoTotal').innerText = `৳ ${ord.totalAmount || ord.total || 0}`;

    const printArea = document.getElementById('singleMemoPrintArea');
    if (printArea) {
        printArea.classList.remove('d-none');
        window.print();
        printArea.classList.add('d-none');
    }
}

// ==========================================
// 13. APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    initializeDefaultProducts();
    initSparkles();

    const owner = getOwnerProfile();
    if (owner) {
        state.companyName = owner.companyName;
        syncCompanyNameToUI(owner.companyName);
        syncCategoriesGlobally(owner.categories || []);
    } else {
        syncCategoriesGlobally(ALL_BUSINESS_CATEGORIES);
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('Service Worker Warning:', err));
    }
});