/* =====================================
   HABITARE — script.js
   Compartido entre todas las páginas
===================================== */

const WHATSAPP_NUMBER = "5493513320235"; // +54 9 351 332 0235
const CONTACT_EMAIL = "Habitare@gmail.com";

const LINEAS = {
    aqua:          { nombre: "Aqua",         color: "#b6d5d4" },
    ceniza:        { nombre: "Ceniza",       color: "#282627" },
    mostaza:       { nombre: "Mostaza",      color: "#aa9c54" },
    gres:          { nombre: "Gres Claro",   color: "#c9b190" },
    "gres-tostado":{ nombre: "Gres Tostado", color: "#81644a" },
    hueso:         { nombre: "Hueso",        color: "#eceeed" },
    terra:         { nombre: "Terra",        color: "#705a4f" },
};

const COMPONENT_COLORS = {
    gris:   "Gris",
    blanco: "Blanco",
    negro:  "Negro",
};

/* =====================================
   MENÚ MÓVIL
===================================== */

const menuToggle = document.querySelector(".menu-toggle");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });

    document.querySelectorAll(".mobile-nav a").forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-open");
        });
    });
}

/* =====================================
   SELECCIÓN — almacenamiento local
===================================== */

const STORAGE_KEY = "habitare_seleccion";

function loadSelection() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveSelection(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        /* almacenamiento no disponible: la sesión sigue funcionando igual */
    }
}

let selection = loadSelection();

/* =====================================
   PANEL DE SELECCIÓN
===================================== */

const selectionContent = document.querySelector(".selection-content");
const selectionEmpty = document.querySelector(".selection-empty");
const selectionNumber = document.querySelector(".selection-number");
const selectionCountLine = document.querySelector(".selection-count-line");

function openSelection() {
    document.body.classList.add("selection-open");
}

function closeSelection() {
    document.body.classList.remove("selection-open");
}

document.querySelectorAll(".open-selection").forEach(btn => {
    btn.addEventListener("click", openSelection);
});

document.querySelectorAll(".close-selection").forEach(btn => {
    btn.addEventListener("click", closeSelection);
});

document.querySelectorAll(".selection-backdrop").forEach(el => {
    el.addEventListener("click", closeSelection);
});

function addToSelection(lineaKey, cantidad, componentColor) {
    componentColor = componentColor || "gris";

    const existing = selection.find(item => item.linea === lineaKey && item.componentColor === componentColor);

    if (existing) {
        existing.cantidad += cantidad;
    } else {
        selection.push({
            id: Date.now() + Math.random(),
            linea: lineaKey,
            cantidad: cantidad,
            componentColor: componentColor,
        });
    }

    saveSelection(selection);
    renderSelection();
}

function changeSelectionQty(id, amount) {
    const item = selection.find(p => p.id === id);
    if (!item) return;

    item.cantidad += amount;

    if (item.cantidad <= 0) {
        selection = selection.filter(p => p.id !== id);
    }

    saveSelection(selection);
    renderSelection();
}

function removeSelectionItem(id) {
    selection = selection.filter(item => item.id !== id);
    saveSelection(selection);
    renderSelection();
}

function buildQuoteText() {
    if (selection.length === 0) {
        return "Hola HABITARE, quiero armar mi proyecto y me gustaría recibir asesoramiento.";
    }

    let lines = ["Hola HABITARE, quiero pedir una cotización para:"];

    selection.forEach(item => {
        const linea = LINEAS[item.linea];
        const nombre = linea ? linea.nombre : item.linea;
        const compColor = COMPONENT_COLORS[item.componentColor] || item.componentColor;
        lines.push(`- Pieza línea ${nombre} x${item.cantidad} (componentes color ${compColor})`);
    });

    return lines.join("\n");
}

function renderSelection() {
    if (!selectionContent) return;

    selectionContent.innerHTML = "";

    let totalPiezas = 0;

    if (selection.length === 0) {
        if (selectionEmpty) selectionEmpty.style.display = "flex";
    } else {
        if (selectionEmpty) selectionEmpty.style.display = "none";
    }

    selection.forEach(item => {
        const linea = LINEAS[item.linea] || { nombre: item.linea, color: "#cccccc" };
        totalPiezas += item.cantidad;

        const el = document.createElement("div");
        el.className = "selection-item";

        const compColor = COMPONENT_COLORS[item.componentColor] || item.componentColor;

        el.innerHTML = `
            <div class="selection-item-dot" style="--swatch:${linea.color}"></div>
            <div>
                <h4>Pieza HABITARE</h4>
                <small style="display:block;margin-top:4px;font-size:9px;color:var(--muted);letter-spacing:1px;">
                    LÍNEA ${linea.nombre.toUpperCase()} · COMPONENTES ${compColor ? compColor.toUpperCase() : ""}
                </small>
                <div class="selection-item-controls">
                    <button aria-label="Restar" data-action="minus" data-id="${item.id}">−</button>
                    <span>${item.cantidad}</span>
                    <button aria-label="Sumar" data-action="plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="selection-remove" aria-label="Quitar" data-action="remove" data-id="${item.id}">×</button>
        `;

        selectionContent.appendChild(el);
    });

    selectionContent.querySelectorAll("[data-action]").forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            if (action === "plus") changeSelectionQty(id, 1);
            if (action === "minus") changeSelectionQty(id, -1);
            if (action === "remove") removeSelectionItem(id);
        });
    });

    if (selectionNumber) selectionNumber.textContent = totalPiezas;

    if (selectionCountLine) {
        selectionCountLine.innerHTML = totalPiezas > 0
            ? `<span>PIEZAS SELECCIONADAS</span><span>${totalPiezas}</span>`
            : "";
    }

    document.querySelectorAll(".quote-btn.whatsapp").forEach(btn => {
        btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteText())}`;
    });

    document.querySelectorAll(".quote-btn.email").forEach(btn => {
        btn.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Cotización HABITARE")}&body=${encodeURIComponent(buildQuoteText())}`;
    });
}

/* =====================================
   CONFIGURADOR (páginas de línea individual)
===================================== */

const configurador = document.querySelector(".configurador");

if (configurador) {
    const lineaKey = configurador.dataset.linea;
    const qtyLabel = configurador.querySelector(".config-qty span");
    const minus = configurador.querySelector('[data-qty="minus"]');
    const plus = configurador.querySelector('[data-qty="plus"]');
    const addBtn = configurador.querySelector(".config-add");
    const colorBtns = configurador.querySelectorAll(".color-option-btn");

    let qty = 1;
    let selectedColor = "gris";

    if (plus) {
        plus.addEventListener("click", () => {
            qty++;
            qtyLabel.textContent = qty;
        });
    }

    if (minus) {
        minus.addEventListener("click", () => {
            if (qty > 1) qty--;
            qtyLabel.textContent = qty;
        });
    }

    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            colorBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedColor = btn.dataset.color;
        });
    });

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            addToSelection(lineaKey, qty, selectedColor);
            qty = 1;
            qtyLabel.textContent = "1";

            addBtn.textContent = "Agregada a mi selección ✓";
            addBtn.classList.add("added");
            openSelection();
            setTimeout(() => {
                addBtn.textContent = "Agregar a mi selección";
                addBtn.classList.remove("added");
            }, 1800);
        });
    }
}

/* =====================================
   ACCESORIOS (coleccion.html)
===================================== */

const acabadosVista = document.querySelector(".acabados-vista img");

if (acabadosVista) {
    const acabadoBtns = document.querySelectorAll("[data-componente]");

    acabadoBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.componente;

            acabadoBtns.forEach(b => {
                const activo = b === btn;
                b.classList.toggle("active", activo);
                b.setAttribute("aria-pressed", activo ? "true" : "false");
            });

            acabadosVista.classList.add("cambiando");
            setTimeout(() => {
                acabadosVista.src = "assets/images/componentes-" + color + ".webp";
                acabadosVista.alt = "Ambiente con pared divisoria HABITARE y componentes en color " + COMPONENT_COLORS[color].toLowerCase();
                acabadosVista.classList.remove("cambiando");
            }, 250);
        });
    });
}

// Resalta el número del complemento al pasar sobre la lista
document.querySelectorAll(".complementos-lista li").forEach(li => {
    const pin = document.querySelector('.pin[data-pin="' + li.dataset.pin + '"]');
    const on = () => { li.classList.add("active"); if (pin) pin.classList.add("active"); };
    const off = () => { li.classList.remove("active"); if (pin) pin.classList.remove("active"); };
    li.addEventListener("mouseenter", on);
    li.addEventListener("mouseleave", off);
});

/* =====================================
   NEWSLETTER
===================================== */

document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", e => {
        e.preventDefault();
        const note = form.parentElement.querySelector(".newsletter-note");
        const input = form.querySelector("input");

        if (note) {
            note.textContent = "¡Gracias! Te vamos a escribir a " + input.value;
        }

        form.reset();
    });
});

/* =====================================
   INICIO
===================================== */

renderSelection();
