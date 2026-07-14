/* 
   script.js - Portafolio Profesional de Jose Rodríguez Melero
   Funciones interactivas, Estimador de PCB, Idiomas (ES/CA/EN), Selector Dropdown, Filtros y Modales.
*/

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. MENÚ MÓVIL & EFECTOS DE SCROLL
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !expanded);
            navMenu.classList.toggle('active');
            
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(section => {
            if (section.style.display !== 'none') {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });

        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // ==========================================
    // 2. COPIA DE EMAIL CON TOAST
    // ==========================================
    const copyEmailBtn = document.querySelector('.copy-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'jrmelero@proton.me';
            navigator.clipboard.writeText(email).then(() => {
                const currentLang = localStorage.getItem('portfolio-language') || 'es';
                let toastMsg = '¡Correo copiado al portapapeles!';
                if (currentLang === 'en') toastMsg = 'Email copied to clipboard!';
                if (currentLang === 'ca') toastMsg = 'Correu copiat al porta-retalls!';
                showToast(toastMsg);
            }).catch(err => {
                console.error('Error al copiar correo: ', err);
            });
        });
    }

    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==========================================
    // 3. BOTÓN SUBIR AL INICIO (SCROLL TO TOP)
    // ==========================================
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // 4. ESTIMADOR DE IMPEDANCIA MICROSTRIP
    // ==========================================
    const tabButtons = document.querySelectorAll('.stackup-tab');
    const pcbDiagram = document.querySelector('.pcb-layers-diagram');
    const sliderWidth = document.getElementById('slider-width');
    const sliderHeight = document.getElementById('slider-height');
    const selectMaterial = document.getElementById('select-material');
    
    const valWidthDisplay = document.getElementById('val-width');
    const valHeightDisplay = document.getElementById('val-height');
    const impedanceDisplay = document.querySelector('.impedance-display');
    const impedanceStatus = document.querySelector('.impedance-status');
    const layerInfoBox = document.getElementById('layer-info-box');
    const btnResetCalc = document.getElementById('btn-reset-calc');
    const btnCopyCalc = document.getElementById('btn-copy-calc');

    let currentLayers = 4;

    const layerTexts = {
        es: {
            top: "Capa Superior de Cobre (Señal): Pista conductora donde estimamos la impedancia.",
            bottom: "Capa Inferior de Cobre: Plano de referencia o retorno de corrientes.",
            prepreg: "Dieléctrico Prepreg (h): Capa aislante de espesor controlado sobre la que se asienta la señal.",
            core: "Sustrato Core (FR-4 decorativo): Núcleo rígido central de soporte mecánico.",
            gnd: "Plano Interno (GND): Plano de referencia continuo para retorno de corriente.",
            pwr: "Plano Interno (VCC): Plano de distribución de alimentación.",
            mid_sig: "Capa Interna (Señal): Capa de ruteado interno de propósito general."
        },
        ca: {
            top: "Capa Superior de Coure (Senyal): Pista conductora on estimem la impedància.",
            bottom: "Capa Inferior de Coure: Planell de referència o retorn de corrents.",
            prepreg: "Dielèctric Prepreg (h): Capa aïllant de gruix controlat sobre la qual s'assenta el senyal.",
            core: "Sustrat Core (FR-4 decoratiu): Nucli rígid central de suport mecànic.",
            gnd: "Planell Intern (GND): Planell de referència continu per a retorn de corrent.",
            pwr: "Planell Intern (VCC): Planell de distribució d'alimentació.",
            mid_sig: "Capa Interna (Senyal): Capa de ruteig intern de propòsit general."
        },
        en: {
            top: "Top Copper Layer (Signal): Conducting trace where we estimate characteristic impedance.",
            bottom: "Bottom Copper Layer: Reference return path or power distribution plane.",
            prepreg: "Prepreg Dielectric (h): Insulating layer of controlled thickness supporting the signal trace.",
            core: "Core Substrate (FR-4 decorative): Central rigid mechanical support core.",
            gnd: "Internal Plane (GND): Continuous reference plane for current return path.",
            pwr: "Internal Plane (VCC): Internal power distribution plane.",
            mid_sig: "Internal Layer (Signal): General purpose internal signal routing layer."
        }
    };

    function renderStackup() {
        if (!pcbDiagram) return;
        
        const hVal = parseFloat(sliderHeight.value);
        const currentLang = localStorage.getItem('portfolio-language') || 'es';
        
        // Define translated labels for the layers (based on language)
        const labels = {
            es: {
                top: "Capa superior — Señal",
                prepreg_h: "Prepreg — h",
                gnd_ref: "Plano int. 1 — GND ref.",
                core: "Core FR-4",
                vcc: "Plano int. 2 — VCC",
                prepreg: "Prepreg",
                bottom_gnd: "Capa inf. — GND",
                bottom_gnd_ref: "Capa inf. — GND ref."
            },
            ca: {
                top: "Capa superior — Senyal",
                prepreg_h: "Prepreg — h",
                gnd_ref: "Pla int. 1 — GND ref.",
                core: "Nucli FR-4",
                vcc: "Pla int. 2 — VCC",
                prepreg: "Prepreg",
                bottom_gnd: "Capa inf. — GND",
                bottom_gnd_ref: "Capa inf. — GND ref."
            },
            en: {
                top: "Top layer — Signal",
                prepreg_h: "Prepreg — h",
                gnd_ref: "Inner pl. 1 — GND ref.",
                core: "FR-4 core",
                vcc: "Inner pl. 2 — VCC",
                prepreg: "Prepreg",
                bottom_gnd: "Bottom layer — GND",
                bottom_gnd_ref: "Bottom lay. — GND ref."
            }
        }[currentLang] || labels.es;

        // Custom descriptions for each layer depending on role
        const hoverDescs = {
            es: {
                top: "Capa superior de cobre: Pista conductora donde estimamos la impedancia. Capa usada en el cálculo.",
                prepreg_h: "Dieléctrico situado entre la pista superior y el plano de referencia. Su altura h es uno de los parámetros principales del cálculo.",
                gnd_ref: "Plano de referencia utilizado como retorno de señal para la línea microstrip. Capa usada en el cálculo.",
                core: "Sustrato central rígido de soporte mecánico (FR-4). No influye en el cálculo.",
                vcc: "Plano interno de alimentación de cobre para la distribución de energía (VCC). No influye en el cálculo.",
                prepreg: "Material aislante prepreg adicional para el stackup simétrico. No influye en el cálculo.",
                bottom: "Capa inferior de cobre de la placa, comúnmente utilizada como plano de masa general. No influye en el cálculo.",
                bottom_ref: "Plano de referencia inferior utilizado como retorno de corriente de la señal. Capa usada en el cálculo."
            },
            ca: {
                top: "Capa superior de coure: Pista conductora on estimem la impedància. Capa usada en el càlcul.",
                prepreg_h: "Dielèctric situat entre la pista superior i el pla de referència. La seva altura h és un dels paràmetres principals del càlcul.",
                gnd_ref: "Pla de referència utilitzat com a retorn de senyal per a la línia microstrip. Capa usada en el càlcul.",
                core: "Substrat central rígid de suport mecànic (FR-4). No influeix en el càlcul.",
                vcc: "Pla intern d'alimentació de coure per a la distribució d'energia (VCC). No influeix en el càlcul.",
                prepreg: "Material aïllant prepreg addicional per a l'stackup simètric. No influeix en el càlcul.",
                bottom: "Capa inferior de coure de la placa, comunament utilitzada com a pla de massa general. No influeix en el càlcul.",
                bottom_ref: "Pla de referència inferior utilitzat com a retorn de corrent del senyal. Capa usada en el càlcul."
            },
            en: {
                top: "Top copper layer: Conducting trace where we estimate characteristic impedance. Layer used in the calculation.",
                prepreg_h: "Dielectric located between the top trace and the reference plane. Its height h is one of the main parameters of the calculation.",
                gnd_ref: "Reference plane used as signal return for the microstrip line. Layer used in the calculation.",
                core: "Central rigid substrate for mechanical support (FR-4). Not used in the calculation.",
                vcc: "Internal copper power plane for energy distribution (VCC). Not used in the calculation.",
                prepreg: "Additional prepreg insulating layer for stackup symmetry. Not used in the calculation.",
                bottom: "Bottom copper layer of the board, commonly used as general ground plane. Not used in the calculation.",
                bottom_ref: "Bottom reference plane used as return current path for the signal. Layer used in the calculation."
            }
        }[currentLang] || hoverDescs.es;
        
        const hHeight = Math.round(20 + hVal * 80);
        let html = '';
        
        if (currentLayers === 2) {
            html = `
                <div class="pcb-layer copper layer-signal in-calc-model" data-legend="copper" data-info="${hoverDescs.top}">${labels.top} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric in-calc-model" data-legend="prepreg" data-info="${hoverDescs.prepreg_h}" style="height: ${hHeight}px;">${labels.prepreg_h} (h) <span class="pcb-layer-thickness">${hVal.toFixed(2)} mm</span></div>
                <div class="pcb-layer copper layer-plane in-calc-model gnd-ref-highlight" data-legend="gnd" data-info="${hoverDescs.bottom_ref}">${labels.bottom_gnd_ref} <span class="pcb-layer-thickness">35µm</span></div>
            `;
        } else if (currentLayers === 4) {
            html = `
                <div class="pcb-layer copper layer-signal in-calc-model" data-legend="copper" data-info="${hoverDescs.top}">${labels.top} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric in-calc-model" data-legend="prepreg" data-info="${hoverDescs.prepreg_h}" style="height: ${hHeight}px;">${labels.prepreg_h} (h) <span class="pcb-layer-thickness">${hVal.toFixed(2)} mm</span></div>
                <div class="pcb-layer copper layer-plane in-calc-model gnd-ref-highlight" data-legend="gnd" data-info="${hoverDescs.gnd_ref}">${labels.gnd_ref} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer prepreg" data-legend="core" data-info="${hoverDescs.core}" style="height: 75px;">${labels.core} <span class="pcb-layer-thickness">0.80 mm</span></div>
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${hoverDescs.vcc}">${labels.vcc} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric" data-legend="prepreg" data-info="${hoverDescs.prepreg}" style="height: 36px; opacity: 0.7;">${labels.prepreg} <span class="pcb-layer-thickness">0.20 mm</span></div>
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${hoverDescs.bottom}">${labels.bottom_gnd} <span class="pcb-layer-thickness">35µm</span></div>
            `;
        } else if (currentLayers === 6) {
            html = `
                <div class="pcb-layer copper layer-signal in-calc-model" data-legend="copper" data-info="${hoverDescs.top}">${labels.top} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric in-calc-model" data-legend="prepreg" data-info="${hoverDescs.prepreg_h}" style="height: ${hHeight}px;">${labels.prepreg_h} (h) <span class="pcb-layer-thickness">${hVal.toFixed(2)} mm</span></div>
                <div class="pcb-layer copper layer-plane in-calc-model gnd-ref-highlight" data-legend="gnd" data-info="${hoverDescs.gnd_ref}">${labels.gnd_ref} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer prepreg" data-legend="core" data-info="${hoverDescs.core}" style="height: 50px;">${labels.core} <span class="pcb-layer-thickness">0.40 mm</span></div>
                
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${hoverDescs.mid_sig}">${currentLang === 'en' ? 'Inner mid-signal' : (currentLang === 'ca' ? 'Capa int. 2 — Senyal' : 'Capa int. 2 — Señal')} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric" data-legend="prepreg" data-info="${hoverDescs.prepreg}" style="height: 36px; opacity: 0.7;">${labels.prepreg} <span class="pcb-layer-thickness">0.20 mm</span></div>
                
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${hoverDescs.vcc}">${labels.vcc} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer prepreg" data-legend="core" data-info="${hoverDescs.core}" style="height: 50px;">${labels.core} <span class="pcb-layer-thickness">0.40 mm</span></div>
                
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${currentLang === 'en' ? 'Inner pl. 4 — GND' : (currentLang === 'ca' ? 'Pla int. 4 — GND' : 'Plano int. 4 — GND')}" style="opacity: 0.85;">${currentLang === 'en' ? 'Inner pl. 4 — GND' : (currentLang === 'ca' ? 'Pla int. 4 — GND' : 'Plano int. 4 — GND')} <span class="pcb-layer-thickness">35µm</span></div>
                <div class="pcb-layer dielectric" data-legend="prepreg" data-info="${hoverDescs.prepreg}" style="height: 36px; opacity: 0.7;">${labels.prepreg} <span class="pcb-layer-thickness">0.20 mm</span></div>
                <div class="pcb-layer copper layer-plane" data-legend="copper" data-info="${hoverDescs.bottom}">${labels.bottom_gnd} <span class="pcb-layer-thickness">35µm</span></div>
            `;
        }
        
        pcbDiagram.innerHTML = html;

        // Calculate bracket position and height dynamically in JS
        const layers = pcbDiagram.querySelectorAll('.pcb-layer');
        if (layers.length >= 3) {
            const layer1 = layers[0];
            const layer3 = layers[2];
            
            const topPos = layer1.offsetTop;
            const botPos = layer3.offsetTop + layer3.offsetHeight;
            const bracketHeight = botPos - topPos;
            
            const bracket = document.createElement('div');
            bracket.className = 'pcb-calc-bracket';
            bracket.style.top = `${topPos}px`;
            bracket.style.height = `${bracketHeight}px`;
            bracket.innerHTML = `<span>CALC</span>`;
            pcbDiagram.appendChild(bracket);
        }

        // Re-attach hover/click events to layers
        layers.forEach(layer => {
            const info = layer.getAttribute('data-info');
            const legendTarget = layer.getAttribute('data-legend');
            
            function highlightOn() {
                // Clear any other active hovers first
                layers.forEach(l => l.classList.remove('active-hover'));
                document.querySelectorAll('.stackup-legend span').forEach(el => {
                    el.classList.remove('highlight-legend');
                });
                
                layer.classList.add('active-hover');
                layerInfoBox.textContent = info;
                layerInfoBox.style.borderColor = 'var(--accent-cyan)';
                
                // Highlight legend
                if (legendTarget) {
                    const legendEl = document.querySelector(`.legend-${legendTarget}`);
                    if (legendEl) {
                        legendEl.classList.add('highlight-legend');
                    }
                }
            }
            
            function highlightOff() {
                layer.classList.remove('active-hover');
                layerInfoBox.style.borderColor = 'rgba(212,175,55,0.15)';
                
                // Remove highlight from legends
                document.querySelectorAll('.stackup-legend span').forEach(el => {
                    el.classList.remove('highlight-legend');
                });
            }

            layer.addEventListener('mouseenter', highlightOn);
            layer.addEventListener('mouseleave', highlightOff);
            
            // Touch support for mobile devices
            layer.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                highlightOn();
            });
        });
    }
    function calculatePCB() {
        const wVal = parseFloat(sliderWidth.value);
        const hVal = parseFloat(sliderHeight.value);
        const erVal = parseFloat(selectMaterial.value);
        const currentLang = localStorage.getItem('portfolio-language') || 'es';

        valWidthDisplay.textContent = `${wVal.toFixed(2)} mm`;
        valHeightDisplay.textContent = `${hVal.toFixed(2)} mm`;

        // Validations of invalid ranges for mathematical logic
        if (wVal <= 0 || hVal <= 0 || isNaN(wVal) || isNaN(hVal)) {
            impedanceDisplay.innerHTML = `Err`;
            impedanceStatus.textContent = currentLang === 'en' ? 'Invalid input dimensions.' : (currentLang === 'ca' ? 'Dimensions d\'entrada no vàlides.' : 'Dimensiones de entrada no válidas.');
            impedanceStatus.style.color = 'var(--accent-red)';
            return;
        }

        // IPC-2141 Microstrip impedance formula calculation:
        // Z0 = (87 / sqrt(er + 1.41)) * ln(5.98h / (0.8w + t))
        // t = 0.035 mm (copper thickness)
        const t = 0.035;
        const erFactor = 87 / Math.sqrt(erVal + 1.41);
        const denominator = 0.8 * wVal + t;
        const lnArg = (5.98 * hVal) / denominator;
        
        let z0 = 0;
        if (lnArg > 0) {
            z0 = erFactor * Math.log(lnArg);
        }
        
        if (z0 <= 0 || isNaN(z0)) z0 = 0;
        
        // Update UI displays
        impedanceDisplay.innerHTML = `${z0.toFixed(1)} <span style="font-size: 1.5rem; font-weight: 500;">Ω</span>`;
        
        // Dynamic status feedback (Only for single-ended transmission line impedance match, e.g. RF 50 Ohm)
        let statusText = '';
        let statusColor = 'var(--text-muted)';
        
        if (z0 >= 45 && z0 <= 55) {
            if (currentLang === 'en') statusText = '✓ Value close to the 50 Ω target';
            else if (currentLang === 'ca') statusText = '✓ Valor proper a l\'objectiu de 50 Ω';
            else statusText = '✓ Valor próximo al objetivo de 50 Ω';
            statusColor = 'var(--accent-green)';
        } else if (z0 >= 70 && z0 <= 80) {
            if (currentLang === 'en') statusText = '✓ Value close to the 75 Ω target';
            else if (currentLang === 'ca') statusText = '✓ Valor proper a l\'objectiu de 75 Ω';
            else statusText = '✓ Valor próximo al objetivo de 75 Ω';
            statusColor = 'var(--accent-green)';
        } else {
            if (currentLang === 'en') statusText = 'General Single-Ended signal trace routing';
            else if (currentLang === 'ca') statusText = 'Ruteig de pista de senyal Single-Ended general';
            else statusText = 'Línea de señal Single-Ended de propósito general';
            statusColor = 'var(--text-secondary)';
        }
        
        impedanceStatus.textContent = statusText;
        impedanceStatus.style.color = statusColor;
        
        // Render layers height dynamically
        renderStackup();
    }

    if (sliderWidth && sliderHeight && selectMaterial) {
        sliderWidth.addEventListener('input', calculatePCB);
        sliderHeight.addEventListener('input', calculatePCB);
        selectMaterial.addEventListener('change', calculatePCB);
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLayers = parseInt(btn.getAttribute('data-layers'));
                calculatePCB();
            });
        });

        if (btnResetCalc) {
            btnResetCalc.addEventListener('click', () => {
                sliderWidth.value = 0.35;
                sliderHeight.value = 0.20;
                selectMaterial.value = 4.2;
                calculatePCB();
            });
        }

        if (btnCopyCalc) {
            btnCopyCalc.addEventListener('click', () => {
                const wVal = parseFloat(sliderWidth.value);
                const hVal = parseFloat(sliderHeight.value);
                const erVal = parseFloat(selectMaterial.value);
                const zDisplay = impedanceDisplay.textContent.trim();
                const currentLang = localStorage.getItem('portfolio-language') || 'es';
                
                let textToCopy = '';
                if (currentLang === 'en') {
                    textToCopy = `Microstrip Impedance Estimator - Jose Rodríguez Melero
Configuration: ${currentLayers} Layers
Permittivity (er): ${erVal}
Trace Width (w): ${wVal.toFixed(2)} mm
Dielectric Height (h): ${hVal.toFixed(2)} mm
Copper Thickness (t): 0.035 mm (35 µm, 1 oz/ft²)
Geometry Type: Single-Ended Microstrip
Characteristic Impedance (Z0): ${zDisplay}`;
                } else if (currentLang === 'ca') {
                    textToCopy = `Estimador d'impedància microstrip - Jose Rodríguez Melero
Configuració: Stackup de ${currentLayers} capes
Permitivitat (er): ${erVal}
Amplada de pista (w): ${wVal.toFixed(2)} mm
Alçada del dielèctric (h): ${hVal.toFixed(2)} mm
Gruix del coure (t): 0.035 mm (35 µm, 1 oz/ft²)
Geometria: Microstrip Single-Ended
Impedància característica (Z0): ${zDisplay}`;
                } else {
                    textToCopy = `Estimador de impedancia microstrip - Jose Rodríguez Melero
Configuración: Stackup de ${currentLayers} capas
Permitividad dieléctrica (er): ${erVal}
Ancho de pista (w): ${wVal.toFixed(2)} mm
Altura del dieléctrico (h): ${hVal.toFixed(2)} mm
Grosor de cobre (t): 0.035 mm (35 µm, 1 oz/ft²)
Geometría: Microstrip Single-Ended
Impedancia característica (Z0): ${zDisplay}`;
                }

                navigator.clipboard.writeText(textToCopy).then(() => {
                    let msg = '¡Resultados copiados al portapapeles!';
                    if (currentLang === 'en') msg = 'Results copied to clipboard!';
                    if (currentLang === 'ca') msg = 'Resultats copiats al porta-retalls!';
                    showToast(msg);
                }).catch(err => {
                    console.error('Error copying text: ', err);
                });
            });
        }
        
        // Initialize tool
        calculatePCB();
    }

    // ==========================================
    // 5. FILTRADO DINÁMICO DE PROYECTOS & CASOS DE ESTUDIO
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons && projectCards) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => { card.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    }

    // Modal data details separating Context, Contribution, Tools, Process, Result, Docs
    const projectData = {
        es: {
            "p1": {
                title: "Diseño de PCB para sistemas de baterías LiFePO₄",
                subtitle: "Altium Designer | Ironwelding Barcelona",
                context: "Diseño de hardware electrónico robusto para celdas industriales de Litio Ferro-fosfato (LiFePO₄) destinadas a sistemas energéticos estacionarios y móviles.",
                contribution: "Colaboración en el desarrollo de los esquemas electrónicos y el diseño del layout de PCBs para módulos de baterías LiFePO₄, en cooperación con el equipo técnico de Ironwelding.",
                tools: "Altium Designer, Proteus, Instrumentación de laboratorio.",
                process: "Cálculos de trazas de potencia, ruteado multicapa con planos de masa térmica para disipar calor, simulación de sensado analógico y ensamble físico del battery pack.",
                result: "Sistemas de baterías operativos integrados comercialmente por el departamento técnico.",
                docs: "Documentación interna no publicada.",
                visual: "Contenido visual pendiente de incorporación."
            },
            "p2": {
                title: "Integración de telemetría y adquisición de datos CAN Bus",
                subtitle: "Sistemas Embebidos & Comunicaciones | E3Team EPSEVG",
                context: "Red de datos de a bordo para la adquisición e interpretación de telemetría en tiempo real del prototipo de MotoStudent Electric.",
                contribution: "Desarrollo del sistema de logging, cableado del bus y decodificación de tramas de inversores, BMS Orion y centralitas (ECUs) en el marco de la tesis universitaria.",
                tools: "Vector CANoe / Signal-Oriented CAPL, Bases de datos DBC, Arduino, STM32.",
                process: "Diseño de base de datos DBC de tramas del vehículo, implementación física de par trenzado diferencial, desarrollo de scripts CAPL orientados a señales y pruebas de validación con analizadores de hardware.",
                result: "Red de telemetría estable evaluada con calificación sobresaliente en el TFG publicado en el repositorio de la universidad.",
                docsLink: "https://hdl.handle.net/2117/446188",
                visual: "Contenido visual pendiente de incorporación."
            },
            "p3": {
                title: "Desarrollo y diseño de brazo robótico",
                subtitle: "Mecánica & Robótica | Fundació Bosch i Gimpera",
                context: "Proyecto de investigación PRODUCTO (AGAUR 2023) para el diseño de un brazo robótico de precisión.",
                contribution: "Modelado 3D mecánico, tolerancias de acoplamiento, selección de materiales y preparación de archivos de fabricación en colaboración con el equipo científico.",
                tools: "SolidWorks, Impresión 3D, Mecanizado físico.",
                process: "Diseño en CAD, cálculos de esfuerzo estructural y torque, simulación cinemática, preparación de archivos de fabricación y ensayos dinámicos en laboratorio.",
                result: "Prototipo funcional entregado y validado en el cronograma científico de la fundación.",
                docs: "Documentación interna no publicada.",
                visual: "Contenido visual pendiente de incorporación."
            },
            "p4": {
                title: "E3Team MotoStudent Electric: desarrollo técnico y coordinación",
                subtitle: "Dirección Técnica & Hardware | E3Team EPSEVG",
                context: "Desarrollo del prototipo de motocicleta de carreras eléctrica para la competición internacional MotoStudent.",
                contribution: "Coordinación técnica general de los diferentes departamentos como Team Leader del equipo multidisciplinar de más de 30 ingenieros, aplicando metodologías ágiles.",
                tools: "Taiga, Trello, Metodologías ágiles, Altium Designer, BMS Orion.",
                process: "Definición de roadmaps de entregas, planificación ágil de tareas por sprints, coordinación de departamentos (batería, chasis, electrónica) y ensamblaje de la electrónica de baja señal.",
                result: "4ª posición a nivel internacional en la competición MotoStudent Electric (septiembre de 2025), superando con éxito todos los ensayos estáticos e inspecciones técnicas ante equipos de todo el mundo.",
                docsLink: "https://motorsportvng.upc.edu/es/e3team",
                visual: "Galería de imágenes de la competición en MotorLand Aragón." ,
                images: [
                    {
                        src: "assets/motostudent_group_rivals.jpg",
                        caption_es: "Nuestra moto (#33) junto a la de los rivales y compañeros de Terrassa (Motospirit, #8)",
                        caption_ca: "La nostra moto (#33) juntament amb la dels rivals i companys de Terrassa (Motospirit, #8)",
                        caption_en: "Our bike (#33) next to rivals and friends from Terrassa (Motospirit, #8)"
                    },
                    {
                        src: "assets/motostudent_team.jpg",
                        caption_es: "El equipo E3Team celebrando la finalización del prototipo",
                        caption_ca: "L'equip E3Team celebrant la finalització del prototip",
                        caption_en: "E3Team celebrating the completion of the prototype"
                    },
                    {
                        src: "assets/motostudent_bike.jpg",
                        caption_es: "Detalle del carenado y chasis de la motocicleta eléctrica #33",
                        caption_ca: "Detall del carenat i xassís de la motocicleta elèctrica #33",
                        caption_en: "Close-up of the fairing and chassis of electric motorcycle #33"
                    },
                    {
                        src: "assets/motostudent_podium.jpg",
                        caption_es: "Celebrando la 4ª posición internacional (P4) en la competición de Aragón",
                        caption_ca: "Celebrant la 4a posició internacional (P4) a la competició d'Aragó",
                        caption_en: "Celebrating 4th international position (P4) in the Aragon competition"
                    }
                ]
            }
        },
        ca: {
            "p1": {
                title: "Disseny de PCB per a sistemes de bateries LiFePO₄",
                subtitle: "Altium Designer | Ironwelding Barcelona",
                context: "Disseny de hardware electrònic per a cel·les industrials de Liti Ferro-fosfat (LiFePO₄) destinades a sistemes d'emmagatzematge d'energia.",
                contribution: "Col·laboració en el desenvolupament dels esquemes elèctrics i disseny del layout de PCBs per a mòduls de bateries LiFePO₄, en cooperació amb l'equip tècnic d'Ironwelding.",
                tools: "Altium Designer, Proteus, Instrumentació de laboratori.",
                process: "Càlcul de pistes de potència, layout multicapa amb plans de dissipació tèrmica, simulació de sensat analògic i muntatge físic.",
                result: "Sistemes de bateries funcionals integrats comercialment pel departament tècnic.",
                docs: "Documentació interna no publicada.",
                visual: "Contingut visual pendent d'incorporació."
            },
            "p2": {
                title: "Integració de telemetria i adquisició de dades CAN Bus",
                subtitle: "Sistemes Encastats & Comunicacions | E3Team EPSEVG",
                context: "Adquisició i processament de telemetria en temps real per al prototip de motocicleta elèctrica de competició.",
                contribution: "Disseny de la xarxa de comunicació interna, configuració de busos físics i decodificació de trames sota protocol CAN Bus, connectant centraletes i el BMS Orion, en col·laboració amb el departament d'electrònica.",
                tools: "Vector CANoe / Signal-Oriented CAPL, bases de dades DBC, Arduino, STM32.",
                process: "Definició del fitxer DBC de trames del vehicle, cablejat físic de parell trenat, programació de scripts CAPL i anàlisi de xarxa amb oscil·loscopi i analitzadors.",
                result: "Xarxa de telemetria estable integrada en el prototip del vehicle.",
                docsLink: "https://hdl.handle.net/2117/446188",
                visual: "Contingut visual pendent d'incorporació."
            },
            "p3": {
                title: "Desenvolupament i disseny de braç robòtic",
                subtitle: "Mecànica & Robòtica | Fundació Bosch i Gimpera",
                context: "Disseny i validació experimental d'un braç robòtic de precisió dins del projecte d'investigació PRODUCTO (AGAUR 2023).",
                contribution: "Disseny mecànic en 3D, disseny de peces i definició de toleràncies mecàniques per a la fabricació en col·laboració amb l'equip científic.",
                tools: "SolidWorks, Impressió 3D, Mecanitzat mecànic.",
                process: "Modelatge CAD de components, simulacions d'esforços mecànics, impressió 3D de prototips ràpids i assajos experimentals.",
                result: "Braç robòtic funcional entregat al laboratori de recerca de la fundació.",
                docs: "Documentació interna no publicada.",
                visual: "Contingut visual pendent d'incorporació."
            },
            "p4": {
                title: "E3Team MotoStudent Electric: desenvolupament tècnic i coordinació",
                subtitle: "Direcció Tècnica & Hardware | E3Team EPSEVG",
                context: "Gestió i desenvolupament integral del prototip de motocicleta de carreres elèctrica per a la competició internacional MotoStudent.",
                contribution: "Coordinació tècnica de les diferents àrees d'enginyeria (powertrain, electrònica, xassís) com a Team Leader, liderant un equip multidisciplinari de més de 30 persones sota metodologies àgiles.",
                tools: "Taiga, Trello, Metodologies àgiles, Altium Designer, BMS Orion.",
                process: "Coordinació d'equips, planificació de sprints de disseny, muntatge elèctric de baixa tensió i preparació per a les inspeccions de seguretat.",
                result: "4a posició a nivell internacional a la competició MotoStudent Electric (setembre de 2025), superant amb èxit tots els assajos estàtics i inspeccions tècniques davant d'equips de tot el món.",
                docsLink: "https://motorsportvng.upc.edu/es/e3team",
                visual: "Galeria d'imatges de la competició a MotorLand Aragó." ,
                images: [
                    {
                        src: "assets/motostudent_group_rivals.jpg",
                        caption_es: "Nuestra moto (#33) junto a la de los rivales y compañeros de Terrassa (Motospirit, #8)",
                        caption_ca: "La nostra moto (#33) juntament amb la dels rivals i companys de Terrassa (Motospirit, #8)",
                        caption_en: "Our bike (#33) next to rivals and friends from Terrassa (Motospirit, #8)"
                    },
                    {
                        src: "assets/motostudent_team.jpg",
                        caption_es: "El equipo E3Team celebrando la finalización del prototipo",
                        caption_ca: "L'equip E3Team celebrant la finalització del prototip",
                        caption_en: "E3Team celebrating the completion of the prototype"
                    },
                    {
                        src: "assets/motostudent_bike.jpg",
                        caption_es: "Detalle del carenado y chasis de la motocicleta eléctrica #33",
                        caption_ca: "Detall del carenat i xassís de la motocicleta elèctrica #33",
                        caption_en: "Close-up of the fairing and chassis of electric motorcycle #33"
                    },
                    {
                        src: "assets/motostudent_podium.jpg",
                        caption_es: "Celebrando la 4ª posición internacional (P4) en la competición de Aragón",
                        caption_ca: "Celebrant la 4a posició internacional (P4) a la competició d'Aragó",
                        caption_en: "Celebrating 4th international position (P4) in the Aragon competition"
                    }
                ]
            }
        },
        en: {
            "p1": {
                title: "PCB Design for LiFePO₄ Battery Systems",
                subtitle: "Altium Designer | Ironwelding Barcelona",
                context: "Designing robust electronic hardware for industrial Lithium Iron Phosphate (LiFePO₄) cells targeting stationary and mobile energy storage applications.",
                contribution: "Collaboration in schematic design and PCB layout design for LiFePO₄ battery modules, in cooperation with the technical team at Ironwelding.",
                tools: "Altium Designer, Proteus, Laboratory test instrumentation.",
                process: "Trace power calculations, multi-layer board layout using thermal copper planes, analog sensing simulations, and battery pack structural assembly.",
                result: "Fully functional battery storage modules integrated commercially by the technical department.",
                docs: "Internal documentation not published.",
                visual: "Visual content pending incorporation."
            },
            "p2": {
                title: "Telemetry Integration & CAN Bus Data Acquisition",
                subtitle: "Embedded Systems & Communications | E3Team EPSEVG",
                context: "On-board data acquisition network for real-time telemetry processing in the MotoStudent Electric prototype.",
                contribution: "Developed the logging system, bus physical wiring, and frame decoding from inverters, Orion BMS, and ECUs within the university thesis framework.",
                tools: "Vector CANoe / Signal-Oriented CAPL, DBC databases, Arduino, STM32.",
                process: "Created custom vehicle DBC files, implemented twisted-pair network lines, wrote signal-oriented CAPL scripts, and ran hardware test analysis.",
                result: "Telemetry communication architecture validated with honors in the thesis published in UPCommons.",
                docsLink: "https://hdl.handle.net/2117/446188",
                visual: "Visual content pending incorporation."
            },
            "p3": {
                title: "Robotic Arm Design and Development",
                subtitle: "Mechanics & Robotics | Bosch i Gimpera Foundation",
                context: "Robotic arm design and verification within the PRODUCTO scientific research project (AGAUR 2023).",
                contribution: "Mechanical 3D CAD modeling, assembly tolerances, material specification, and prototype CAM files in collaboration with the research team.",
                tools: "SolidWorks, 3D Printing, Mechanical machining.",
                process: "SolidWorks design, structural stress and torque analysis, kinematic simulations, preparing CAM print files, and joint lab experiments.",
                result: "Completed robot prototype successfully validated within the research schedule.",
                docs: "Internal documentation not published.",
                visual: "Visual content pending incorporation."
            },
            "p4": {
                title: "E3Team MotoStudent Electric: Technical Development & Team Coordination",
                subtitle: "Technical Direction & Hardware | E3Team EPSEVG",
                context: "Production of the electric racing bike prototype for MotoStudent international student engineering competition.",
                contribution: "Coordinators of engineering departments as Team Leader of the multidisciplinary team of 30+ members under agile methodologies.",
                tools: "Taiga, Trello, Agile/Kanban, Altium Designer, Orion BMS.",
                process: "Defining delivery roadmaps, managing Agile sprints, coordinating departments (powertrain, electronics, frame), and physical integration of low-signal electronics.",
                result: "4th position internationally in the MotoStudent Electric competition (September 2025), successfully passing all static tests and technical inspections against teams from all over the world.",
                docsLink: "https://motorsportvng.upc.edu/es/e3team",
                visual: "Image gallery of the competition at MotorLand Aragón." ,
                images: [
                    {
                        src: "assets/motostudent_group_rivals.jpg",
                        caption_es: "Nuestra moto (#33) junto a la de los rivales y compañeros de Terrassa (Motospirit, #8)",
                        caption_ca: "La nostra moto (#33) juntament amb la dels rivals i companys de Terrassa (Motospirit, #8)",
                        caption_en: "Our bike (#33) next to rivals and friends from Terrassa (Motospirit, #8)"
                    },
                    {
                        src: "assets/motostudent_team.jpg",
                        caption_es: "El equipo E3Team celebrando la finalización del prototipo",
                        caption_ca: "L'equip E3Team celebrant la finalització del prototip",
                        caption_en: "E3Team celebrating the completion of the prototype"
                    },
                    {
                        src: "assets/motostudent_bike.jpg",
                        caption_es: "Detalle del carenado y chasis de la motocicleta eléctrica #33",
                        caption_ca: "Detall del carenat i xassís de la motocicleta elèctrica #33",
                        caption_en: "Close-up of the fairing and chassis of electric motorcycle #33"
                    },
                    {
                        src: "assets/motostudent_podium.jpg",
                        caption_es: "Celebrando la 4ª posición internacional (P4) en la competición de Aragón",
                        caption_ca: "Celebrant la 4a posició internacional (P4) a la competició d'Aragó",
                        caption_en: "Celebrating 4th international position (P4) in the Aragon competition"
                    }
                ]
            }
        }
    };

    const projectModal = document.getElementById('project-modal');
    const modalBody = projectModal ? projectModal.querySelector('#modal-body-container') : null;
    const modalClose = projectModal ? projectModal.querySelector('#btn-close-modal') : null;
    let activeTriggerElement = null;

    if (projectModal && modalBody && projectCards) {
        projectCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                activeTriggerElement = card;
                const currentLang = localStorage.getItem('portfolio-language') || 'es';
                const projKey = `p${index + 1}`;
                const data = projectData[currentLang][projKey];

                if (!data) return;

                const textContext = currentLang === 'en' ? 'Context' : (currentLang === 'ca' ? 'Context' : 'Contexto');
                const textContrib = currentLang === 'en' ? 'My Contribution' : (currentLang === 'ca' ? 'La meva aportació' : 'Mi aportación concreta');
                const textTools = currentLang === 'en' ? 'Tools' : (currentLang === 'ca' ? 'Eines' : 'Herramientas');
                const textProcess = currentLang === 'en' ? 'Process' : (currentLang === 'ca' ? 'Procés' : 'Proceso');
                const textResult = currentLang === 'en' ? 'Result' : (currentLang === 'ca' ? 'Resultat' : 'Resultado');
                const textDocs = currentLang === 'en' ? 'Documentation' : (currentLang === 'ca' ? 'Documentació' : 'Documentación');
                const textViewDoc = currentLang === 'en' ? 'View Document' : (currentLang === 'ca' ? 'Veure document' : 'Ver documento');

                modalBody.innerHTML = `
                    <span class="modal-subtitle">${data.subtitle}</span>
                    <h3 class="modal-title" id="modal-project-title">${data.title}</h3>
                    
                    <div style="margin-top: 18px;">
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textContext}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">${data.context}</p>
                    </div>
                    
                    <div>
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textContrib}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">${data.contribution}</p>
                    </div>
                    
                    <div>
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textTools}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.9rem; font-family: var(--font-code);">${data.tools}</p>
                    </div>
                    
                    <div>
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textProcess}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">${data.process}</p>
                    </div>
                    
                    <div>
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textResult}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">${data.result}</p>
                    </div>
                    
                    <div>
                        <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; font-family: var(--font-code);">${textDocs}</h5>
                        <p class="modal-text" style="margin-bottom: 16px; font-size: 0.95rem;">
                            ${data.docsLink ? `<a href="${data.docsLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(212,175,55,0.25);">${textViewDoc} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i></a>` : `${data.docs}`}
                        </p>
                    </div>
                    
                    ${data.images && data.images.length > 0 ? `
                        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1);">
                            <h5 style="color: var(--accent-cyan); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-code);">${currentLang === 'en' ? 'Project Gallery' : (currentLang === 'ca' ? 'Galeria del projecte' : 'Galería del proyecto')}</h5>
                            <div class="modal-gallery" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                                ${data.images.map(img => {
                                    const caption = img[`caption_${currentLang}`] || img.caption_es;
                                    return `
                                        <div class="gallery-item" style="display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 10px;">
                                            <img src="${img.src}" alt="${caption}" style="width: 100%; border-radius: 6px; aspect-ratio: 4/3; object-fit: cover; cursor: pointer; transition: transform 0.3s ease;" onclick="window.open('${img.src}', '_blank')">
                                            <span style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; font-style: italic; text-align: center; padding: 2px 4px;">${caption}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.1); text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
                            <i class="fa-solid fa-image"></i> ${data.visual}
                        </div>
                    `}
                `;

                projectModal.setAttribute('aria-hidden', 'false');
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop background scrolling
                
                // Focus trap logic
                const modalContent = projectModal.querySelector('.modal-content');
                if (modalContent) modalContent.focus();

                projectModal.addEventListener('keydown', trapTabKey);
            });
        });

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeModal();
            }
        });

        function trapTabKey(e) {
            if (e.key === 'Tab') {
                const focusable = projectModal.querySelectorAll('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first || document.activeElement === projectModal.querySelector('.modal-content')) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        }

        function closeModal() {
            projectModal.setAttribute('aria-hidden', 'true');
            projectModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            projectModal.removeEventListener('keydown', trapTabKey);
            if (activeTriggerElement) {
                activeTriggerElement.focus();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ==========================================
    // 6. ACCORDION / COLLAPSIBLE TRAJECTORY DETAILS
    // ==========================================
    const toggleButtons = document.querySelectorAll('.btn-toggle-details');
    toggleButtons.forEach(btn => {
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('collapsed');
        }
        
        btn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('portfolio-language') || 'es';
            const isCollapsed = targetEl.classList.toggle('collapsed');
            if (isCollapsed) {
                if (currentLang === 'en') btn.textContent = 'View details';
                else if (currentLang === 'ca') btn.textContent = 'Veure detalls';
                else btn.textContent = 'Ver detalles';
            } else {
                if (currentLang === 'en') btn.textContent = 'Hide details';
                else if (currentLang === 'ca') btn.textContent = 'Ocultar detalls';
                else btn.textContent = 'Ocultar detalles';
            }
        });
    });

    // ==========================================
    // 7. BITÁCORA DINÁMICA (ENGINEERING LOG)
    // ==========================================
    const blogContainer = document.getElementById('blog-posts-container');
    
    function loadBlogPosts() {
        if (!blogContainer) return;
        const currentLang = localStorage.getItem('portfolio-language') || 'es';
        
        fetch('log_data.json')
            .then(res => res.json())
            .then(data => {
                renderBlogPosts(data, currentLang);
            })
            .catch(err => {
                console.warn('Fetch to log_data.json failed (typical in file:// access). Loading empty fallback state.');
                renderBlogPosts([], currentLang);
            });
    }

    function renderBlogPosts(posts, lang) {
        const blogLink = document.querySelector('a[href="#blog"]');
        const blogMenuItem = blogLink ? blogLink.closest('li') : null;
        const blogSection = document.getElementById('blog');
        
        // Hide completely if there are no posts in the JSON
        if (!posts || posts.length === 0) {
            if (blogMenuItem) blogMenuItem.style.display = 'none';
            if (blogSection) blogSection.style.display = 'none';
            return;
        }

        // Show section if there is at least one post
        if (blogMenuItem) blogMenuItem.style.display = '';
        if (blogSection) blogSection.style.display = '';

        let html = '';
        posts.slice(0, 3).forEach(post => {
            let title = post.titleEs;
            let summary = post.summaryEs;
            if (lang === 'en') {
                title = post.titleEn;
                summary = post.summaryEn;
            } else if (lang === 'ca') {
                title = post.titleCa || post.titleEs;
                summary = post.summaryCa || post.summaryEs;
            }
            
            html += `
                <article class="blog-post-card">
                    <div class="blog-post-header">
                        <span class="blog-post-category">${post.category}</span>
                        <time class="blog-post-date">${post.date}</time>
                    </div>
                    <h3 class="blog-post-title">${title}</h3>
                    <p class="blog-post-summary">${summary}</p>
                    <div class="blog-post-meta">
                        <span><i class="fa-regular fa-clock"></i> ${post.readTime} min</span>
                        <span><i class="fa-solid fa-code-commit"></i> Status: ${post.status}</span>
                    </div>
                </article>
            `;
        });
        blogContainer.innerHTML = html;
    }

    // ==========================================
    // 8. FORMULARIO DE CONTACTO SEGURO
    // ==========================================
    const contactForm = document.getElementById('contact-form-el');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameVal = document.getElementById('name').value.trim();
            const emailVal = document.getElementById('email').value.trim();
            const msgVal = document.getElementById('message').value.trim();
            
            if (!nameVal || !emailVal || !msgVal) {
                return;
            }
            
            // Safe mailto trigger (indicates client loading)
            const mailtoLink = `mailto:jrmelero@proton.me?subject=Contacto%20de%20${encodeURIComponent(nameVal)}&body=Nombre%3A%20${encodeURIComponent(nameVal)}%0ACorreo%3A%20${encodeURIComponent(emailVal)}%0A%0AMensaje%3A%0A${encodeURIComponent(msgVal)}`;
            window.location.href = mailtoLink;
        });
    }

    // ==========================================
    // 9. SISTEMA MULTI-IDIOMA (CON SELECTOR DROPDOWN & LOCALSTORAGE)
    // ==========================================
    const dropdownWrapper = document.getElementById('lang-dropdown-wrapper');
    const dropdownTrigger = document.getElementById('lang-dropdown-trigger');
    const dropdownMenu = document.getElementById('lang-dropdown-menu');
    const dropdownItems = document.querySelectorAll('.lang-dropdown-item');
    const currentLangText = document.getElementById('current-lang-text');

    const uiTranslations = {
        es: {
            "nav-inicio": "Inicio",
            "nav-about": "Sobre mí",
            "nav-projects": "Proyectos",
            "nav-experience": "Trayectoria",
            "nav-pcb": "Herramientas",
            "pcb-section-desc": "Herramientas y estimadores interactivos de ingeniería para desarrollo de hardware.",
            "nav-skills": "Habilidades",
            "nav-blog": "Bitácora",
            "nav-contact": "Contacto",
            "hero-badge": "Hardware · Diseño de PCB · Sistemas embebidos",
            "hero-sub1": "Ingeniero en Electrónica Industrial y Automática",
            "hero-sub2": "Especializado en diseño de PCB, sistemas embebidos y microelectrónica",
            "hero-desc": "Ingeniero de hardware especializado en diseño de PCB, sistemas embebidos, comunicaciones CAN y microelectrónica. Mi experiencia combina desarrollo electrónico, sistemas de almacenamiento de energía y coordinación técnica de equipos de ingeniería.",
            "hero-btn-projects": "<i class='fa-solid fa-layer-group'></i> Ver proyectos",
            "hero-btn-cv": "<i class='fa-solid fa-file-pdf'></i> Descargar CV",
            "hero-btn-vcard": "<i class='fa-solid fa-address-card'></i> Guardar contacto",
            "about-title": "Sobre mí",
            "about-p1": "Desde que tengo uso de razón, siempre he sentido una inmensa curiosidad por entender cómo funcionan las cosas, especialmente los aparatos electrónicos. Esta inquietud natural me llevó a estudiar Ingeniería Electrónica Industrial y Automática, descubriendo en el camino mi verdadera pasión: dar vida al hardware físico. Para mí, diseñar una placa de circuito impreso (PCB) o programar un sistema embebido no es solo un trabajo técnico; es un proceso creativo donde la teoría física se traduce en soluciones tangibles y operacionales.<br><br>Me apasiona enfrentarme a retos complejos de compatibilidad electromagnética (EMC), optimización de espacio y almacenamiento de energía, buscando siempre aprender nuevas tecnologías y metodologías para diseñar sistemas más eficientes, robustos y sostenibles. Fuera del laboratorio, disfruto colaborando con otros ingenieros en proyectos de competición (como MotoStudent) y compartiendo el conocimiento de ingeniería de hardware.",
            "feature-hw-title": "Hardware, PCB y microelectrónica",
            "feature-hw-desc": "Diseño de esquemas electrónicos, layout de PCB, prototipado, sistemas embebidos y formación en procesos de fabricación microelectrónica.",
            "feature-mgmt-title": "Dirección técnica y coordinación de equipos",
            "feature-mgmt-desc": "Planificación técnica, coordinación de equipos multidisciplinares, definición de roadmaps y aplicación de metodologías ágiles.",
            "projects-title": "Proyectos y casos de estudio",
            "projects-filter-all": "Todos",
            "projects-filter-hw": "PCBs / Hardware",
            "projects-filter-emb": "Sistemas Embebidos",
            "projects-filter-mgmt": "Gestión",
            "proj1-badge": "PCBs &amp; Hardware",
            "proj1-title": "Diseño de PCB para sistemas de baterías LiFePO₄",
            "proj1-desc": "Diseño de circuitos electrónicos a medida para módulos de almacenamiento de energía industriales, desarrollando circuitos electrónicos asociados a módulos de baterías LiFePO₄ personalizados.",
            "proj1-more": "Ver caso de estudio <i class='fa-solid fa-arrow-right'></i>",
            "proj2-badge": "Sistemas Embebidos",
            "proj2-title": "Integración de telemetría y adquisición de datos CAN Bus",
            "proj2-desc": "Desarrollo y montaje de la red de comunicación interna del vehículo utilizando centralitas, BMS Orion e Inversores bajo protocolo CAN Bus.",
            "proj2-more": "Ver caso de estudio <i class='fa-solid fa-arrow-right'></i>",
            "proj3-badge": "Mecánica &amp; Robótica",
            "proj3-title": "Desarrollo y diseño de brazo robótico",
            "proj3-desc": "Diseño mecánico en 3D, cálculos estructurales e impresión/mecanizado de un brazo robótico de investigación.",
            "proj3-more": "Ver caso de estudio <i class='fa-solid fa-arrow-right'></i>",
            "proj4-badge": "Gestión &amp; Equipos",
            "proj4-title": "E3Team MotoStudent Electric: desarrollo técnico y coordinación del equipo",
            "proj4-desc": "Coordinación técnica de un equipo de ingeniería multidisciplinar de más de 30 integrantes bajo metodologías ágiles.",
            "proj4-more": "Ver caso de estudio <i class='fa-solid fa-arrow-right'></i>",
            "exp-title": "Trayectoria",
            "traj-professional-title": "<i class='fa-solid fa-briefcase'></i> Experiencia profesional",
            "traj-academic-title": "<i class='fa-solid fa-graduation-cap'></i> Formación académica",
            "traj-competition-title": "<i class='fa-solid fa-motorcycle'></i> Competición y proyectos universitarios",
            "exp1-comp": "Ironwelding Barcelona",
            "exp1-title": "Diseñador de Hardware y Baterías I+D",
            "exp1-date": "Nov 2024 - Actualidad",
            "exp1-desc": "Diseño y desarrollo de esquemas electrónicos, layouts de PCB multicapa y sistemas de adquisición de datos (BMS) para packs de baterías de litio en aplicaciones industriales.",
            "exp1-b1": "<span>Diseño de PCBs:</span> Creación de circuitos electrónicos y placas de circuito impreso (PCBs) multicapa optimizadas para la gestión y balanceo de celdas utilizando <strong>Altium Designer</strong> y <strong>Proteus</strong>.",
            "exp1-b2": "<span>Estructura &amp; Montaje:</span> Modelado 3D de carcasas y soportes estructurales de baterías para garantizar la disipación térmica y protección mecánica ante vibraciones.",
            "exp1-b3": "<span>Gestión técnica:</span> Redacción de documentación de diseño técnico, especificaciones funcionales y planes de prueba de laboratorios para celdas electroquímicas.",
            "exp1b-comp": "Ironwelding Barcelona",
            "exp1b-title": "Técnico de Fabricación e Integración de Baterías",
            "exp1b-date": "Nov 2024 - Actualidad",
            "exp1b-desc": "Ensamblaje mecánico, soldadura por puntos de celdas de alta capacidad, cableado de potencia/señal y ensayos de validación eléctrica y seguridad térmica de battery packs.",
            "exp1b-b1": "<span>Interconexión de celdas:</span> Soldadura de alta precisión de pletinas de níquel para la interconexión de celdas LiFePO4 de alta capacidad y montaje de mazos de cables.",
            "exp1b-b2": "<span>Integración BMS:</span> Programación e integración física de sistemas BMS comerciales y sensores analógicos de temperatura y voltaje en el chasis.",
            "exp1b-b3": "<span>Ensayos y calidad:</span> Ensayos de ciclado, caracterización de celdas de litio, diagnóstico de fallos térmicos/eléctricos y control de calidad final de producción.",
            "exp3-comp": "Fundació Bosch i Gimpera",
            "exp3-title": "Desarrollador y diseñador de brazo robótico",
            "exp3-date": "Sep 2024 - Mar 2025",
            "exp3-desc": "Participación activa en el proyecto de investigación PRODUCTO (AGAUR 2023):",
            "exp3-b1": "Diseño y modelado 3D mecánico del brazo robótico, selección de materiales y cálculos estructurales de tolerancias con SolidWorks.",
            "exp3-b2": "Fabricación de prototipos funcionales mediante mecanizado e impresión 3D.",
            "exp3-b3": "Colaboración en el equipo científico de validación, experimentación y redacción de informes técnicos.",
            "exp2-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp2-title": "Máster en Ingeniería de Semiconductores y Diseño Microelectrónico",
            "exp2-date": "Sep 2025 - Jul 2026",
            "exp2-desc": "Especialidad en Ingeniería de Semiconductores y procesos de fabricación:",
            "exp2-b1": "Estudio en profundidad de los procesos de fabricación microelectrónica y física de dispositivos.",
            "exp2-b2": "Formación en fabricación microelectrónica y procesos de sala blanca (Cleanroom ISO 5), control ambiental y caracterización.",
            "exp2-b3": "Diseño y layout físico de circuitos integrados, análisis de fiabilidad, fotónica integrada, dispositivos de potencia y microsensores.",
            "exp6-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp6-title": "Grado en Ingeniería Electrónica Industrial y Automática",
            "exp6-date": "Sep 2021 - Jul 2025",
            "exp6-desc": "Formación de base en ingeniería (240 créditos ECTS):",
            "exp6-b1": "Proyectos de automatización con PLCs (TIA Portal/Siemens), SCADA, instrumentación y soldadura SMD.",
            "exp6-b2": "Programación en Arduino, Matlab, Python y simulaciones electromecánicas.",
            "exp6-b3": "Trabajo de Fin de Grado (TFG) enfocado en redes de adquisición de datos mediante CAN Bus en vehículos eléctricos de competición.",
            "exp6-tfg": "Ver TFG: Adquisición de Datos CAN Bus (UPCommons)",
            "edu3-title": "Bachillerato Científico-Tecnológico",
            "edu3-desc": "Formación preuniversitaria enfocada en ciencias de la ingeniería, matemáticas y física.",
            "exp4-comp": "E3Team EPSEVG (Motorsport)",
            "exp4-title": "Team Leader &amp; Product Owner",
            "exp4-date": "Sep 2023 – Sep 2025",
            "exp4-desc": "Coordinación técnica de un equipo multidisciplinar de más de 30 integrantes:",
            "exp4-b1": "Coordinación, planificación estratégica y asignación de tareas del equipo de MotoStudent Electric.",
            "exp4-b2": "Implementación de metodologías ágiles (Agile/Kanban) con Taiga y Trello para definir roadmaps de entrega.",
            "exp4-b3": "Supervisión técnica de la integración de componentes de hardware, firmware y sistemas estructurales.",
            "exp4-b4": "Obtención de la 4ª posición internacional en la fase final de la competición en MotorLand Aragón (septiembre de 2025).",
            "exp5-comp": "E3Team EPSEVG (Motorsport)",
            "exp5-title": "Desarrollador de Powertrain, Sistemas &amp; Operaciones",
            "exp5-date": "Sep 2021 - Sep 2023",
            "exp5-desc": "Desarrollo directo en el hardware eléctrico y de telemetria de la moto de competición:",
            "exp5-b1": "<span>Powertrain &amp; Baterías:</span> Ruteado de esquemas eléctricos de potencia, cableado de alta tensión, montaje del battery pack e integración del BMS Orion.",
            "exp5-b2": "<span>Sistemas &amp; ECUs:</span> Soldadura y montaje de PCBs personalizadas para centralitas, cableado de baja tensión y desarrollo lógico de display / telemetría CAN.",
            "exp5-b3": "<span>Operaciones:</span> Gestión técnica de patrocinadores corporativos, crowdfunding y organización interna.",
            "btn-more": "Ver detalles",
            "btn-less": "Ocultar detalles",
            "tool-title": "Estimador de impedancia microstrip",
            "tool-subtitle": "Una herramienta didáctica para explorar el stackup de capas y estimar la impedancia de una línea de transmisión tipo microstrip sobre un plano de referencia continuo.",
            "tool-legend-copper": "Cobre / pistas y planos — 35 µm",
            "tool-legend-prep": "Dieléctrico prepreg — espesor controlado",
            "tool-legend-subs": "Núcleo FR-4 / core — sustrato rígido",
            "tool-legend-gnd": "Plano de referencia GND — retorno de señal",
            "tool-calc-explanation": "Este cálculo estima una línea microstrip single-ended situada en la capa superior. La impedancia se calcula usando el ancho de pista (w), la altura del dieléctrico (h), la permitividad del material y el plano de referencia GND más cercano.",
            "tool-btn-copy": "<i class='fa-regular fa-copy'></i> Copiar resultado",
            "tool-btn-reset": "<i class='fa-solid fa-arrow-rotate-left'></i> Restablecer",
            "tool-lbl-w": "<i class='fa-solid fa-arrows-left-right'></i> Ancho de la Pista (w)",
            "tool-lbl-h": "<i class='fa-solid fa-arrows-up-down'></i> Altura del Dieléctrico (h)",
            "tool-lbl-mat": "<i class='fa-solid fa-microchip'></i> Material del Sustrato",
            "skills-title": "Habilidades técnicas",
            "skills-col1": "<span><i class='fa-solid fa-microchip'></i></span> Electrónica y diseño de PCB",
            "skills-col2": "<span><i class='fa-solid fa-code'></i></span> Sistemas embebidos y comunicaciones",
            "skills-col3": "<span><i class='fa-solid fa-atom'></i></span> Semiconductores y microelectrónica",
            "skills-col4": "<span><i class='fa-solid fa-users-gear'></i></span> Automatización y gestión técnica",
            "skill-schematic": "Diseño de esquemas",
            "skill-layout": "Layout y ruteado de PCB",
            "skill-sigcond": "Acondicionamiento de señal",
            "skill-proto": "Prototipado y soldadura",
            "skill-phys-semi": "Física de semiconductores",
            "skill-fab-micro": "Fabricación microelectrónica",
            "skill-cleanroom": "Procesos de sala blanca",
            "skill-micro-design": "Diseño microelectrónico",
            "skill-ic-layout": "Layout de circuitos integrados",
            "skill-char-rel": "Caracterización y fiabilidad",
            "skill-team-coord": "Coordinación de equipos",
            "skill-tech-plan": "Planificación técnica",
            "skill-data-acq": "Adquisición de datos",
            "skill-stm32": "STM32 (Práctica en proyectos)",
            "skill-esp32": "ESP32 (Práctica en proyectos)",
            "skill-arduino": "Arduino (Práctica en proyectos)",
            "skill-agile": "Metodologías Agile y Kanban",
            "blog-title": "Bitácora",
            "blog-subtitle": "Publicaciones técnicas, avances en proyectos y pruebas de laboratorio.",
            "blog-empty-state": "Todavía no hay publicaciones disponibles.",
            "contact-title": "¿Hablamos?",
            "contact-grid-title": "Información de Contacto",
            "contact-grid-desc": "Para oportunidades profesionales, colaboraciones técnicas o proyectos de electrónica, puedes contactar conmigo por correo, LinkedIn o WhatsApp.",
            "contact-whatsapp-btn": "Contactar por WhatsApp",
            "form-name": "Nombre",
            "form-name-ph": "Tu nombre",
            "form-email": "Correo Electrónico",
            "form-email-ph": "tu@correo.com",
            "form-message": "Mensaje",
            "form-message-ph": "¿En qué puedo ayudarte?",
            "form-btn": "<i class='fa-solid fa-paper-plane'></i> Enviar por correo",
            "form-notice": "Al continuar se abrirá tu aplicación de correo electrónico.",
            "form-privacy": "Los datos introducidos en este formulario se utilizarán únicamente para responder a tu mensaje.",
            "tool-edu-geom": "<i class='fa-solid fa-circle-info' style='color: var(--accent-cyan); margin-right: 6px;'></i> <strong>Geometría:</strong> Microstrip en línea de transmisión (Capa exterior de cobre sobre un plano de referencia de GND continuo).",
            "tool-edu-formula": "<strong>Grosor de cobre fijo:</strong> 35 µm (1 oz). Altura dieléctrica (h) y permitividad relativa (εr) del sustrato.",
            "tool-edu-valid": "<strong>Cálculo:</strong> Basado en el modelo analítico empírico para líneas de transmisión microstrip single-ended (no diferencial).",
            "tool-edu-disclaimer": "\"Los resultados son estimaciones orientativas. El diseño final debe validarse con el fabricante de PCB o mediante una herramienta de simulación electromagnética.\"",
            "footer-text": "© 2026 Jose Rodríguez Melero. <span style='display: inline-block;'>Portfolio profesional.</span>"
        },
        ca: {
            "nav-inicio": "Inici",
            "nav-about": "Sobre mi",
            "nav-projects": "Projectes",
            "nav-experience": "Trajectòria",
            "nav-pcb": "Eines",
            "pcb-section-desc": "Eines i utilitats interactives per a disseny de hardware.",
            "nav-skills": "Habilidades",
            "nav-blog": "Bitàcola",
            "nav-contact": "Contacte",
            "hero-badge": "Hardware · Disseny de PCB · Sistemes encastats",
            "hero-sub1": "Enginyer en Electrònica Industrial i Automàtica",
            "hero-sub2": "Especialitzat en disseny de PCB, sistemes encastats i microelectrònica",
            "hero-desc": "Enginyer de hardware especialitzat en disseny de PCB, sistemes encastats, comunicacions CAN i microelectrònica. La meva experiència combina desenvolupament de hardware, sistemes d'emmagatzematge d'energia i coordinació tècnica d'equips multidisciplinaris.",
            "hero-btn-projects": "<i class='fa-solid fa-layer-group'></i> Veure projectes",
            "hero-btn-cv": "<i class='fa-solid fa-file-pdf'></i> Descarregar el CV",
            "hero-btn-vcard": "<i class='fa-solid fa-address-card'></i> Desar el contacte",
            "about-title": "Sobre mi",
            "about-p1": "Des de que tinc ús de raó, sempre he sentit una immensa curiositat per entendre com funcionen les coses, especialment els aparells electrònics. Aquesta inquietud natural em va portar a estudiar Enginyeria Electrònica Industrial i Automàtica, descobrint en el camí la meva vertadera passió: donar vida al hardware físic. Per a mi, dissenyar una placa de circuit imprès (PCB) o programar un sistema encastat no és només un treball tècnic; és un procés creatiu on la teoria física es tradueix en solucions tangibles i operacionals.<br><br>Em apassiona enfrontar-me a reptes complexos de compatibilitat electromagnètica (EMC), optimització d'espai i emmagatzematge d'energia, buscant sempre aprendre noves tecnologies i metodologies per dissenyar sistemes més eficients, robustos i sostenibles. Fora del laboratori, gaudeixo col·laborant amb altres enginyers en projectes de competició (com MotoStudent) i compartint el coneixement d'enginyeria de hardware.",
            "feature-hw-title": "Hardware, PCB i microelectrònica",
            "feature-hw-desc": "Disseny d'esquemes electrònics, layout de PCB, prototipatge, sistemes encastats i formació en processos de fabricació microelectrònica.",
            "feature-mgmt-title": "Direcció tècnica i coordinació d'equips",
            "feature-mgmt-desc": "Planificació tècnica, coordinació d'equips multidisciplinaris, definició de roadmaps i aplicació de metodologies àgiles.",
            "projects-title": "Projectes i casos d'estudi",
            "projects-filter-all": "Tots",
            "projects-filter-hw": "PCBs / Hardware",
            "projects-filter-emb": "Sistemes Encastats",
            "projects-filter-mgmt": "Gestió",
            "proj1-badge": "PCBs &amp; Hardware",
            "proj1-title": "Disseny de PCB per a sistemes de bateries LiFePO₄",
            "proj1-desc": "Disseny de circuits electrònics a mida per a mòduls d'emmagatzematge d'energia industrials, desenvolupant circuits electrònics associats a mòduls de bateries LiFePO₄ personalitzats.",
            "proj1-more": "Veure cas d'estudi <i class='fa-solid fa-arrow-right'></i>",
            "proj2-badge": "Sistemes Encastats",
            "proj2-title": "Integració de telemetria i adquisició de dades CAN Bus",
            "proj2-desc": "Desenvolupament i muntatge de la xarxa de comunicació interna del vehicle utilitzant centraletes, BMS Orion i inversors sota protocol CAN Bus.",
            "proj2-more": "Veure cas d'estudi <i class='fa-solid fa-arrow-right'></i>",
            "proj3-badge": "Mecànica &amp; Robòtica",
            "proj3-title": "Desenvolupament i disseny de braç robòtic",
            "proj3-desc": "Disseny mecànic en 3D, càlculs estructurals i impressió/mecanitzat d'un braç robòtic d'investigació.",
            "proj3-more": "Veure cas d'estudi <i class='fa-solid fa-arrow-right'></i>",
            "proj4-badge": "Gestió &amp; Equips",
            "proj4-title": "E3Team MotoStudent Electric: desenvolupament tècnic i coordinació de l'equip",
            "proj4-desc": "Coordinació tècnica d'un equip d'enginyeria multidisciplinari de més de 30 integrants sota metodologies àgiles.",
            "proj4-more": "Veure cas d'estudi <i class='fa-solid fa-arrow-right'></i>",
            "exp-title": "Trajectòria",
            "traj-professional-title": "<i class='fa-solid fa-briefcase'></i> Experiència professional",
            "traj-academic-title": "<i class='fa-solid fa-graduation-cap'></i> Formació acadèmica",
            "traj-competition-title": "<i class='fa-solid fa-motorcycle'></i> Competició i projectes universitaris",
            "exp1-comp": "Ironwelding Barcelona",
            "exp1-title": "Dissenyador de Hardware i Bateries R+D",
            "exp1-date": "Nov 2024 - Actualitat",
            "exp1-desc": "Disseny i desenvolupament d'esquemes electrònics, layouts de PCB multicapa i sistemes d'adquisició de dades (BMS) per a packs de bateries de liti en aplicacions industrials.",
            "exp1-b1": "<span>Disseny de PCBs:</span> Creació de circuits electrònics i plaques de circuit imprès (PCBs) multicapa optimitzades per a la gestió i balanceig de cel·les utilitzant <strong>Altium Designer</strong> i <strong>Proteus</strong>.",
            "exp1-b2": "<span>Estructura i Muntatge:</span> Modelatge 3D de carcasses i suports estructurals de bateries per garantir la dissipació tèrmica i protecció mecànica davant vibracions.",
            "exp1-b3": "<span>Gestió tècnica:</span> Redacció de documentació de disseny tècnic, especificacions funcionals i plans de prova de laboratoris per a cel·les electroquímiques.",
            "exp1b-comp": "Ironwelding Barcelona",
            "exp1b-title": "Tècnic de Fabricació i Integració de Bateries",
            "exp1b-date": "Nov 2024 - Actualitat",
            "exp1b-desc": "Ensamblatge mecànic, soldadura per punts de cel·les d'alta capacitat, cablejat de potència/senyal i assajos de validació elèctrica i seguretat tèrmica de battery packs.",
            "exp1b-b1": "<span>Interconnexió de cel·les:</span> Soldadura d'alta precisió de pletines de níquel per a la interconnexió de cel·les LiFePO4 d'alta capacitat i muntatge de maços de cables.",
            "exp1b-b2": "<span>Integración BMS:</span> Programació i integració física de sistemes BMS comercials i sensors analògics de temperatura i voltatge en el xassís.",
            "exp1b-b3": "<span>Assajos i qualitat:</span> Assajos de ciclatge, caracterització de cel·les de liti, diagnòstic de fallades tèrmiques/elèctriques i control de qualitat final de producció.",
            "exp3-comp": "Fundació Bosch i Gimpera",
            "exp3-title": "Desenvolupador i dissenyador de braç robòtic",
            "exp3-date": "Set 2024 - Mar 2025",
            "exp3-desc": "Participació activa en el projecte d'investigació PRODUCTO (AGAUR 2023):",
            "exp3-b1": "Disseny mecànic i modelatge 3D del braç robòtic, selecció de materials i càlculs de toleràncies estructurals amb SolidWorks.",
            "exp3-b2": "Fabricació de prototips funcionals mitjançant mecanitzat i impressió 3D.",
            "exp3-b3": "Col·laboració en la validació experimental i redacció d'informes tècnics.",
            "exp2-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp2-title": "Màster en Enginyeria de Semiconductors i Disseny Microelectrònic",
            "exp2-date": "Set 2025 - Jul 2026",
            "exp2-desc": "Especialitat en Enginyeria de Semiconductors i processos de fabricació:",
            "exp2-b1": "Estudi en profunditat dels processos de fabricació microelectrònica i física de dispositius.",
            "exp2-b2": "Formació en fabricació microelectrònica i processos de sala blanca (Cleanroom ISO 5), control ambiental i seguretat.",
            "exp2-b3": "Disseny i layout físic de circuits integrats, anàlisi de fiabilitat, fotònica integrada, dispositius de potència i microsensors.",
            "exp6-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp6-title": "Grau en Enginyeria Electrònica Industrial i Automàtica",
            "exp6-date": "Set 2021 - Jul 2025",
            "exp6-desc": "Formació de base en enginyeria (240 crèdits ECTS):",
            "exp6-b1": "Projectes d'automatització amb PLCs (TIA Portal/Siemens), SCADA, instrumentació i soldadura SMD.",
            "exp6-b2": "Programació d'Arduino, Matlab, Python i simulacions electromecàniques.",
            "exp6-b3": "Treball de Fi de Grau (TFG) enfocat en xarxes d'adquisició de dades mitjançant CAN Bus en vehicles elèctrics de competició.",
            "exp6-tfg": "Veure TFG: Adquisició de Dades CAN Bus (UPCommons)",
            "edu3-title": "Batxillerat Cientificotecnològic",
            "edu3-desc": "Formació preuniversitària enfocada en ciències de l'enginyeria, matemàtiques i física.",
            "exp4-comp": "E3Team EPSEVG (Motorsport)",
            "exp4-title": "Team Leader &amp; Product Owner",
            "exp4-date": "Set 2023 – Set 2025",
            "exp4-desc": "Coordinació tècnica de l'equip multidisciplinari de MotoStudent Electric:",
            "exp4-b1": "Coordinació general, planificació i assignació de tasques de l'equip.",
            "exp4-b2": "Implementació de metodologies àgiles (Agile/Kanban) com a Taiga i Trello per definir roadmaps.",
            "exp4-b3": "Supervisió tècnica de la integració del hardware, programari i sistemes del prototip.",
            "exp5-comp": "E3Team EPSEVG (Motorsport)",
            "exp5-title": "Desenvolupador de Powertrain, Sistemes i Operacions",
            "exp5-date": "Set 2021 - Set 2023",
            "exp5-desc": "Desenvolupament en el hardware elèctric i de telemetria de la moto de competició:",
            "exp5-b1": "<span>Powertrain i Bateries:</span> Ruteig d'esquemes de potència, cablejat d'alta tensió, muntatge de battery pack i integració de BMS Orion.",
            "exp5-b2": "<span>Sistemes i ECUs:</span> Soldadura i muntatge de PCBs personalitzades per a centraletes, cableig de baixa tensió i lògica de telemetria CAN.",
            "exp5-b3": "<span>Operaciones:</span> Gestió de patrocinis corporatius, crowdfunding i logìstica de l'equip.",
            "btn-more": "Veure detalls",
            "btn-less": "Ocultar detalls",
            "tool-title": "Estimador d'impedància microstrip",
            "tool-subtitle": "Una eina didàctica per a explorar l'stackup de capes i estimar la impedància característica d'una línia de transmissió tipus microstrip sobre un pla de referència continu.",
            "tool-legend-copper": "Coure / pistes i plans — 35 µm",
            "tool-legend-prep": "Dielèctric prepreg — gruix controlat",
            "tool-legend-subs": "Nucli FR-4 / core — substrat rígid",
            "tool-legend-gnd": "Pla de referència GND — retorn de senyal",
            "tool-calc-explanation": "Aquest càlcul estima una línia microstrip single-ended situada a la capa superior. La impedància es calcula amb l’amplada de pista (w), l’altura del dielèctric (h), la permitivitat del material i el pla de referència GND més proper.",
            "tool-btn-copy": "<i class='fa-regular fa-copy'></i> Copiar resultat",
            "tool-btn-reset": "<i class='fa-solid fa-arrow-rotate-left'></i> Restablir",
            "tool-lbl-w": "<i class='fa-solid fa-arrows-left-right'></i> Amplada de la Pista (w)",
            "tool-lbl-h": "<i class='fa-solid fa-arrows-up-down'></i> Alçada del Dielèctric (h)",
            "tool-lbl-mat": "<i class='fa-solid fa-microchip'></i> Material del Sustrat",
            "skills-title": "Competències tècniques",
            "skills-col1": "<span><i class='fa-solid fa-microchip'></i></span> Electrònica i disseny de PCB",
            "skills-col2": "<span><i class='fa-solid fa-code'></i></span> Sistemes encastats i comunicacions",
            "skills-col3": "<span><i class='fa-solid fa-atom'></i></span> Semiconductors and microelectronics",
            "skills-col4": "<span><i class='fa-solid fa-users-gear'></i></span> Automatització i gestió tècnica",
            "skill-schematic": "Disseny d'esquemes",
            "skill-layout": "Layout i ruteig de PCB",
            "skill-sigcond": "Acondicionament de senyal",
            "skill-proto": "Prototipatge i soldadura",
            "skill-phys-semi": "Física de semiconductors",
            "skill-fab-micro": "Fabricació microelectrònica",
            "skill-cleanroom": "Processos de sala blanca",
            "skill-micro-design": "Disseny microelectrònic",
            "skill-ic-layout": "Layout de circuits integrats",
            "skill-char-rel": "Caracterització i fiabilitat",
            "skill-team-coord": "Coordinació d'equips",
            "skill-tech-plan": "Planificació tècnica",
            "skill-data-acq": "Adquisició de dades",
            "skill-stm32": "STM32 (Pràctica en projectes)",
            "skill-esp32": "ESP32 (Pràctica en projectes)",
            "skill-arduino": "Arduino (Pràctica en projectes)",
            "skill-agile": "Metodologies Agile i Kanban",
            "blog-title": "Bitàcola",
            "blog-subtitle": "Publicacions tècniques, avenços en projectes i proves de laboratori.",
            "blog-empty-state": "Encara no hi ha publicacions disponibles.",
            "contact-title": "Parlem?",
            "contact-grid-title": "Informació de Contacte",
            "contact-grid-desc": "Per a oportunitats professionals, col·laboracions tècniques o projectes d’electrònica, pots contactar amb mi per correu electrònic, LinkedIn o WhatsApp.",
            "contact-whatsapp-btn": "Contactar per WhatsApp",
            "form-name": "Nom",
            "form-name-ph": "El teu nom",
            "form-email": "Correu Electrònic",
            "form-email-ph": "tu@correu.com",
            "form-message": "Missatge",
            "form-message-ph": "En què et puc ajudar?",
            "form-btn": "<i class='fa-solid fa-paper-plane'></i> Enviar per correu",
            "form-notice": "Al continuar s'obrirà la teva aplicació de correu electrònic.",
            "form-privacy": "Les dades introduïdes en aquest formulari s'utilitzaran únicament per a respondre al teu missatge.",
            "tool-edu-geom": "<i class='fa-solid fa-circle-info' style='color: var(--accent-cyan); margin-right: 6px;'></i> <strong>Geometria:</strong> Microstrip en línia de transmissió (Capa exterior de coure sobre un planell de referència de GND continu).",
            "tool-edu-formula": "<strong>Gruix de coure fix:</strong> 35 µm (1 oz). Alçada dielèctrica (h) i permitivitat relativa (εr) del sustrat.",
            "tool-edu-valid": "<strong>Càlcul:</strong> Basat en el model analític empíric per a línies de transmissió microstrip single-ended (no diferencial).",
            "tool-edu-disclaimer": "\"Els resultats són estimacions orientatives. El disseny final s'ha de validar amb el fabricant de PCB o mitjançant una eina de simulació electromagnètica.\"",
            "footer-text": "© 2026 Jose Rodríguez Melero. <span style='display: inline-block;'>Portfoli professional.</span>"
        },
        en: {
            "nav-inicio": "Home",
            "nav-about": "About",
            "nav-projects": "Projects",
            "nav-experience": "Timeline",
            "nav-pcb": "Tools",
            "pcb-section-desc": "Interactive tools and engineering estimators for hardware development.",
            "nav-skills": "Skills",
            "nav-blog": "Engineering Log",
            "nav-contact": "Contact",
            "hero-badge": "Hardware · PCB Design · Embedded Systems",
            "hero-sub1": "Industrial Electronics and Automation Engineer",
            "hero-sub2": "Specialized in PCB Design, Embedded Systems and Microelectronics",
            "hero-desc": "Hardware engineer specialized in PCB design, embedded systems, CAN communications and microelectronics. My experience combines electronic development, energy storage systems and technical coordination of engineering teams.",
            "hero-btn-projects": "<i class='fa-solid fa-layer-group'></i> View projects",
            "hero-btn-cv": "<i class='fa-solid fa-file-pdf'></i> Download CV",
            "hero-btn-vcard": "<i class='fa-solid fa-address-card'></i> Save contact",
            "about-title": "About me",
            "about-p1": "For as long as I can remember, I have always felt an immense curiosity about how things work, especially electronic devices. This natural inquisitiveness led me to study Industrial Electronics and Automation Engineering, discovering my true passion along the way: bringing physical hardware to life. For me, designing a printed circuit board (PCB) or programming an embedded system is not just a technical task; it is a creative process where physical theory is translated into tangible, operational solutions.<br><br>I am passionate about tackling complex electromagnetic compatibility (EMC), space optimization, and energy storage challenges, always seeking to learn new technologies and methodologies to design more efficient, robust, and sustainable systems. Outside the lab, I enjoy collaborating with fellow engineers on racing team projects (such as MotoStudent) and sharing hardware engineering knowledge.",
            "feature-hw-title": "Hardware, PCB and Microelectronics",
            "feature-hw-desc": "Electronic schematic design, PCB layout, prototyping, embedded systems, and training in microelectronic fabrication processes.",
            "feature-mgmt-title": "Technical Direction and Team Coordination",
            "feature-mgmt-desc": "Technical planning, coordination of multidisciplinary teams, roadmap definition, and application of agile methodologies.",
            "projects-title": "Projects and Case Studies",
            "proj1-badge": "PCBs &amp; Hardware",
            "proj1-title": "PCB Design for LiFePO₄ Battery Systems",
            "proj1-desc": "Design of custom electronic circuits for industrial energy storage modules, developing electronic circuits associated with custom LiFePO₄ battery modules.",
            "proj1-more": "View case study <i class='fa-solid fa-arrow-right'></i>",
            "proj2-badge": "Embedded Systems",
            "proj2-title": "Telemetry Integration & CAN Bus Data Acquisition",
            "proj2-desc": "Real-time communication architecture and data logging inside the vehicle using ECU controllers, Orion BMS, and CAN networks.",
            "proj2-more": "View case study <i class='fa-solid fa-arrow-right'></i>",
            "proj3-badge": "Mechanics &amp; Robotics",
            "proj3-title": "Robotic Arm Design and Development",
            "proj3-desc": "Mechanical 3D CAD modeling, assembly tolerance calculations, and manufacturing prints of a scientific research robotic arm.",
            "proj3-more": "View case study <i class='fa-solid fa-arrow-right'></i>",
            "proj4-badge": "Management &amp; Teams",
            "proj4-title": "E3Team MotoStudent Electric: Technical Development & Team Coordination",
            "proj4-desc": "Technical coordination of a multidisciplinary engineering team of 30+ members under agile methodologies.",
            "proj4-more": "View case study <i class='fa-solid fa-arrow-right'></i>",
            "exp-title": "Timeline",
            "traj-professional-title": "<i class='fa-solid fa-briefcase'></i> Professional Experience",
            "traj-academic-title": "<i class='fa-solid fa-graduation-cap'></i> Academic Education",
            "traj-competition-title": "<i class='fa-solid fa-motorcycle'></i> Competition and University Projects",
            "exp1-comp": "Ironwelding Barcelona",
            "exp1-title": "Hardware & Battery R&D Designer",
            "exp1-date": "Nov 2024 - Present",
            "exp1-desc": "Design and development of electronic schematics, multilayer PCB layouts, and data acquisition systems (BMS) for custom lithium battery packs in industrial applications.",
            "exp1-b1": "<span>PCB Design:</span> Creating electronic circuits and multilayer printed circuit boards (PCBs) optimized for cell management and balancing using <strong>Altium Designer</strong> and <strong>Proteus</strong>.",
            "exp1-b2": "<span>Structure &amp; Assembly:</span> 3D CAD casing and mechanical bracket design to guarantee thermal dissipation and mechanical protection against vibrations.",
            "exp1-b3": "<span>Technical Management:</span> Authoring design documentation, technical specifications, and laboratory test plans for electrochemical cells.",
            "exp1b-comp": "Ironwelding Barcelona",
            "exp1b-title": "Battery Manufacturing & Integration Technician",
            "exp1b-date": "Nov 2024 - Present",
            "exp1b-desc": "Mechanical assembly, spot welding of high-capacity cells, power/signal wiring, and electrical validation and thermal safety testing of battery packs.",
            "exp1b-b1": "<span>Cell Interconnection:</span> High-precision nickel strip spot welding for high-capacity LiFePO4 cell connection and wire harness manufacturing.",
            "exp1b-b2": "<span>BMS Integration:</span> Programming and physical integration of commercial BMS units and analog temperature/voltage sensors in the chassis.",
            "exp1b-b3": "<span>Testing & Quality:</span> Cell characterization cycling tests, troubleshooting thermal/electrical faults, and final production quality control.",
            "exp3-comp": "Bosch i Gimpera Foundation",
            "exp3-title": "Robotic Arm Developer and Designer",
            "exp3-date": "Sep 2024 - Mar 2025",
            "exp3-desc": "Active team member inside PRODUCTO research project (AGAUR 2023):",
            "exp3-b1": "3D CAD mechanical modeling, assembly tolerance calculations, and structural layouts using SolidWorks.",
            "exp3-b2": "Fast functional prototyping using machining and 3D printing methods.",
            "exp3-b3": "Collaborating in validation tests and writing technical results.",
            "exp2-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp2-title": "Master's Degree in Semiconductor Engineering and Microelectronic Design",
            "exp2-date": "Sep 2025 - Jul 2026",
            "exp2-desc": "Semiconductor engineering specialization and microchip fabrication processes:",
            "exp2-b1": "In-depth study of physical microelectronic devices and wafer production.",
            "exp2-b2": "Training in microelectronic fabrication and cleanroom processes (Cleanroom ISO 5), environment particle monitoring, and safety.",
            "exp2-b3": "IC structural layout design, reliability analysis, power devices, microsensors, and silicon photonics.",
            "exp6-comp": "Universitat Politècnica de Catalunya (UPC)",
            "exp6-title": "Bachelor's Degree in Industrial Electronics &amp; Automation Engineering",
            "exp6-date": "Sep 2021 - Jul 2025",
            "exp6-desc": "Fundamental engineering core curriculum (240 ECTS credits):",
            "exp6-b1": "Industrial PLC automation projects (TIA Portal/Siemens), SCADA, instrumentation, and SMD soldering.",
            "exp6-b2": "Arduino logic development, Matlab control loops, Python scripting, and electromagnetic models.",
            "exp6-b3": "Bachelor's thesis (TFG) focused on CAN Bus data logging networks for electric motorsport vehicles.",
            "exp6-tfg": "View Thesis (TFG): CAN Bus Data Acquisition (UPCommons)",
            "edu3-title": "Scientific-Technological High School Degree",
            "edu3-desc": "Pre-university curriculum focusing on engineering sciences, advanced mathematics, and physics.",
            "exp4-comp": "E3Team EPSEVG (Motorsport)",
            "exp4-title": "Team Leader &amp; Product Owner",
            "exp4-date": "Sep 2023 – Sep 2025",
            "exp4-desc": "Technical coordination of a multidisciplinary team of 30+ members:",
            "exp4-b1": "Managing sprints, tasks, and scope definitions of the MotoStudent Electric team.",
            "exp4-b2": "Implementing Agile (Kanban) workflow in Taiga and Trello to track development roadmaps.",
            "exp4-b3": "Technical supervision of electrical, mechanical, and safety vehicle components integration.",
            "exp5-comp": "E3Team EPSEVG (Motorsport)",
            "exp5-title": "Powertrain, Systems &amp; Operations Developer",
            "exp5-date": "Sep 2021 - Sep 2023",
            "exp5-desc": "Direct technical electronics and powertrain design in the racing bike prototype:",
            "exp5-b1": "<span>Powertrain &amp; Batteries:</span> High voltage wiring, power distribution layouts, battery pack assembly, and Orion BMS configurations.",
            "exp5-b2": "<span>Systems &amp; ECUs:</span> Prototyping custom control boards, soldering, display dashboard layouts, and low voltage signal logging.",
            "exp5-b3": "<span>Operations:</span> Technical relations with sponsor entities, crowdfunding logistics, and public affairs.",
            "btn-more": "View details",
            "btn-less": "Hide details",
            "tool-title": "Microstrip Impedance Estimator",
            "tool-subtitle": "An educational tool to explore stackup layers and estimate the characteristic impedance of a single-ended microstrip trace.",
            "tool-legend-copper": "Copper / traces and planes — 35 µm",
            "tool-legend-prep": "Prepreg dielectric — controlled thickness",
            "tool-legend-subs": "FR-4 core — rigid substrate",
            "tool-legend-gnd": "GND reference plane — signal return",
            "tool-calc-explanation": "This estimator calculates a single-ended microstrip line on the top layer. The impedance is estimated using the trace width (w), dielectric height (h), material permittivity and the nearest GND reference plane.",
            "tool-btn-copy": "<i class='fa-regular fa-copy'></i> Copy results",
            "tool-btn-reset": "<i class='fa-solid fa-arrow-rotate-left'></i> Reset",
            "tool-lbl-w": "<i class='fa-solid fa-arrows-left-right'></i> Trace Width (w)",
            "tool-lbl-h": "<i class='fa-solid fa-arrows-up-down'></i> Dielectric Height (h)",
            "tool-lbl-mat": "<i class='fa-solid fa-microchip'></i> Substrate Material",
            "skills-title": "Technical skills",
            "skills-col1": "<span><i class='fa-solid fa-microchip'></i></span> Electronics and PCB design",
            "skills-col2": "<span><i class='fa-solid fa-code'></i></span> Embedded systems and communications",
            "skills-col3": "<span><i class='fa-solid fa-atom'></i></span> Semiconductors and microelectronics",
            "skills-col4": "<span><i class='fa-solid fa-users-gear'></i></span> Automation and technical management",
            "skill-schematic": "Schematic Capture / Design",
            "skill-layout": "PCB Layout and Routing",
            "skill-sigcond": "Signal Conditioning",
            "skill-proto": "Prototyping &amp; Soldering",
            "skill-phys-semi": "Semiconductor Physics",
            "skill-fab-micro": "Microelectronic Fabrication",
            "skill-cleanroom": "Cleanroom Processes",
            "skill-micro-design": "Microelectronic Design",
            "skill-ic-layout": "Integrated Circuit Layout",
            "skill-char-rel": "Characterization &amp; Reliability",
            "skill-team-coord": "Team Coordination",
            "skill-tech-plan": "Technical Planning",
            "skill-data-acq": "Data Acquisition",
            "skill-stm32": "STM32 (Hands-on experience)",
            "skill-esp32": "ESP32 (Hands-on experience)",
            "skill-arduino": "Arduino (Hands-on experience)",
            "skill-agile": "Agile and Kanban Methodologies",
            "blog-title": "Engineering Log",
            "blog-subtitle": "Technical posts, project developments, and laboratory testing logs.",
            "blog-empty-state": "No engineering log entries are available yet.",
            "contact-title": "Let's Connect",
            "contact-grid-title": "Contact Information",
            "contact-grid-desc": "For professional opportunities, technical collaborations or electronics projects, you can contact me by email, LinkedIn or WhatsApp.",
            "contact-whatsapp-btn": "Contact on WhatsApp",
            "form-name": "Name",
            "form-name-ph": "Your name",
            "form-email": "Email Address",
            "form-email-ph": "you@email.com",
            "form-message": "Message",
            "form-message-ph": "How can I help you?",
            "form-btn": "<i class='fa-solid fa-paper-plane'></i> Send by email",
            "form-notice": "Continuing will open your email application.",
            "form-privacy": "The data entered in this form will be used solely to respond to your message.",
            "tool-edu-geom": "<i class='fa-solid fa-circle-info' style='color: var(--accent-cyan); margin-right: 6px;'></i> <strong>Geometry:</strong> Microstrip transmission line (Outer copper trace over a continuous GND reference plane).",
            "tool-edu-formula": "<strong>Fixed copper thickness:</strong> 35 µm (1 oz). Dielectric height (h) and relative permittivity (εr) of the substrate.",
            "tool-edu-valid": "<strong>Calculation:</strong> Based on the empirical analytical model for single-ended microstrip transmission lines (not differential).",
            "tool-edu-disclaimer": "\"Results are guidelines only. The final design must be verified with the PCB manufacturer or using an electromagnetic simulation tool.\"",
            "footer-text": "© 2026 Jose Rodríguez Melero. <span style='display: inline-block;'>Professional portfolio.</span>"
        }
    };

    function translateUI(lang) {
        const data = uiTranslations[lang];
        if (!data) return;

        // Save selection in LocalStorage
        localStorage.setItem('portfolio-language', lang);
        document.documentElement.setAttribute('lang', lang);

        // Update trigger text and active status in menu
        let triggerText = 'ES';
        if (lang === 'en') triggerText = 'EN';
        if (lang === 'ca') triggerText = 'CA';
        
        if (currentLangText) {
            currentLangText.textContent = triggerText;
        }

        dropdownItems.forEach(item => {
            if (item.getAttribute('data-lang') === lang) {
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            }
        });

        // Loop through all elements with data-translate attribute
        const translateElements = document.querySelectorAll('[data-translate]');
        translateElements.forEach(el => {
            const key = el.getAttribute('data-translate');
            if (data[key]) {
                el.innerHTML = data[key];
            }
        });

        // Translate profile picture alt dynamically (accessibility)
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            let altText = 'Retrato profesional de Jose Rodríguez Melero.';
            if (lang === 'en') altText = 'Professional portrait of Jose Rodríguez Melero.';
            if (lang === 'ca') altText = 'Retrat professional de Jose Rodríguez Melero.';
            profileImg.setAttribute('alt', altText);
        }

        // Loop through all placeholder translation elements
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (data[key]) {
                el.setAttribute('placeholder', data[key]);
            }
        });

        // Update toggle details buttons texts depending on active collapsed class
        const toggleButtons = document.querySelectorAll('.btn-toggle-details');
        toggleButtons.forEach(btn => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const isCollapsed = targetEl.classList.contains('collapsed');
                if (isCollapsed) {
                    if (lang === 'en') btn.textContent = 'View details';
                    else if (lang === 'ca') btn.textContent = 'Veure detalls';
                    else btn.textContent = 'Ver detalles';
                } else {
                    if (lang === 'en') btn.textContent = 'Hide details';
                    else if (lang === 'ca') btn.textContent = 'Ocultar detalls';
                    else btn.textContent = 'Ocultar detalles';
                }
            }
        });

        // Recalculate/Re-render PCB layers to show current language descriptions
        renderStackup();
        
        // Reload blog posts to match language
        loadBlogPosts();
    }

    // ==========================================
    // 10. DROPDOWN LÓGICA DE INTERACCIÓN & ACCESIBILIDAD
    // ==========================================
    if (dropdownTrigger && dropdownMenu) {
        const toggleDropdown = (show) => {
            const isExpanded = show !== undefined ? show : (dropdownMenu.classList.contains('show') ? false : true);
            dropdownTrigger.setAttribute('aria-expanded', isExpanded);
            if (isExpanded) {
                dropdownMenu.classList.add('show');
            } else {
                dropdownMenu.classList.remove('show');
            }
        };

        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                const lang = item.getAttribute('data-lang');
                translateUI(lang);
                toggleDropdown(false);
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const lang = item.getAttribute('data-lang');
                    translateUI(lang);
                    toggleDropdown(false);
                    dropdownTrigger.focus();
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                toggleDropdown(false);
                dropdownTrigger.focus();
            }
        });

        // Close on clicking outside
            // Touch reset for stackup hovers
    document.addEventListener('touchstart', () => {
        if (pcbDiagram) {
            pcbDiagram.querySelectorAll('.pcb-layer').forEach(l => l.classList.remove('active-hover'));
            document.querySelectorAll('.stackup-legend span').forEach(el => {
                el.classList.remove('highlight-legend');
            });
        }
    });

document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                toggleDropdown(false);
            }
        });

        // Keyboard arrow navigation inside dropdown
        dropdownWrapper.addEventListener('keydown', (e) => {
            if (!dropdownMenu.classList.contains('show')) return;
            const items = Array.from(dropdownItems);
            const activeIndex = items.indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (activeIndex + 1) % items.length;
                items[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (activeIndex - 1 + items.length) % items.length;
                items[prevIndex].focus();
            }
        });
    }

    // Load initial language preference
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const savedLanguage = (urlLang === 'en' || urlLang === 'ca' || urlLang === 'es') ? urlLang : localStorage.getItem('portfolio-language');
    if (savedLanguage === 'en' || savedLanguage === 'ca' || savedLanguage === 'es') {
        translateUI(savedLanguage);
    } else {
        // Fallback to browser language
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('en')) {
            translateUI('en');
        } else if (userLang.startsWith('ca') || userLang.startsWith('val')) {
            translateUI('ca');
        } else {
            translateUI('es'); // Default is Spanish
        }
    }
});
