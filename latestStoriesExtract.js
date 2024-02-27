const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/getTimeStories' && req.method === 'GET') {
        const options = {
            hostname: 'time.com',
            path: '/',
            method: 'GET',
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                const stories = extractStories(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stories));
            });
        });
        request.on('error', (error) => {
            console.error('Error fetching data:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch data from Time.com' }));
        });
        request.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function extractStories(html) {
    const stories = [];
    const regex = /<li class="latest-stories__item">\s*<a\s+href="([^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>\s*<\/a>/g;
    let match;

    while ((match = regex.exec(html)) !== null && stories.length < 6) {
        stories.push({
            title: match[2].trim(),
            link: match[1]
        });
    }
    return stories;
}
