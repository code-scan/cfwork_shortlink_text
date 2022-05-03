# 👷 cloudflare worker实现的短网址和文本分享

![](images/index.png)


## 使用方法



```
npm install -g @cloudflare/wrangler

wrangler login

```

修改index.js中的路径为你自己的路径,防止其他人使用,如果需要公开访问,把`admin_path`设置成`/`即可

```js
const admin_path = '/short_link_admin'
const api_path = '/short_api'
```

去cf worker页面创建一个kv,并且把id填写到`wrangler.toml`里面,在进行发布


```
wrangler publish

```