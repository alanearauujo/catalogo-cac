// ficheiro: api/videos.js

// Lista com os vídeos antigos do seu JSON para servir de histórico básico
const HISTORICO_VIDEOS = [
    { "id": "5k7pk272Lrw", "titulo": "Leon que ama a Nilce que ama... o Jaime?- Ep. 01", "data": "20131221", "tags": "" },
    { "id": "c4v9oPz4jbA", "titulo": "Uma mulher com furadeira. - Ep.02", "data": "20131222", "tags": "" },
    { "id": "q4scIucSftQ", "titulo": "Estante de Creeper. - Ep. 03", "data": "20131223", "tags": "" },
    { "id": "3nRaWyjNs_E", "titulo": "O LEON TEM CHULÉ ?!?! - Ep.04", "data": "20131225", "tags": "perguntas" },
    { "id": "XzRJ4rW7XKM", "titulo": "PERGUNTAS REVOLTADAS! - Ep. 500", "data": "20150612", "tags": "perguntas" },
    { "id": "zdev3uKvazE", "titulo": "CHEGAMOS NA POLÔNIA! - Ep. 1200", "data": "20200518", "tags": "polonia" },
    { "id": "cJBUCa2Cs_4", "titulo": "AVENTURA NA COREIA DO SUL - Ep. 1500", "data": "20230412", "tags": "coreia" },
    { "id": "fIMX6a1GZXM", "titulo": "PRIMEIRO DIA NO JAPÃO - Ep. 1600", "data": "20240115", "tags": "japao" },
    { "id": "bZX3OFQEQaY", "titulo": "O Bolo de Fubá Supremo - Ep. 1330", "data": "20210822", "tags": "talento supremo" },
    { "id": "yKzlitd_G0M", "titulo": "PROVANDO DOCES ESTRANHOS - Ep. 1410", "data": "20220910", "tags": "experimentando" }
    // Nota: Você pode manter uma cópia reduzida dos anos anteriores aqui para os botões antigos funcionarem!
];

const DICIONARIO_TAGS = {
    "XzRJ4rW7XKM": "perguntas",
    "zdev3uKvazE": "polonia",
    "cJBUCa2Cs_4": "coreia",
    "fIMX6a1GZXM": "japao",
    "bZX3OFQEQaY": "talento supremo",
    "yKzlitd_G0M": "experimentando",
    "0RH0x2SCQdQ": "estou com sorte",
    "dupMgZPwxtI": "estou com sorte"
};

export default async function handler(req, res) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    if (!API_KEY || !CHANNEL_ID) {
        return res.status(500).json({ erro: "Variáveis de ambiente ausentes." });
    }

    const PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU');
    const YOUTUBE_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const resposta = await fetch(YOUTUBE_URL);
        const dados = await resposta.json();

        let videosNovos = [];

        if (dados.items && dados.items.length > 0) {
            videosNovos = dados.items.map(item => {
                const idVideo = item.snippet?.resourceId?.videoId || "";
                
                let dataFormatada = "20260101"; 
                if (item.snippet && item.snippet.publishedAt) {
                    dataFormatada = item.snippet.publishedAt.substring(0, 10).replace(/-/g, '');
                }
                
                const tagAssociada = DICIONARIO_TAGS[idVideo] || "";

                return {
                    id: idVideo,
                    titulo: item.snippet?.title || "Vídeo sem Título",
                    data: String(dataFormatada),
                    tags: tagAssociada 
                };
            });
        }

        // JUNÇÃO: Combinamos os vídeos novos em tempo real com o histórico antigo
        const todosOsVideos = [...videosNovos, ...HISTORICO_VIDEOS];

        // Remove duplicados por ID caso o histórico tenha algum vídeo recente repetido
        const listaFinal = todosOsVideos.filter((v, index, self) =>
            index === self.findIndex((t) => t.id === v.id)
        );

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).json(listaFinal);

    } catch (erro) {
        return res.status(500).json({ erro: 'Falha na comunicação com o YouTube' });
    }
}