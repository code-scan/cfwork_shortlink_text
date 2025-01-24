const admin_path = '/short_link_admin'
const api_path = '/short_api'
const url_key = 'orgi_url' // original url key
const url_name = 'short_code' // short code  key
const short_url_key = 'short_url'; // full short url
const expire_key = 'expire_time'; // expire time key
const password_key = 'password'; // password key

// Get current date in Shanghai timezone (YYYYMMDD)
function getCurrentDate() {
    const now = new Date();
    const shanghaiOffset = 8 * 60; // Shanghai is UTC+8
    const shanghaiTime = new Date(now.getTime() + shanghaiOffset * 60 * 1000);
    return shanghaiTime.toISOString().slice(0, 10).replace(/-/g, '');
}

const defaultPassword = '123123'; // Default password is current date in YYYYMMDD format

const index = `<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <title>🔗 ShortLink</title>
</head>

<style>
    .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
    }
    
    @media (min-width: 768px) {
        .bd-placeholder-img-lg {
            font-size: 3.5rem;
        }
    }
    
    .btn-secondary,
    .btn-secondary:hover,
    .btn-secondary:focus {
        color: #333;
        text-shadow: none;
    }
    
    body {
        text-shadow: 0 .05rem .1rem rgba(0, 0, 0, .5);
    }
    
    .cover-container {
        max-width: 42em;
    }
    
    .nav-masthead .nav-link {
        padding: .25rem 0;
        font-weight: 700;
        color: rgba(255, 255, 255, .5);
        background-color: transparent;
        border-bottom: .25rem solid transparent;
    }
    
    .nav-masthead .nav-link:hover,
    .nav-masthead .nav-link:focus {
        border-bottom-color: rgba(255, 255, 255, .25);
    }
    
    .nav-masthead .nav-link+.nav-link {
        margin-left: 1rem;
    }
    
    .nav-masthead .active {
        color: #fff;
        border-bottom-color: #fff;
    }

    .progress {
        margin-top: 20px; /* Increased margin to avoid overlap */
        margin-bottom: 20px;
        height: 20px;
    }

    .progress-bar {
        width: 0%;
    }

    #result {
        cursor: pointer;
        color: #0d6efd;
        text-decoration: underline;
    }
</style>

</head>

<body class="d-flex h-100 text-center text-white bg-dark">

    <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <header class="mb-auto">
            <div>
                <h3 class="float-md-start mb-0">🔗 ShortLink</h3>
            </div>
        </header>
        <br>
        <br>
        <main class="px-3">
            <p id="result" class="lead"></p>

            <br>
            <div id="link_div" class="input-group mb-3">
                <select class="form-control" id="select">
                    <option value="link">🔗 Link</option>
                    <option value="text">📄 Text</option>
                    <option value="file">📁 File</option>
                </select>
                <input type="text" id="name" placeholder="short code" class="input-group-text">
                <select id="expire" class="form-control">
                    <option value="15">15分钟</option>
                    <option value="60">60分钟</option>
                    <option value="240">4小时</option>
                    <option value="10080">一周</option>
                    <option value="43200">一个月</option>
                    <option value="525600">一年</option>
                    <option value="0">永不过期</option>
                </select>
            </div>
            <div id="text_div">
                <textarea id="link" placeholder="link/text.." class="form-control" rows="10"></textarea><br>
            </div>
            <div id="password_div" class="input-group mb-3">
                <input type="password" id="password" placeholder="Password" class="form-control">
            </div>
            <div id="file_div" style="display: none;">
                <input type="file" id="file" class="form-control"><br>
                <div class="progress">
                    <div id="progressBar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <p class="lead">
                <a href="#" onclick="getlink()" class="btn btn-lg btn-secondary fw-bold border-white bg-white">🚀 Get</a>
            </p>
        </main>
    </div>
    <script>
        document.getElementById('select').addEventListener('change', function() {
            const type = this.value;
            if (type === 'file') {
                document.getElementById('text_div').style.display = 'none';
                document.getElementById('file_div').style.display = 'block';
            } else {
                document.getElementById('text_div').style.display = 'block';
                document.getElementById('file_div').style.display = 'none';
            }
        });

        async function postData(url = '', data = {}) {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(data)
            });
            return response.json();
        }

        async function postFile(url = '', file, expire, password) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('expire', expire);
            formData.append('filename', file.name); // Save original filename
            formData.append('password', password); // Add password to form data

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    document.getElementById('progressBar').style.width = percentComplete + '%';
                    document.getElementById('progressBar').setAttribute('aria-valuenow', percentComplete);
                }
            };

            return new Promise((resolve, reject) => {
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(xhr.responseText || 'Upload failed'));
                    }
                };
                xhr.onerror = function() {
                    reject(new Error('Upload failed'));
                };
                xhr.send(formData);
            });
        }

        function getlink() {
            document.getElementById('result').innerHTML = "processing..";
            const type = document.getElementById('select').value;
            const name = document.getElementById('name').value;
            const expire = document.getElementById('expire').value;
            const password = document.getElementById('password').value;

            if (!password) {
                document.getElementById('result').innerHTML = "Please enter the password.";
                return;
            }

            if (type === 'file') {
                const file = document.getElementById('file').files[0];
                if (!file) {
                    document.getElementById('result').innerHTML = "Please select a file.";
                    return;
                }
                postFile("${api_path}", file, expire, password).then(resp => {
                    if (resp.error) {
                        document.getElementById('result').innerHTML = resp.error;
                    } else {
                        var url = document.location.protocol + '//' + document.location.host + '/' + resp['${url_name}'];
                        document.getElementById('result').innerHTML = url;
                        document.getElementById('name').value = resp['${url_name}'];
                        document.getElementById('result').onclick = function() {
                            navigator.clipboard.writeText(url).then(function() {
                                alert('Link copied to clipboard!');
                            }, function(err) {
                                console.error('Failed to copy: ', err);
                            });
                        };
                    }
                }).catch(error => {
                    document.getElementById('result').innerHTML = error.message;
                });
            } else {
                let link = document.getElementById('link').value;
                if (link.indexOf('http') == -1 && type == "link") {
                    link = 'http://' + link;
                }
                postData("${api_path}", {
                    "${url_key}": link,
                    "${url_name}": name,
                    "type": type,
                    "${expire_key}": expire,
                    "${password_key}": password
                }).then(resp => {
                    if (resp.error) {
                        document.getElementById('result').innerHTML = resp.error;
                    } else {
                        var url = document.location.protocol + '//' + document.location.host + '/' + resp['${url_name}'];
                        document.getElementById('result').innerHTML = url;
                        document.getElementById('name').value = resp['${url_name}'];
                        document.getElementById('result').onclick = function() {
                            navigator.clipboard.writeText(url).then(function() {
                                alert('Link copied to clipboard!');
                            }, function(err) {
                                console.error('Failed to copy: ', err);
                            });
                        };
                    }
                }).catch(error => {
                    document.getElementById('result').innerHTML = error.message;
                });
            }
        }
    </script>

</html>`;

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
    const { protocol, hostname, pathname } = new URL(request.url);

    // index.html
    if (pathname == admin_path || pathname === '/') {
        return new Response(index, {
            headers: { 'content-type': 'text/html; charset=utf-8' },
        });
    }

    // short api
    if (pathname.startsWith(api_path)) {
        if (request.method === 'POST') {
            const contentType = request.headers.get('content-type');
            if (contentType && contentType.includes('multipart/form-data')) {
                const formData = await request.formData();
                const file = formData.get('file');
                const expire = formData.get('expire');
                const filename = formData.get('filename'); // Get original filename
                const password = formData.get('password'); // Get password

                if (!file) {
                    return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                if (password !== defaultPassword) {
                    return new Response(JSON.stringify({ error: 'Invalid password' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                const fileBuffer = await file.arrayBuffer();
                const fileName = Math.random().toString(36).slice(-5);
                const expireTime = expire ? parseInt(expire) * 60 : undefined; // Convert minutes to seconds
                await shortlink.put(fileName, JSON.stringify({
                    type: 'file',
                    value: fileBuffer,
                    filename: filename // Save original filename
                }), { expirationTtl: expireTime });

                return new Response(JSON.stringify({
                    [url_name]: fileName,
                    [short_url_key]: `${protocol}//${hostname}/${fileName}`
                }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                const body = await request.json();
                var short_type = 'link';
                if (body['type'] != undefined && body['type'] != "") {
                    short_type = body['type'];
                }

                if (body[url_name] == undefined || body[url_name] == "" || body[url_name].length < 2) {
                    body[url_name] = Math.random().toString(36).slice(-5);
                }

                if (body[password_key] !== defaultPassword) {
                    return new Response(JSON.stringify({ error: 'Invalid password' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                const expireTime = body[expire_key] ? parseInt(body[expire_key]) * 60 : undefined; // Convert minutes to seconds
                await shortlink.put(body[url_name], JSON.stringify({
                    "type": short_type,
                    "value": body[url_key]
                }), { expirationTtl: expireTime });

                body[short_url_key] = `${protocol}//${hostname}/${body[url_name]}`;
                return new Response(JSON.stringify(body), {
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            }
        } else if (request.method === 'PUT') {
            // Handle PUT request for curl -T
            const fileName = pathname.split('/').pop() || Math.random().toString(36).slice(-5);
            const fileBuffer = await request.arrayBuffer();
            const expireTime = 0; // Default to no expiration for curl uploads
            await shortlink.put(fileName, JSON.stringify({
                type: 'file',
                value: fileBuffer,
                filename: fileName // Use the generated name as the filename
            }), { expirationTtl: expireTime });

            return new Response(JSON.stringify({
                [url_name]: fileName,
                [short_url_key]: `${protocol}//${hostname}/${fileName}`
            }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    const key = pathname.replace('/', '');
    if (key == "") {
        return new Response(`403`, {
            headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
    }

    let link = await shortlink.get(key);
    if (link != null) {
        link = JSON.parse(link);
        if (link['type'] === 'file') {
            const fileBuffer = link['value'];
            const filename = link['filename']; // Get original filename
            return new Response(fileBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filename}"` // Set filename for download
                },
            });
        } else if (link['type'] == "link") {
            return Response.redirect(link['value'], 302);
        } else {
            return new Response(`${link['value']}`, {
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
    }

    return new Response(`403`, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
}