const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4321,
    path: '/api/calendar/schedule',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { console.log(data); });
});

req.on('error', (e) => { console.error(e); });
req.write(JSON.stringify({ date: '2026-03-05', time: '10:00', leadDetails: {ingresos: 'mas_10m'} }));
req.end();
