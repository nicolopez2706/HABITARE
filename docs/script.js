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

const COLORES = ["gris", "blanco", "negro"];

const COLOR_HEX = {
    gris:   "#8c8c8c",
    blanco: "#f2f2f2",
    negro:  "#222222",
};

/* Regulador ambiental: paneles de fieltro */
const FIELTRO_COLORS = {
    marron: { nombre: "Marrón", hex: "#6b4f3a" },
    gris:   { nombre: "Gris",   hex: "#6e7074" },
    blanco: { nombre: "Blanco", hex: "#f2f2f2" },
};

/* Los 7 complementos funcionales (el "pin" es el número sobre la foto) */
const ACCESORIOS = [
    { id: "organizador-documental",     nombre: "Organizador documental",     pin: 1 },
    { id: "contenedor-multiuso",        nombre: "Contenedor multiuso",        pin: 2 },
    { id: "luminaria",                  nombre: "Luminaria",                  pin: 3 },
    { id: "contenedor-compartimentado", nombre: "Contenedor compartimentado", pin: 4 },
    { id: "porta-llaves-lentes",        nombre: "Porta llaves / lentes",      pin: 5 },
    { id: "perchero",                   nombre: "Perchero",                   pin: 6 },
    { id: "estante",                    nombre: "Estante",                    pin: 7 },
];

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

function nombreAccesorio(id) {
    const a = ACCESORIOS.find(x => x.id === id);
    return a ? a.nombre : id;
}

function nombreColor(color) {
    return COMPONENT_COLORS[color] || color;
}

function nombreFieltro(color) {
    return FIELTRO_COLORS[color] ? FIELTRO_COLORS[color].nombre : color;
}

function plural(n, uno, varios) {
    return n + " " + (n === 1 ? uno : varios);
}

/* Cada ítem de la selección es una configuración completa:
   pieza (línea + cantidad + color de componentes) + complementos + regulador */
function addToSelection(lineaKey, cantidad, componentColor, accesorios, regulador) {
    componentColor = componentColor || "gris";
    accesorios = accesorios || [];
    regulador = regulador || null;

    const sinExtras = accesorios.length === 0 && !regulador;

    /* Solo se suman cantidades cuando la configuración no lleva complementos;
       si los lleva, cada agregado queda como una configuración aparte. */
    const existing = sinExtras
        ? selection.find(item =>
            item.linea === lineaKey &&
            item.componentColor === componentColor &&
            !(item.accesorios && item.accesorios.length) &&
            !item.regulador)
        : null;

    if (existing) {
        existing.cantidad += cantidad;
    } else {
        selection.push({
            id: Date.now() + Math.random(),
            linea: lineaKey,
            cantidad: cantidad,
            componentColor: componentColor,
            accesorios: accesorios,
            regulador: regulador,
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

    const lines = ["Hola HABITARE, quiero pedir una cotización para:", ""];
    let piezas = 0;
    let complementos = 0;
    let reguladores = 0;

    selection.forEach((item, i) => {
        const linea = LINEAS[item.linea];
        const nombre = linea ? linea.nombre : item.linea;
        const accs = item.accesorios || [];

        piezas += item.cantidad;

        lines.push(`${i + 1}) Pieza línea ${nombre} x${item.cantidad}`);
        lines.push(`   - Componentes (guías y telescópico): color ${nombreColor(item.componentColor)}`);

        if (accs.length) {
            lines.push("   - Complementos:");
            accs.forEach(a => {
                complementos += a.cantidad;
                lines.push(`      · ${nombreAccesorio(a.id)} x${a.cantidad} (color ${nombreColor(a.color)})`);
            });
        }

        if (item.regulador) {
            reguladores += item.regulador.cantidad;
            lines.push(`   - Regulador ambiental x${item.regulador.cantidad} (fieltro ${nombreFieltro(item.regulador.color).toLowerCase()})`);
        }

        lines.push("");
    });

    const resumen = [plural(piezas, "pieza", "piezas")];
    if (complementos) resumen.push(plural(complementos, "complemento", "complementos"));
    if (reguladores) resumen.push(plural(reguladores, "regulador", "reguladores"));
    lines.push("Resumen: " + resumen.join(", "));

    return lines.join("\n");
}

function renderSelection() {
    if (!selectionContent) return;

    selectionContent.innerHTML = "";

    let totalPiezas = 0;
    let totalComplementos = 0;
    let totalReguladores = 0;

    if (selection.length === 0) {
        if (selectionEmpty) selectionEmpty.style.display = "flex";
    } else {
        if (selectionEmpty) selectionEmpty.style.display = "none";
    }

    selection.forEach(item => {
        const linea = LINEAS[item.linea] || { nombre: item.linea, color: "#cccccc" };
        const accs = item.accesorios || [];
        totalPiezas += item.cantidad;

        const extras = [];
        accs.forEach(a => {
            totalComplementos += a.cantidad;
            extras.push(`${nombreAccesorio(a.id)} ×${a.cantidad} · ${nombreColor(a.color)}`);
        });
        if (item.regulador) {
            totalReguladores += item.regulador.cantidad;
            extras.push(`Regulador ambiental ×${item.regulador.cantidad} · Fieltro ${nombreFieltro(item.regulador.color).toLowerCase()}`);
        }

        const el = document.createElement("div");
        el.className = "selection-item";

        const compColor = nombreColor(item.componentColor);

        el.innerHTML = `
            <div class="selection-item-dot" style="--swatch:${linea.color}"></div>
            <div>
                <h4>Pieza HABITARE</h4>
                <small style="display:block;margin-top:4px;font-size:9px;color:var(--muted);letter-spacing:1px;">
                    LÍNEA ${linea.nombre.toUpperCase()} · COMPONENTES ${compColor ? compColor.toUpperCase() : ""}
                </small>
                ${extras.length ? `<ul class="selection-item-extras">${extras.map(t => `<li>${t}</li>`).join("")}</ul>` : ""}
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

    const totalArticulos = totalPiezas + totalComplementos + totalReguladores;

    if (selectionNumber) selectionNumber.textContent = totalArticulos;

    if (selectionCountLine) {
        const filas = [];
        if (totalPiezas > 0) filas.push(["PIEZAS", totalPiezas]);
        if (totalComplementos > 0) filas.push(["COMPLEMENTOS", totalComplementos]);
        if (totalReguladores > 0) filas.push(["REGULADORES AMBIENTALES", totalReguladores]);

        selectionCountLine.innerHTML = filas
            .map(f => `<div class="count-row"><span>${f[0]}</span><span>${f[1]}</span></div>`)
            .join("");
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
    initConfigurador(configurador);
}

function initConfigurador(root) {
    const lineaKey = root.dataset.linea;
    const linea = LINEAS[lineaKey] || { nombre: lineaKey };
    const qtyLabel = root.querySelector(".config-qty span");
    const minus = root.querySelector('[data-qty="minus"]');
    const plus = root.querySelector('[data-qty="plus"]');
    const addBtn = root.querySelector(".config-add");

    /* Los pasos 02 y 03 se arman desde acá, igual en todas las líneas */
    const bodies = Array.from(root.querySelectorAll(".config-step")).map(s => s.querySelector(".config-step-body"));
    const bodyColor = bodies[1];
    const bodyAcc = bodies[2];

    const MAX = 99;
    const state = {
        qty: 1,
        color: "gris",   // color de guías y componente telescópico
        acc: {},         // id -> { cantidad, color }
        reg: null,       // { cantidad, color }
    };

    /* ---------- PASO 01: cantidad de piezas ---------- */

    if (plus) {
        plus.addEventListener("click", () => {
            if (state.qty < MAX) state.qty++;
            qtyLabel.textContent = state.qty;
            renderSummary();
        });
    }

    if (minus) {
        minus.addEventListener("click", () => {
            if (state.qty > 1) state.qty--;
            qtyLabel.textContent = state.qty;
            renderSummary();
        });
    }

    /* ---------- PASO 02: color de los componentes (con imagen) ---------- */

    let preview = null;

    if (bodyColor) {
        bodyColor.innerHTML = `
            <p class="config-help">
                Guías de instalación y componente telescópico. Elegí el color y mirá cómo queda en el ambiente.
            </p>
            <div class="config-preview">
                <img src="assets/images/componentes-${state.color}.webp"
                     alt="Ambiente con pared divisoria HABITARE y componentes en color ${nombreColor(state.color).toLowerCase()}"
                     width="1448" height="1086">
            </div>
            <div class="color-options" role="group" aria-label="Color de los componentes">
                ${COLORES.map(c => `
                <button type="button" class="color-option-btn${c === state.color ? " active" : ""}" data-color="${c}" aria-pressed="${c === state.color}">
                    <span class="color-option-swatch" style="--swatch:${COLOR_HEX[c]};"></span>
                    ${nombreColor(c)}
                </button>`).join("")}
            </div>
        `;

        preview = bodyColor.querySelector(".config-preview img");

        /* precarga para que el cambio de color no parpadee */
        COLORES.forEach(c => { new Image().src = "assets/images/componentes-" + c + ".webp"; });

        bodyColor.addEventListener("click", e => {
            const btn = e.target.closest("[data-color]");
            if (btn) setComponentColor(btn.dataset.color);
        });
    }

    function setComponentColor(color) {
        state.color = color;

        bodyColor.querySelectorAll("[data-color]").forEach(b => {
            const on = b.dataset.color === color;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", on ? "true" : "false");
        });

        if (preview) {
            preview.classList.add("cambiando");
            setTimeout(() => {
                preview.src = "assets/images/componentes-" + color + ".webp";
                preview.alt = "Ambiente con pared divisoria HABITARE y componentes en color " + nombreColor(color).toLowerCase();
                preview.classList.remove("cambiando");
            }, 220);
        }

        renderSummary();
    }

    /* ---------- PASO 03: complementos y regulador ambiental ---------- */

    function colorChips(attr, extra, palette, nombres) {
        return palette.map(c => `
            <button type="button" class="acc-color" ${attr}="${c}" ${extra} aria-pressed="false" style="--swatch:${nombres[c].hex}">
                <i></i>${nombres[c].nombre}
            </button>`).join("");
    }

    const paletaComponentes = {};
    COLORES.forEach(c => { paletaComponentes[c] = { nombre: nombreColor(c), hex: COLOR_HEX[c] }; });
    const clavesFieltro = Object.keys(FIELTRO_COLORS);

    function accItemHTML(a) {
        const n = String(a.pin).padStart(2, "0");
        return `
            <li class="acc-item" data-acc="${a.id}">
                <label class="acc-check">
                    <input type="checkbox" data-acc-toggle="${a.id}">
                    <span class="acc-box" aria-hidden="true"></span>
                    <span class="acc-num">${n}</span>
                    <span class="acc-name">${a.nombre}</span>
                </label>
                <div class="acc-opts" hidden>
                    <div class="acc-colors" role="group" aria-label="Color de ${a.nombre}">
                        ${colorChips("data-acc-color", `data-acc-id="${a.id}"`, COLORES, paletaComponentes)}
                    </div>
                    <div class="acc-qty">
                        <button type="button" data-acc-qty="-1" data-acc-id="${a.id}" aria-label="Restar ${a.nombre}">−</button>
                        <span data-acc-count="${a.id}">1</span>
                        <button type="button" data-acc-qty="1" data-acc-id="${a.id}" aria-label="Sumar ${a.nombre}">+</button>
                    </div>
                </div>
            </li>`;
    }

    if (bodyAcc) {
        bodyAcc.innerHTML = `
            <p class="config-help">
                Sumá complementos de chapa para equipar tu sistema: elegí los que quieras, o los siete,
                y el color y la cantidad de cada uno.
            </p>

            <div class="acc-group">
                <div class="acc-group-head">
                    <h4>Complementos funcionales</h4>
                    <button type="button" class="acc-all" data-acc-all>Sumar los 7</button>
                </div>

                <figure class="acc-figure">
                    <img src="assets/images/complementos-funcionales.webp"
                         alt="Los siete complementos funcionales sobre una pared HABITARE" width="976" height="1078">
                    <span class="pin" data-pin="1" style="--x:79.4%;--y:55.7%">1</span>
                    <span class="pin" data-pin="2" style="--x:36.1%;--y:53.3%">2</span>
                    <span class="pin" data-pin="3" style="--x:57.4%;--y:19.9%">3</span>
                    <span class="pin" data-pin="4" style="--x:14.3%;--y:30.6%">4</span>
                    <span class="pin" data-pin="5" style="--x:39.5%;--y:84%">5</span>
                    <span class="pin" data-pin="6" style="--x:17.4%;--y:62.2%">6</span>
                    <span class="pin" data-pin="7" style="--x:79.9%;--y:91.4%">7</span>
                </figure>

                <ul class="acc-list">
                    ${ACCESORIOS.map(accItemHTML).join("")}
                </ul>

                <div class="acc-bulk" hidden>
                    <span>Mismo color para todos los elegidos</span>
                    <div class="acc-colors" role="group" aria-label="Color para todos los complementos elegidos">
                        ${colorChips("data-bulk-color", "", COLORES, paletaComponentes)}
                    </div>
                </div>
            </div>

            <div class="acc-group">
                <div class="acc-group-head">
                    <h4>Regulador ambiental</h4>
                </div>

                <div class="reg-card">
                    <img src="assets/images/regulador-pared.webp"
                         alt="Pared HABITARE con reguladores ambientales cerrados, entreabiertos y abiertos"
                         width="1448" height="1086">
                    <div>
                        <p class="config-help">
                            Componente giratorio que vincula ambos lados de la pared y regula el ingreso de luz y
                            la privacidad entre ambientes. Paneles de fieltro en tres colores.
                        </p>
                        <label class="acc-check">
                            <input type="checkbox" data-reg-toggle>
                            <span class="acc-box" aria-hidden="true"></span>
                            <span class="acc-name">Sumar regulador ambiental</span>
                        </label>
                        <div class="acc-opts" data-reg-opts hidden>
                            <div class="acc-colors" role="group" aria-label="Color del fieltro">
                                ${colorChips("data-reg-color", "", clavesFieltro, FIELTRO_COLORS)}
                            </div>
                            <div class="acc-qty">
                                <button type="button" data-reg-qty="-1" aria-label="Restar reguladores">−</button>
                                <span data-reg-count>1</span>
                                <button type="button" data-reg-qty="1" aria-label="Sumar reguladores">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bodyAcc.addEventListener("click", e => {
            const t = e.target.closest("button");
            if (!t || !bodyAcc.contains(t)) return;

            if (t.hasAttribute("data-acc-all")) return toggleAll();
            if (t.dataset.accColor) return setAccColor(t.dataset.accId, t.dataset.accColor);
            if (t.dataset.accQty) return changeAccQty(t.dataset.accId, Number(t.dataset.accQty));
            if (t.dataset.bulkColor) return setBulkColor(t.dataset.bulkColor);
            if (t.dataset.regColor && state.reg) { state.reg.color = t.dataset.regColor; return render(); }
            if (t.dataset.regQty && state.reg) {
                state.reg.cantidad = Math.min(MAX, Math.max(1, state.reg.cantidad + Number(t.dataset.regQty)));
                return render();
            }
        });

        bodyAcc.addEventListener("change", e => {
            const t = e.target;
            if (t.dataset.accToggle) toggleAcc(t.dataset.accToggle, t.checked);
            if (t.hasAttribute("data-reg-toggle")) toggleReg(t.checked);
        });
    }

    function toggleAcc(id, on) {
        if (on) {
            if (!state.acc[id]) state.acc[id] = { cantidad: 1, color: state.color };
        } else {
            delete state.acc[id];
        }
        render();
    }

    function toggleAll() {
        const todos = ACCESORIOS.every(a => state.acc[a.id]);
        ACCESORIOS.forEach(a => {
            if (todos) delete state.acc[a.id];
            else if (!state.acc[a.id]) state.acc[a.id] = { cantidad: 1, color: state.color };
        });
        render();
    }

    function setAccColor(id, color) {
        if (state.acc[id]) state.acc[id].color = color;
        render();
    }

    function setBulkColor(color) {
        Object.keys(state.acc).forEach(id => { state.acc[id].color = color; });
        render();
    }

    function changeAccQty(id, delta) {
        const a = state.acc[id];
        if (!a) return;
        a.cantidad = Math.min(MAX, Math.max(1, a.cantidad + delta));
        render();
    }

    function toggleReg(on) {
        state.reg = on ? (state.reg || { cantidad: 1, color: "marron" }) : null;
        render();
    }

    /* Refleja el estado en la pantalla */
    function render() {
        if (bodyAcc) {
            ACCESORIOS.forEach(a => {
                const li = bodyAcc.querySelector(`[data-acc="${a.id}"]`);
                const st = state.acc[a.id];

                li.classList.toggle("is-on", !!st);
                li.querySelector("input").checked = !!st;
                li.querySelector(".acc-opts").hidden = !st;

                if (st) {
                    li.querySelectorAll("[data-acc-color]").forEach(b => {
                        const on = b.dataset.accColor === st.color;
                        b.classList.toggle("active", on);
                        b.setAttribute("aria-pressed", on ? "true" : "false");
                    });
                    li.querySelector("[data-acc-count]").textContent = st.cantidad;
                }

                const pin = bodyAcc.querySelector(`.pin[data-pin="${a.pin}"]`);
                if (pin) pin.classList.toggle("active", !!st);
            });

            const elegidos = Object.keys(state.acc).length;
            const todos = elegidos === ACCESORIOS.length;
            const allBtn = bodyAcc.querySelector("[data-acc-all]");
            allBtn.textContent = todos ? "Quitar los 7" : "Sumar los 7";
            allBtn.classList.toggle("on", todos);

            const bulk = bodyAcc.querySelector(".acc-bulk");
            bulk.hidden = elegidos < 2;
            if (elegidos >= 2) {
                const colores = Object.keys(state.acc).map(id => state.acc[id].color);
                const unico = colores.every(c => c === colores[0]) ? colores[0] : null;
                bulk.querySelectorAll("[data-bulk-color]").forEach(b => {
                    const on = b.dataset.bulkColor === unico;
                    b.classList.toggle("active", on);
                    b.setAttribute("aria-pressed", on ? "true" : "false");
                });
            }

            const regCheck = bodyAcc.querySelector("[data-reg-toggle]");
            const regOpts = bodyAcc.querySelector("[data-reg-opts]");
            regCheck.checked = !!state.reg;
            regOpts.hidden = !state.reg;
            if (state.reg) {
                regOpts.querySelectorAll("[data-reg-color]").forEach(b => {
                    const on = b.dataset.regColor === state.reg.color;
                    b.classList.toggle("active", on);
                    b.setAttribute("aria-pressed", on ? "true" : "false");
                });
                regOpts.querySelector("[data-reg-count]").textContent = state.reg.cantidad;
            }
        }

        renderSummary();
    }

    /* ---------- Resumen de lo que se va a agregar ---------- */

    const summary = document.createElement("section");
    summary.className = "config-summary";
    summary.setAttribute("aria-live", "polite");
    if (addBtn) addBtn.parentNode.insertBefore(summary, addBtn);

    function accesoriosElegidos() {
        return ACCESORIOS
            .filter(a => state.acc[a.id])
            .map(a => ({ id: a.id, cantidad: state.acc[a.id].cantidad, color: state.acc[a.id].color }));
    }

    function renderSummary() {
        const filas = [
            ["PIEZAS", `${state.qty} · Línea ${linea.nombre}`],
            ["COMPONENTES", `Color ${nombreColor(state.color).toLowerCase()}`],
        ];

        const accs = accesoriosElegidos();
        if (accs.length) {
            filas.push(["COMPLEMENTOS", accs
                .map(a => `${nombreAccesorio(a.id)} ×${a.cantidad} · ${nombreColor(a.color).toLowerCase()}`)
                .join("<br>")]);
        }

        if (state.reg) {
            filas.push(["REGULADOR AMBIENTAL", `×${state.reg.cantidad} · Fieltro ${nombreFieltro(state.reg.color).toLowerCase()}`]);
        }

        summary.innerHTML = `
            <span class="overline">TU CONFIGURACIÓN</span>
            ${filas.map(f => `<div class="config-summary-row"><span>${f[0]}</span><strong>${f[1]}</strong></div>`).join("")}
        `;
    }

    /* ---------- Agregar a mi selección ---------- */

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            addToSelection(
                lineaKey,
                state.qty,
                state.color,
                accesoriosElegidos(),
                state.reg ? { cantidad: state.reg.cantidad, color: state.reg.color } : null
            );

            /* queda listo para armar otra configuración; el color de componentes se mantiene */
            state.qty = 1;
            qtyLabel.textContent = "1";
            state.acc = {};
            state.reg = null;
            render();

            addBtn.textContent = "Agregada a mi selección ✓";
            addBtn.classList.add("added");
            openSelection();
            setTimeout(() => {
                addBtn.textContent = "Agregar a mi selección";
                addBtn.classList.remove("added");
            }, 1800);
        });
    }

    render();
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
