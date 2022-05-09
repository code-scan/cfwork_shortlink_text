const admin_path = '/short_link_admin'
const api_path = '/short_api'
const url_key = 'link' // original url key
const url_name = 'name' // short code  key

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
                <!-- <input type="text" id="link" class="form-control" placeholder="link" aria-label="link"> -->
                <select class="form-control" id="select">
                    <option value="link">🔗 Link</option>
                    <option value="text">📄 Text</option>
                </select>
                <input type="text" id="name" placeholder="short code" class="input-group-text">
            </div>
            <div id="text_div">
                <textarea id="link" placeholder="link/text.." class="form-control" rows="10"></textarea><br>
            </div>
            <p class="lead">
                <a href="#" onclick="getlink()" class="btn btn-lg btn-secondary fw-bold border-white bg-white">🚀 Get</a>
            </p>
        </main>




    </div>
    <script>
        async function postData(url = '', data = {}) {
            // Default options are marked with *
            const response = await fetch(url, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            });
            return response.json(); // parses JSON response into native JavaScript objects
        }

        function getlink() {
            document.getElementById('result').innerHTML = "processing.."
            let link = document.getElementById('link').value
            const name = document.getElementById('name').value
            const type = document.getElementById('select').value
            if (link.indexOf('http') == -1 && type == "link") {
                link = 'http://' + link
            }
            postData("${api_path}", {
                "${url_key}": link,
                "${url_name}": name,
                "type": type
            }).then(resp => {
                var url = document.location.protocol + '//' + document.location.host + '/' + resp.name
                document.getElementById('result').innerHTML = url
                document.getElementById('name').value = resp.name
            })
        }
    </script>

</html>`



addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    // index.html
    if (pathname == admin_path) {
        return new Response(index, {
            headers: { 'content-type': 'text/html; charset=utf-8' },
        })
    }
    // short api
    if (pathname.startsWith(api_path)) {
        const body = JSON.parse(await request.text());
        console.log(body)
        var short_type = 'link'
        if (body['type'] != undefined && body['type'] != "") {
            short_type = body['type'];
        }

        if (body[url_name] == undefined || body[url_name] == "" || body[url_name].length < 2) {
            body[url_name] = Math.random().toString(36).slice(-5)
        }
        await shortlink.put(body[url_name], JSON.stringify({
            "type": short_type,
            "value": body[url_key]
        }))
        return new Response(JSON.stringify(body), {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    }
    const key = pathname.replace('/', '')
    if (key == "") {
        return new Response(`403`, {
            headers: { 'content-type': 'text/plain; charset=utf-8' },
        })
    }
    let link = await shortlink.get(key)
    if (link != null) {
        link = JSON.parse(link)
        console.log(link)
            // redirect
        if (link['type'] == "link") {
            return Response.redirect(link['value'], 302);
        } else {
            // textarea
            return new Response(`${link['value']}`, {
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            })
        }
    }
    return new Response(`403`, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
}