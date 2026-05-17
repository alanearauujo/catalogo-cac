// ficheiro: api/videos.js
const DICIONARIO_TAGS = {
    "XzRJ4rW7XKM": "perguntas",
    "xHPrzTRfpzI": "perguntas",
    "Vtbo15ArO8A": "atlanta",
    "lZK6gswH_Ew": "atlanta",
    "Gc4LC1J5cxo": "atlanta",
    "zdev3uKvazE": "polonia",
    "NQsM9ISJpbM": "polonia",
    "wjucI8ejQSY": "polonia",
    "3n9fZoFbBqg": "polonia",
    "nMet2VAsXZ4": "polonia",
    "0SalIkvyoyY": "polonia",
    "vn88oRN_1t8": "polonia",
    "5-f0jPtJZL4": "polonia",
    "Sh7DnZ_xkx8": "polonia",
    "1z8Q7i6NHb8": "polonia",
    "bkoEqVw6Kq0": "talento supremo", // Ep. 458 - O Talento Supremo
    "bZX3OFQEQaY": "talento supremo", // Ep. 1330 - O Bolo de Fubá Supremo
    "yKzlitd_G0M": "experimentando",
    "6ISSZggbr2g": "experimentando", // Nota: Mapeado com base no histórico
    "4-vBdosW9Ww": "coreia",
    "4fPeJTEicnw": "coreia",
    "cJBUCa2Cs_4": "coreia",
    "rMQyviurUoA": "coreia",
    "7PFFIUP-f24": "coreia",
    "EqQ134J62So": "coreia",
    "W3VzmduBmA4": "coreia",
    "fIMX6a1GZXM": "japao",
    "kbQgryzOfDo": "japao",
    "kko1HDqxrZ0": "japao",
    "7AzX0V9Xm8k": "japao",
    "IEnVcpDOk80": "japao",
    "Pa5FIvOS7rE": "japao",
    "ub9QxjXH8PE": "japao",
    "nh6k015yW_o": "japao",
    "5w4TeaR-Hps": "japao",
    "6HzFiA1d0QM": "vportugal",
    "deEPPVmjhdw": "vportugal",
    "eM0WOPoTDPI": "vportugal",
    "xm4JgR84sTg": "experimentando",
    "tl-KtDDEXFo": "experimentando",
    "bEaFVwgafrQ": "experimentando",
    "TGB7GM6ZSJM": "experimentando",
    "oVCkAVlwYk4": "grecia/turquia",
    "qdAE-eFae4c": "experimentando",
    "3M6txy-18Ds": "grecia/turquia",
    "YBXNGvzyjVA": "experimentando",
    "6aC13XZmssE": "grecia/turquia",
    "hVLbVxKACF4": "grecia/turquia",
    "BelNuxNZQQg": "experimentando",
    "mUfneDlRV08": "grecia/turquia",
    "iHQBHPBHRhQ": "experimentando",
    "zUCdWwYIl9c": "taiwan",
    "zoxlf28ftfs": "taiwan",
    "SiQ5FM3fIGY": "taiwan",
    "9l5v_xFzIxY": "experimentando",
    "4XKrRHtE8lA": "taiwan",
    "_nrXKsvlgug": "experimentando",
    "O4NxREZQuXg": "experimentando",
    "Rh1NUu1fEhU": "experimentando",
    "vhe5uM7A2rM": "experimentando",
    "FRFj2KmHZB0": "grecia/turquia",
    "_2nH1erU7pw": "grecia/turquia",
    "48ceqFqoH_0": "experimentando",
    "0RH0x2SCQdQ": "estou com sorte",
    "_Gvd61CF03k": "experimentando",
    "mDN0CWYkdvE": "estou com sorte",
    "TM75qj0RDus": "estou com sorte"
};

export default async function handler(req, res) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
    const PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU');
    const YOUTUBE_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const resposta = await fetch(YOUTUBE_URL);
        const dados = await resposta.json();

        if (!dados.items) {
            return res.status(500).json({ erro: "Não foi possível carregar os vídeos do YouTube." });
        }

        const videosFormatados = dados.items.map(item => {
            const idVideo = item.snippet.resourceId.videoId;
            const dataCrua = item.snippet.publishedAt.substring(0, 10).replace(/-/g, '');
            
            // Injeta a tag mapeada caso o ID do vídeo esteja no nosso dicionário
            const tagAssociada = DICIONARIO_TAGS[idVideo] || "";

            return {
                id: idVideo,
                titulo: item.snippet.title,
                data: dataCrua,
                tags: tagAssociada 
            };
        });

        // Configuração de cache para 1 hora no Vercel para carregar instantaneamente
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(videosFormatados);

    } catch (erro) {
        res.status(500).json({ erro: 'Falha na comunicação com o YouTube' });
    }
}