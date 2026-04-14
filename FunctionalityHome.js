const whatsappNumber = "573242626679";

const baseSizes = [
    { label: "S", enabled: true },
    { label: "M", enabled: true },
    { label: "L", enabled: true },
    { label: "XL", enabled: true }
];

function cloneSizes(disabledSizes = []) {
    return baseSizes.map((size) => ({
        ...size,
        enabled: !disabledSizes.includes(size.label)
    }));
}

function createColors(baseName, includeRedBlack = false) {
    const colors = {
        "Blanco Morado": {
            enabled: true,
            swatch: "linear-gradient(135deg, #f5f1e8 50%, #6d28d9 50%)",
            gallery: [`Images/${baseName}_BlancoMorado.png`]
        },
        "Blanco Negro": {
            enabled: true,
            swatch: "linear-gradient(135deg, #f5f1e8 50%, #111111 50%)",
            gallery: [`Images/${baseName}_BlancoNegro.png`]
        },
        "Negro Blanco": {
            enabled: true,
            swatch: "linear-gradient(135deg, #111111 50%, #f5f1e8 50%)",
            gallery: [`Images/${baseName}_NegroBlanco.png`]
        },
        "Negro Morado": {
            enabled: true,
            swatch: "linear-gradient(135deg, #111111 50%, #6d28d9 50%)",
            gallery: [`Images/${baseName}_NegroMorado.png`]
        }
    };

    if (includeRedBlack) {
        colors["Rojo Negro"] = {
            enabled: true,
            swatch: "linear-gradient(135deg, #dc2626 50%, #111111 50%)",
            gallery: [`Images/${baseName}_RojoNegro.png`]
        };
    }

    return colors;
}

const products = {
    1: {
        name: "Producto 1",
        description: "Descripción provisional del producto 1. Reemplaza este texto con la información real de la prenda.",
        price: "$100.000",
        sizes: cloneSizes(),
        colors: createColors("D1", true)
    },
    2: {
        name: "Producto 2",
        description: "Descripción provisional del producto 2. Reemplaza este texto con la información real de la prenda.",
        price: "$120.000",
        sizes: cloneSizes(),
        colors: createColors("D2")
    },
    3: {
        name: "Producto 3",
        description: "Descripción provisional del producto 3. Reemplaza este texto con la información real de la prenda.",
        price: "$90.000",
        sizes: cloneSizes(),
        colors: createColors("D3")
    },
    4: {
        name: "Producto 4",
        description: "Descripción provisional del producto 4. Reemplaza este texto con la información real de la prenda.",
        price: "$150.000",
        sizes: cloneSizes(),
        colors: createColors("D4")
    },
    5: {
        name: "Producto 5",
        description: "Descripción provisional del producto 5. Reemplaza este texto con la información real de la prenda.",
        price: "$80.000",
        sizes: cloneSizes(),
        colors: createColors("D5")
    },
    6: {
        name: "Producto 6",
        description: "Descripción provisional del producto 6. Reemplaza este texto con la información real de la prenda.",
        price: "$200.000",
        sizes: cloneSizes(),
        colors: createColors("D6")
    },
    7: {
        name: "Producto 7",
        description: "Descripción provisional del producto 7. Reemplaza este texto con la información real de la prenda.",
        price: "$110.000",
        sizes: cloneSizes(),
        colors: createColors("D7")
    }
};

const siteHeader = document.getElementById("siteHeader");
const navLinks = [...document.querySelectorAll(".nav-link")];
const carouselTrack = document.getElementById("filaropa");
const leftArrow = document.getElementById("flechaIzquierda");
const rightArrow = document.getElementById("flechaDerecha");
const toggleArmarioButton = document.getElementById("toggleArmario");
const armarioCompleto = document.getElementById("armarioCompleto");
const ropaCompleta = document.getElementById("ropaCompleta");
const cerrarArmarioButton = document.getElementById("cerrarArmario");
const armarioBackdrop = armarioCompleto.querySelector("[data-close-armario]");
const modal = document.getElementById("productModal");
const closeModalButton = document.getElementById("cerrarProducto");
const backdrop = modal.querySelector("[data-close-modal]");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("descripcionProducto");
const modalPrice = document.getElementById("precioProducto");
const mainImage = document.getElementById("imagenPrincipal");
const thumbnailsContainer = document.getElementById("miniaturas");
const prevImageButton = document.getElementById("modalPrevImage");
const nextImageButton = document.getElementById("modalNextImage");
const colorsContainer = document.getElementById("selectorColores");
const sizesContainer = document.getElementById("selectorTallas");
const whatsappLink = document.getElementById("linkWhatsapp");

document.getElementById("currentYear").textContent = new Date().getFullYear();

let autoScrollInterval = null;
let currentProductId = null;
let currentColorName = "";
let currentSize = "";
let currentImageIndex = 0;


function getFirstEnabledColor(product) {
    const availableColor = Object.entries(product.colors).find(([, color]) => color.enabled !== false);
    return availableColor ? availableColor[0] : Object.keys(product.colors)[0];
}

function getPrimaryImage(product) {
    const colorName = getFirstEnabledColor(product);
    const gallery = product.colors[colorName]?.gallery || [];
    return gallery[0] || "";
}

function createCardMarkup(productId) {
    const product = products[productId];
    const image = getPrimaryImage(product);

    return `
        <article class="product-card reveal" data-product-id="${productId}">
            <div class="product-card-media">
                <img src="${image}" alt="${product.name}" loading="lazy" />
            </div>
            <div class="product-card-info">
                <h3 class="product-card-name">${product.name}</h3>
                <span class="product-card-price">${product.price}</span>
            </div>
        </article>
    `;
}

function renderProducts() {
    const cards = Object.keys(products).map(createCardMarkup).join("");
    carouselTrack.innerHTML = cards;
    ropaCompleta.innerHTML = cards;
    activateReveal();
}

function getScrollAmount() {
    const firstCard = carouselTrack.querySelector(".product-card");
    if (!firstCard) return carouselTrack.clientWidth;

    const trackStyles = window.getComputedStyle(carouselTrack);
    const gap = parseFloat(trackStyles.gap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;

    const visibleCards = Math.max(
        1,
        Math.round((carouselTrack.clientWidth + gap) / (cardWidth + gap))
    );

    return visibleCards * (cardWidth + gap);
}

function moveRight() {
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;

    if (carouselTrack.scrollLeft >= maxScroll - 8) {
        carouselTrack.scrollTo({ left: 0, behavior: "smooth" });
    } else {
        const nextLeft = Math.min(carouselTrack.scrollLeft + getScrollAmount(), maxScroll);
        carouselTrack.scrollTo({ left: nextLeft, behavior: "smooth" });
    }
}

function moveLeft() {
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;

    if (carouselTrack.scrollLeft <= 8) {
        carouselTrack.scrollTo({
            left: maxScroll,
            behavior: "smooth"
        });
    } else {
        const nextLeft = Math.max(carouselTrack.scrollLeft - getScrollAmount(), 0);
        carouselTrack.scrollTo({
            left: nextLeft,
            behavior: "smooth"
        });
    }
}

function startAutoScroll() {
    stopAutoScroll();
    autoScrollInterval = setInterval(moveRight, 7000);
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}

function openArmarioModal() {
    armarioCompleto.classList.add("is-open");
    armarioCompleto.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    stopAutoScroll();

    const panel = armarioCompleto.querySelector(".armario-panel");
    if (panel) {
        panel.scrollTop = 0;
    }
}

function closeArmarioModal() {
    armarioCompleto.classList.remove("is-open");
    armarioCompleto.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    startAutoScroll();
}

function getSafeGallery(product, colorName) {
    const gallery = product.colors[colorName]?.gallery || [];
    if (gallery.length > 0) return gallery;
    return [getPrimaryImage(product)];
}

function getModalImages(product) {
    return Object.entries(product.colors)
        .filter(([, colorData]) => colorData.enabled !== false)
        .map(([colorName, colorData]) => ({
            colorName,
            image: colorData.gallery?.[0] || ""
        }))
        .filter((item) => item.image);
}

function renderModalGallery(product) {
    const modalImages = getModalImages(product);
    if (!modalImages.length) return;

    let imageIndex = modalImages.findIndex((item) => item.colorName === currentColorName);

    if (imageIndex === -1) {
        imageIndex = 0;
        currentColorName = modalImages[0].colorName;
    }

    currentImageIndex = imageIndex;

    const activeImage = modalImages[currentImageIndex];

    mainImage.src = activeImage.image;
    mainImage.alt = `${product.name} ${activeImage.colorName}`;

    thumbnailsContainer.innerHTML = modalImages
        .map(
            (item, index) => `
                <button
                    class="thumb-button ${index === currentImageIndex ? "active" : ""}"
                    data-image-index="${index}"
                    data-color="${item.colorName}"
                    aria-label="${item.colorName}"
                    title="${item.colorName}"
                    type="button"
                >
                    <img src="${item.image}" alt="${item.colorName}" loading="lazy" />
                </button>
            `
        )
        .join("");
}

function renderColorOptions(product) {
    colorsContainer.innerHTML = Object.entries(product.colors)
        .map(([colorName, colorData]) => {
            const disabledClass = colorData.enabled === false ? "is-disabled" : "";
            const activeClass = colorName === currentColorName ? "active" : "";

            return `
                <button
                    class="color-button ${activeClass} ${disabledClass}"
                    data-color="${colorName}"
                    title="${colorName}"
                    aria-label="${colorName}"
                    style="background: ${colorData.swatch};"
                ></button>
            `;
        })
        .join("");
}

function renderSizeOptions(product) {
    sizesContainer.innerHTML = product.sizes
        .map((size) => {
            const disabledClass = size.enabled === false ? "is-disabled" : "";
            const activeClass = size.label === currentSize ? "active" : "";

            return `
                <button
                    class="size-button ${activeClass} ${disabledClass}"
                    data-size="${size.label}"
                    type="button"
                >
                    ${size.label}
                </button>
            `;
        })
        .join("");
}

function updateWhatsAppLink() {
    const product = products[currentProductId];
    if (!product) return;

    const message = encodeURIComponent(
        `Hola ARK, estoy interesad@ en ${product.name} | ${product.price} | Color: ${currentColorName}${currentSize ? ` | Talla: ${currentSize}` : ""}`
    );

    whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${message}`;
}

function renderModal() {
    const product = products[currentProductId];
    if (!product) return;

    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = product.price;

    renderColorOptions(product);
    renderSizeOptions(product);
    renderModalGallery(product);
    updateWhatsAppLink();
}

function openProduct(productId) {
    const product = products[productId];
    if (!product) return;

    if (armarioCompleto.classList.contains("is-open")) {
        closeArmarioModal();
    }

    currentProductId = productId;
    currentColorName = getFirstEnabledColor(product);
    currentSize = product.sizes.find((size) => size.enabled !== false)?.label || "";
    currentImageIndex = 0;

    renderModal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    stopAutoScroll();

    const panel = modal.querySelector(".product-panel");
    if (panel) {
        panel.scrollTop = 0;
    }
}

function closeProduct() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    startAutoScroll();
}

function handleProductClick(event) {
    const card = event.target.closest(".product-card");
    if (!card) return;

    const productId = card.dataset.productId;
    openProduct(productId);
}

function updateHeaderState() {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 10);
}

function updateActiveNav() {
    const sections = [...document.querySelectorAll("section[id]")];
    const scrollPosition = window.scrollY + siteHeader.offsetHeight + 120;

    let currentSectionId = "inicio";

    sections.forEach((section) => {
        if (
            scrollPosition >= section.offsetTop &&
            scrollPosition < section.offsetTop + section.offsetHeight
        ) {
            currentSectionId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentSectionId}`;
        link.classList.toggle("active", isActive);
    });
}

function activateReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    revealElements.forEach((element) => observer.observe(element));
}

rightArrow.addEventListener("click", moveRight);
leftArrow.addEventListener("click", moveLeft);

carouselTrack.addEventListener("mouseenter", stopAutoScroll);
carouselTrack.addEventListener("mouseleave", startAutoScroll);

carouselTrack.addEventListener("click", handleProductClick);
ropaCompleta.addEventListener("click", handleProductClick);


toggleArmarioButton.addEventListener("click", openArmarioModal);
cerrarArmarioButton.addEventListener("click", closeArmarioModal);
armarioBackdrop.addEventListener("click", closeArmarioModal);
closeModalButton.addEventListener("click", closeProduct);
backdrop.addEventListener("click", closeProduct);

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (modal.classList.contains("is-open")) {
        closeProduct();
        return;
    }

    if (armarioCompleto.classList.contains("is-open")) {
        closeArmarioModal();
    }
});

colorsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-color]");
    if (!button || !currentProductId) return;

    const selectedColor = button.dataset.color;
    const product = products[currentProductId];
    const colorData = product.colors[selectedColor];

    if (!colorData || colorData.enabled === false) return;

    currentColorName = selectedColor;


    renderModal();
});

sizesContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-size]");
    if (!button || !currentProductId) return;

    const selectedSize = button.dataset.size;
    const product = products[currentProductId];
    const sizeData = product.sizes.find((size) => size.label === selectedSize);

    if (!sizeData || sizeData.enabled === false) return;

    currentSize = selectedSize;
    renderModal();
});

thumbnailsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-index]");
    if (!button || !currentProductId) return;

    const product = products[currentProductId];
    const modalImages = getModalImages(product);

    currentImageIndex = Number(button.dataset.imageIndex);
    currentColorName = modalImages[currentImageIndex].colorName;

    renderModal();
});

prevImageButton.addEventListener("click", () => {
    if (!currentProductId) return;

    const product = products[currentProductId];
    const modalImages = getModalImages(product);
    if (!modalImages.length) return;

    currentImageIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
    currentColorName = modalImages[currentImageIndex].colorName;

    renderModal();
});

nextImageButton.addEventListener("click", () => {
    if (!currentProductId) return;

    const product = products[currentProductId];
    const modalImages = getModalImages(product);
    if (!modalImages.length) return;

    currentImageIndex = (currentImageIndex + 1) % modalImages.length;
    currentColorName = modalImages[currentImageIndex].colorName;

    renderModal();
});

window.addEventListener("scroll", () => {
    updateHeaderState();
    updateActiveNav();
});

window.addEventListener("resize", updateActiveNav);

renderProducts();
updateHeaderState();
updateActiveNav();
startAutoScroll();

document.addEventListener("mousemove", (event) => {
    const nearRightEdge = event.clientX >= window.innerWidth - 28;
    document.documentElement.classList.toggle("show-scrollbar", nearRightEdge);
});