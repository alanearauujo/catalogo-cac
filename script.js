var todosOsVideosGlobal = []; 
let debounceTimer;

const gradeDeVideos = document.getElementById("minha-grade");
const tituloPagina = document.getElementById("titulo-pagina");
const barraPesquisa = document.getElementById("barra-pesquisa");
const modal = document.getElementById("modal-player");
const iframe = document.getElementById("video-iframe");





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
        
        const resposta = await fetch('videos.json');
        atualizarLoader(30); 
        
        const dadosBrutos = await resposta.json();
        todosOsVideosGlobal = dadosBrutos.sort((a, b) => b.data.localeCompare(a.data));
        atualizarLoader(50); 


        
        if (document.getElementById("lista-anos-dropdown")) gerarBotoesDeAno();
        if (document.querySelector('.btn-quadro')) configurarFiltrosDeQuadros();
        if (document.getElementById("barra-pesquisa")) configurarBusca();
        if (document.getElementById("btn-anos-toggle")) configurarCliqueDropdown();
        
        atualizarLoader(75); 

        if (document.getElementById("minha-grade")) {
            
            if (localStorage.getItem("abrirCapsula") === "sim") {
                localStorage.removeItem("abrirCapsula");
                capsulaDoTempo();
            } else {
                const ultimoValor = localStorage.getItem("ultimoFiltroValor") || "2024";
                filtrarPorAno(ultimoValor);
            }
        }
        const vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
        if (document.getElementById("texto-contador")) atualizarContador();
        
        if (typeof verificarConquistas === "function") {
            verificarConquistas(vistos.length);
        }

        atualizarLoader(100); 

    } catch (erro) {
        console.warn("Página interna detectada: Algumas funções de grade foram ignoradas.");
        atualizarLoader(100); 
    } finally {
        
        const loader = document.getElementById("page-loader");
        if (loader) {
            
            setTimeout(() => {
                loader.classList.add("loader-hidden");
                setTimeout(() => { loader.style.display = "none"; }, 600);
            }, 800);
        }
    }
}


inicializarSite();

window.verificarConquistas = verificarConquistas;


function configurarCliqueDropdown() {
    const btnToggle = document.getElementById("btn-anos-toggle");
    const dropdownMenu = document.getElementById("lista-anos-dropdown");

    if (!btnToggle || !dropdownMenu) return;

    btnToggle.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.toggle("show");
    };

    window.onclick = (e) => {
        if (!dropdownMenu.contains(e.target) && e.target !== btnToggle) {
            dropdownMenu.classList.remove("show");
        }
    };
}


function toggleQuadros() {
    
    const container = document.getElementById('container-quadros'); 
    const textoBotao = document.getElementById('texto-botao');
    
    if (!container) return;

    container.classList.toggle('mostrar-tudo');
    
    
    if (container.classList.contains('mostrar-tudo')) {
        textoBotao.innerText = 'Mostrar menos';
    } else {
        textoBotao.innerText = 'Mostrar mais';
    }
}

function gerarBotoesDeAno() {
    const anosUnicos = [...new Set(todosOsVideosGlobal.map(v => v.data.substring(0, 4)))].sort((a, b) => b - a);
    const containerDropdown = document.getElementById("lista-anos-dropdown");
    if (!containerDropdown) return;

    containerDropdown.innerHTML = "";
    anosUnicos.forEach((ano) => {
        const btn = document.createElement("button");
        btn.innerText = ano;
        
        btn.onclick = () => {
            
            localStorage.setItem("ultimoFiltroTipo", "ano");
            localStorage.setItem("ultimoFiltroValor", ano);
            
            
            if (!document.getElementById("minha-grade")) {
                window.location.href = "index.html";
                return; 
            }
            
            
            filtrarPorAno(ano);
            
            
            containerDropdown.classList.remove("show");
            containerDropdown.classList.remove("show-mobile");
        };  
        
        containerDropdown.appendChild(btn);
    });
}


function modoMaratona() {
    const modalAviso = document.getElementById("modal-maratona-aviso");
    if (modalAviso) modalAviso.style.display = "block";
}

function fecharAvisoMaratona() {
    const modalAviso = document.getElementById("modal-maratona-aviso");
    if (modalAviso) modalAviso.style.display = "none";
}

function iniciarSorteioMaratona() {
    fecharAvisoMaratona();
    const vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
    let naoVistos = todosOsVideosGlobal.filter(v => !vistos.includes(v.id));
    let listaSorteio = naoVistos.length > 0 ? naoVistos : todosOsVideosGlobal;
    const sorteado = listaSorteio[Math.floor(Math.random() * listaSorteio.length)];
    abrirVideo(sorteado.id);
    tituloPagina.innerText = "🍿 Maratona: " + sorteado.titulo;
}


function atualizarContador() {
    const vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
    const total = todosOsVideosGlobal.length;
    const barra = document.getElementById("barra-progresso");
    const texto = document.getElementById("texto-contador");
    
    if (barra) {
        const percentagem = total > 0 ? (vistos.length / total) * 100 : 0;
        barra.style.width = percentagem + "%";
    }
    if (texto) texto.innerText = `${vistos.length} / ${total} vídeos assistidos`;
    
    
    verificarConquistas(vistos.length);
}

function verificarConquistas(quantidade) {
    const containerIndex = document.getElementById("badges-container");
    const containerStats = document.getElementById("lista-medalhas-completa");
    
    if (!containerIndex && !containerStats) return;

    const conquistas = [
        { min: 1, label: "🐣 Iniciante", desc: "Sua jornada começou!" },
        { min: 50, label: "🗝️ Explorador", desc: "Você já conhece os atalhos." },
        { min: 500, label: "🎫 Fã de Elite", desc: "Presença garantida nos quadros." },
        { min: 1000, label: "🏆 Maratonista", desc: "Respeito total pela história." },
        { min: 1700, label: "👑 Mestre da Chave", desc: "Você viu praticamente tudo!" }
    ];

    let htmlMedalhas = "";

    conquistas.forEach(c => {
        const conquistada = quantidade >= c.min;
        if (containerStats) {
            
            htmlMedalhas += `
                <div class="medal-item ${conquistada ? 'ganha' : 'bloqueada'}">
                    <div class="medal-icon">${c.label.split(' ')[0]}</div>
                    <div class="medal-info">
                        <strong>${c.label.split(' ').slice(1).join(' ')}</strong>
                        <p>${conquistada ? c.desc : 'Continue assistindo para liberar'}</p>
                    </div>
                </div>`;
        } else if (containerIndex && conquistada) {
            
            htmlMedalhas += `<span class="badge-mini">${c.label}</span>`;
        }
    });

    if (containerStats) containerStats.innerHTML = htmlMedalhas;
    if (containerIndex) containerIndex.innerHTML = htmlMedalhas;
}

function alternarVisto(id) {
    let vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
    vistos = vistos.includes(id) ? vistos.filter(v => v !== id) : [...vistos, id];
    localStorage.setItem("videosVistos", JSON.stringify(vistos));
    
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.classList.toggle("visto", vistos.includes(id));
        card.querySelector(".btn-visto").innerText = vistos.includes(id) ? "✓ Visto" : "Marcar visto";
    }
    atualizarContador();
}


function filtrarPorAno(anoAlvo) {
    const filtrados = todosOsVideosGlobal.filter(v => v.data.startsWith(anoAlvo));
    carregarAno(filtrados, anoAlvo);
}

function carregarAno(listaDeVideos, titulo) {
    tituloPagina.innerText = titulo;
    const vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
    gradeDeVideos.innerHTML = ""; 
    listaDeVideos.forEach(video => {
        const jaVisto = vistos.includes(video.id);
        const card = document.createElement("div");
        card.className = `video-card ${jaVisto ? "visto" : ""}`;
        card.id = `card-${video.id}`;
        card.innerHTML = `
            <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" onclick="abrirVideo('${video.id}')">
            <div class="video-info">
                <h3 onclick="abrirVideo('${video.id}')">${video.titulo}</h3>
                <p>${video.data.substring(6,8)}/${video.data.substring(4,6)}/${video.data.substring(0,4)}</p>
                <button class="btn-visto" onclick="alternarVisto('${video.id}')">${jaVisto ? "✓ Visto" : "Marcar visto"}</button>
            </div>`;
        gradeDeVideos.appendChild(card);
    });
}

function abrirVideo(id) {
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    modal.style.display = "flex";
    

    const btnVistoModal = document.getElementById("btn-visto-modal");
    if (btnVistoModal) {
        const atualizarBotaoModal = () => {
            const vistos = JSON.parse(localStorage.getItem("videosVistos")) || [];
            if (vistos.includes(id)) {
                btnVistoModal.classList.add("sucesso");
                btnVistoModal.innerHTML = "🚀 Vídeo Assistido!";
            } else {
                btnVistoModal.style.background = "#f1f1f1";
                btnVistoModal.innerHTML = "✅ Marcar como visto";
            }
        };
        atualizarBotaoModal();
        btnVistoModal.onclick = () => {
            alternarVisto(id); 
            atualizarBotaoModal(); 
        };
    }
}


const btnCloseModal = document.querySelector(".close-modal");
if (btnCloseModal) { 
    btnCloseModal.onclick = () => { 
        if (modal) modal.style.display = "none"; 
        if (iframe) iframe.src = ""; 
    };
}

function configurarBusca() {
    if (!barraPesquisa) return;
    barraPesquisa.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const termo = normalizarTexto(barraPesquisa.value.trim());
            if (termo.length > 0) {
                const filtrados = todosOsVideosGlobal.filter(v => normalizarTexto(v.titulo).includes(termo));
                carregarAno(filtrados, `Busca: ${barraPesquisa.value}`);
            } else {
                filtrarPorAno(localStorage.getItem("ultimoFiltroValor") || "2024");
            }
        }, 300);
    };
}

function normalizarTexto(texto) { return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; }

function configurarFiltrosDeQuadros() {
    document.querySelectorAll('.btn-quadro').forEach(btn => {
        btn.onclick = () => {
            const quadro = btn.getAttribute('data-quadro');
            localStorage.setItem("ultimoFiltroTipo", "quadro");
            localStorage.setItem("ultimoFiltroValor", quadro);
            localStorage.setItem("ultimoTituloFiltro", btn.innerText);
            const filtrados = todosOsVideosGlobal.filter(v => normalizarTexto(v.titulo).includes(normalizarTexto(quadro)));
            carregarAno(filtrados, btn.innerText);
        };
    });
}

function capsulaDoTempo() {
    if (!document.getElementById("minha-grade")) {
        localStorage.setItem("abrirCapsula", "sim");
        window.location.href = "index.html";
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


const btnAnosMobile = document.getElementById('btn-anos-toggle');
const listaAnosMobile = document.getElementById('lista-anos-dropdown');

if (btnAnosMobile) {
    btnAnosMobile.onclick = function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault(); 
            listaAnosMobile.classList.toggle('show-mobile');
        }
    };
}