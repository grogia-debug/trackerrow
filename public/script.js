let refreshInterval;

async function fetchStats() {
    try {
        const res = await fetch('/api/track');
        const data = await res.json();

        document.getElementById('totalVisitors').textContent = data.totalVisitors || 0;
        document.getElementById('totalData').textContent = data.totalData || 0;
        document.getElementById('totalSuccess').textContent = data.totalSuccess || 0;

        const container = document.getElementById('logContainer');
        if (data.logs && data.logs.length > 0) {
            container.innerHTML = data.logs.slice().reverse().map(log => {
                const loc = log.location
                    ? `${log.location.city || ''}, ${log.location.regionName || ''}`
                    : 'Tidak diketahui';
                return `
                    <div class="log-item">
                        <span class="time">${new Date(log.timestamp).toLocaleString()}</span>
                        <span class="ip">${log.ip}</span>
                        <span class="loc">📍 ${loc}</span>
                        ${log.payload ? `<span style="color:#6b5a4a;">| ${log.payload.screen || ''}</span>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p class="empty">Tunggu data datang...</p>';
        }
    } catch (e) {
        // silent
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    refreshInterval = setInterval(fetchStats, 3000); // refresh unggal 3 detik
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const input = document.getElementById('linkInput');
    input.select();
    navigator.clipboard?.writeText(input.value);
    alert('Link disalin!');
});
