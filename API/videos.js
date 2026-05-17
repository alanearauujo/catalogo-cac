// ficheiro: api/videos.js

export default async function handler(req, res) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
    
    // Basta trocar o 'UC' do ID do canal por 'UU'.
    const PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU');
    const YOUTUBE_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const resposta = await fetch(YOUTUBE_URL);
        const dados = await resposta.json();

        if (!dados.items) {
            return res.status(500).json({ erro: "Não foi possível carregar os vídeos" });
        }


        const videosFormatados = dados.items.map(item => {
            // A data vem como 2026-03-31T..., vamos transformar em 20260331
            const dataCrua = item.snippet.publishedAt.substring(0, 10).replace(/-/g, '');
            
            return {
                id: item.snippet.resourceId.videoId,
                titulo: item.snippet.title,
                data: dataCrua,
                tags: "" // A pesquisa de playlist não traz as tags, mas a chave fica aqui para o script não quebrar
            };
        });

    
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(videosFormatados);

    } catch (erro) {
        res.status(500).json({ erro: 'Falha na comunicação com o YouTube' });
    }
}