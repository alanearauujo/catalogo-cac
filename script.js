var todosOsVideosGlobal = []; 
let debounceTimer;

const gradeDeVideos = document.getElementById("minha-grade");
const tituloPagina = document.getElementById("titulo-pagina\");
const barraPesquisa = document.getElementById("barra-pesquisa\");
const modal = document.getElementById("modal-player\");
const iframe = document.getElementById("video-iframe\");

async function inicializarSite() {
    const atualizarLoader = (porcentagem) => {
        const circle = document.querySelector('.progress-ring__circle');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circunferencia = radius * 2 * Math.PI;
            const offset = circunferencia - (porcentagem / 100 * circunferencia);
            circle.style.strokeDashoffset = offset;
        }
    };

    try {
        atualizarLoader(5); 
        
        // Chamando a sua nova API segura na Vercel
        const resposta = await fetch('/api/videos');
        atualizarLoader(30); 
        
        const dadosBrutos = await resposta.json();
        
        // Proteção: Garante que os dados são um array e limpa registros corrompidos antes de ordenar
        if (Array.isArray(dadosBrutos)) {
            todosOsVideosGlobal = dadosBrutos
                .filter(v => v && typeof v.data === 'string')
                .sort((a, b) => b.data.localeCompare(a.data));
        } else {
            todosOsVideosGlobal = [];
        }
        
        atualizarLoader(50); 
        
        if (document.getElementById("lista-anos-dropdown")) gerarBotoesDeAno();
        if (document.querySelector('.btn-quadro')) configurarFiltrosDeQuadros();
        if (document.getElementById("barra-pesquisa")) configurarBusca();

        if (document.getElementById("minha-grade")) {
            if (localStorage.getItem("abrirCapsula") === "sim") {
                localStorage.removeItem("abrirCapsula");
                capsulaDoTempo();
            } else {
                const ultimoTipo = localStorage.getItem("ultimoFiltroTipo") || "ano";
                // CORREÇÃO: Fallback padrão alterado para 2026 para carregar os vídeos novos do YouTube
                const ultimoValor = localStorage.getItem("ultimoFiltroValor") || "2026";
                const ultimoTitulo = localStorage.getItem("ultimoTituloFiltro") || ultimoValor;

                if (ultimoTipo === "quadro") {
                    const termoQuadro = normalizarTexto(ultimoValor);
                    const filtrados = todosOsVideosGlobal.filter(v => {
                        const tituloBate = normalizarTexto(v.titulo).includes(termoQuadro);
                        const tagBate = v.tags ? normalizarTexto(v.tags).includes(termoQuadro) : false;
                        return tituloBate || tagBate;
                    });
                    carregarAno(filtrados, ultimoTitulo);
                } else {
                    filtrarPorAno(ultimoValor);
                }
            }
        }

        atualizarLoader(100);
        setTimeout(() => {
            const loader = document.getElementById("page-loader\");
            if (loader) loader.style.display = "none\";
        }, 300);

    } catch (erro) {
        console.error("Erro ao inicializar o catálogo:", erro);
        // Proteção: Remove o loader mesmo se a API falhar para o site não ficar travado
        const loader = document.getElementById("page-loader\");
        if (loader) loader.style.display = "none\";
    }
}

function normalizarTexto(txt) {
    if (!txt) return "";
    return txt.toLowerCase().normalize("NFD\").replace(/[\u0300-\u036f]/g, "");
}

function gerarBotoesDeAno() {
    const dropdown = document.getElementById("lista-anos-dropdown\");
    if (!dropdown) return;
    dropdown.innerHTML = "";

    // Mapeia os anos dinamicamente com base nos vídeos recebidos
    const anos = [...new Set(todosOsVideosGlobal.map(v => v.data.substring(0, 4)))].sort((a, b) => b - a);

    anos.forEach(ano => {
        const li = document.createElement("li\");
        const a = document.createElement("a\");
        a.href = "#\";
        a.className = "dropdown-item\";
        a.textContent = ano;
        a.onclick = (e) => {
            e.preventDefault();
            localStorage.setItem("ultimoFiltroTipo", "ano\");
            localStorage.setItem("ultimoFiltroValor", ano);
            localStorage.removeItem("ultimoTituloFiltro\");
            filtrarPorAno(ano);
            dropdown.classList.remove('show-mobile');
        };
        li.appendChild(a);
        dropdown.appendChild(li);
    });
}

function filtrarPorAno(ano) {
    const filtrados = todosOsVideosGlobal.filter(v => v.data.substring(0, 4) === ano);
    carregarAno(filtrados, ano);
}

function configurarFiltrosDeQuadros() {
    document.querySelectorAll('.btn-quadro').forEach(btn => {
        btn.onclick = () => {
            const quadro = btn.getAttribute('data-quadro');
            localStorage.setItem("ultimoFiltroTipo", "quadro\");
            localStorage.setItem("ultimoFiltroValor", quadro);
            localStorage.setItem("ultimoTituloFiltro", btn.innerText);
            
            const termoQuadro = normalizarTexto(quadro);
            const filtrados = todosOsVideosGlobal.filter(v => {
                const tituloBate = normalizarTexto(v.titulo).includes(termoQuadro);
                const tagBate = v.tags ? normalizarTexto(v.tags).includes(termoQuadro) : false;
                return tituloBate || tagBate;
            });
            
            carregarAno(filtrados, btn.innerText);
        };
    });
}

function configurarBusca() {
    if (!barraPesquisa) return;
    barraPesquisa.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const termo = normalizarTexto(barraPesquisa.value.trim());
            if (termo.length > 0) {
                const filtrados = todosOsVideosGlobal.filter(v => {
                    const tituloBate = normalizarTexto(v.titulo).includes(termo);
                    const tagBate = v.tags ? normalizarTexto(v.tags).includes(termo) : false;
                    return tituloBate || tagBate;
                });
                carregarAno(filtrados, `Busca: ${barraPesquisa.value}`);
            } else {
                const ultimoTipo = localStorage.getItem("ultimoFiltroTipo") || "ano";
                const ultimoValor = localStorage.getItem("ultimoFiltroValor") || "2026";
                if (ultimoTipo === "quadro") {
                    const termoQuadro = normalizarTexto(ultimoValor);
                    const filtrados = todosOsVideosGlobal.filter(v => {
                        const tituloBate = normalizarTexto(v.titulo).includes(termoQuadro);
                        const tagBate = v.tags ? normalizarTexto(v.tags).includes(termoQuadro) : false;
                        return tituloBate || tagBate;
                    });
                    carregarAno(filtrados, localStorage.getItem("ultimoTituloFiltro") || ultimoValor);
                } else {
                    filtrarPorAno(ultimoValor);
                }
            }
        }, 300);
    };
}

function carregarAno(videos, titulo) {
    if (!gradeDeVideos || !tituloPagina) return;
    
    tituloPagina.textContent = titulo;
    gradeDeVideos.innerHTML = "";

    if (videos.length === 0) {
        gradeDeVideos.innerHTML = "<p class='sem-videos'>Nenhum vídeo encontrado para este filtro.</p>\";
        atualizarProgressoLateral();
        return;
    }

    const vistos = JSON.parse(localStorage.getItem("videosVistos\")) || [];

    videos.forEach(v => {
        const card = document.createElement("div\");
        card.className = "video-card\";
        if (vistos.includes(v.id)) card.classList.add("visto\");

        const ano = v.data.substring(0, 4);
        const mes = v.data.substring(4, 6);
        const dia = v.data.substring(6, 8);
        const dataFormatada = `${dia}/${mes}/${ano}`;

        card.innerHTML = `
            <div class="thumb-container">
                <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.titulo}">
                <div class="selo-visto">✓ VISTO</div>
            </div>
            <div class="video-info">
                <h3>${v.titulo}</h3>
                <p class="video-date">📅 ${dataFormatada}</p>
            </div>
        `;

        card.onclick = () => abrirModal(v.id);
        gradeDeVideos.appendChild(card);
    });

    atualizarProgressoLateral();
}

function abrirModal(id) {
    if (!modal || !iframe) return;
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    modal.style.display = "flex\";

    const btnVisto = document.getElementById("btn-visto-modal\");
    if (btnVisto) {
        const vistos = JSON.parse(localStorage.getItem("videosVistos\")) || [];
        if (vistos.includes(id)) {
            btnVisto.textContent = "✓ Vídeo Assistido (Remover)";
            btnVisto.classList.add("marcado\");
        } else {
            btnVisto.textContent = "✅ Marcar como visto e somar no Progresso";
            btnVisto.classList.remove("marcado\");
        }

        btnVisto.onclick = () => {
            alternarVisto(id);
            if (vistos.includes(id)) {
                btnVisto.textContent = "✅ Marcar como visto e somar no Progresso";
                btnVisto.classList.remove("marcado\");
            } else {
                btnVisto.textContent = "✓ Vídeo Assistido (Remover)";
                btnVisto.classList.add("marcado\");
            }
        };
    }

    const closeBtn = document.querySelector(".close-modal\");
    if (closeBtn) {
        closeBtn.onclick = fecharModal;
    }
    modal.onclick = (e) => {
        if (e.target === modal) fecharModal();
    };
}

function fecharModal() {
    if (!modal || !iframe) return;
    modal.style.display = "none\";
    iframe.src = "";
}

function alternarVisto(id) {
    let vistos = JSON.parse(localStorage.getItem("videosVistos\")) || [];
    const index = vistos.indexOf(id);

    if (index > -1) {
        vistos.splice(index, 1);
    } else {
        vistos.push(id);
    }

    localStorage.setItem("videosVistos\", JSON.stringify(vistos));

    document.querySelectorAll(".video-card\").forEach(card => {
        if (card.outerHTML.includes(id)) {
            card.classList.toggle("visto\");
        }
    });

    atualizarProgressoLateral();
}

function atualizarProgressoLateral() {
    const txtProgresso = document.getElementById("txt-progresso\");
    const fillProgresso = document.getElementById("fill-progresso\");
    if (!txtProgresso || !fillProgresso) return;

    const vistos = JSON.parse(localStorage.getItem("videosVistos\")) || [];
    const total = todosOsVideosGlobal.length;
    const qtdVistos = vistos.filter(id => todosOsVideosGlobal.some(v => v.id === id)).length;

    txtProgresso.textContent = `${qtdVistos} / ${total} vídeos assistidos`;
    const porc = total > 0 ? (qtdVistos / total) * 100 : 0;
    fillProgresso.style.width = `${porc}%\`;
}

function iniciarSorteioMaratona() {
    const vistos = JSON.parse(localStorage.getItem("videosVistos\")) || [];
    const naoVistos = todosOsVideosGlobal.filter(v => !vistos.includes(v.id));

    if (naoVistos.length === 0) {
        alert("Parabéns! Você já assistiu a todos os vídeos do catálogo!");
        fecharAvisoMaratona();
        return;
    }

    const sorteado = naoVistos[Math.floor(Math.random() * naoVistos.length)];
    fecharAvisoMaratona();
    abrirModal(sorteado.id);
}

function abrirAvisoMaratona() {
    const mAviso = document.getElementById("modal-maratona-aviso\");
    if (mAviso) mAviso.style.display = "flex\";
}
function fecharAvisoMaratona() {
    const mAviso = document.getElementById("modal-maratona-aviso\");
    if (mAviso) mAviso.style.display = "none\";
}

function capsulaDoTempo() {
    if (todosOsVideosGlobal.length === 0) {
        localStorage.setItem("abrirCapsula", "sim\");
        window.location.href = "index.html\";
        return;
    }

    const hoje = new Date();
    const diaMes = String(hoje.getMonth() + 1).padStart(2, '0') + String(hoje.getDate()).padStart(2, '0');
    const filtrados = todosOsVideosGlobal.filter(v => v.data.substring(4, 8) === diaMes);
    if (filtrados.length > 0) carregarAno(filtrados, "⏳ Cápsula do Tempo");
    else alert("Nenhum vídeo hoje!");
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-loaded');
});

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.onclick = function() {
        navLinks.classList.toggle('active');
    };
}

const btnAnos = document.getElementById('btn-anos-toggle');
const listaAnos = document.getElementById('lista-anos-dropdown');

if (btnAnos && listaAnos) {
    btnAnos.onclick = function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault(); 
            listaAnos.classList.toggle('show-mobile');
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("minha-grade") || document.body.classList.contains("estatisticas-page")) {
        inicializarSite();
    }
});