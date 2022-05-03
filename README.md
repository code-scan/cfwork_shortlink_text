# 👷 cloudflare worker实现的短网址和文本分享

![](images/index.png)


## 使用方法

```
npm install -g @cloudflare/wrangler

wrangler login

```

去cf worker页面创建一个kv,并且把id填写到`wrangler.toml`里面,在进行发布


```
wrangler publish

```