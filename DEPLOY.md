# 部署说明：为何「已 push 但网站未变」

## 结论（已核对）

| 位置 | `remake.html` 标题 / 说明 |
|------|---------------------------|
| **本地与 GitHub `main`** | `筑 · 创造 - 筑居思`（与仓库一致） |
| **线上 https://thinkingleaf.space/remake.html** | 仍为旧版 `造物拾遗 - 筑居思` |

线上响应头含 **Cloudflare**（`server: cloudflare`）。说明：**域名前面走了 Cloudflare，但当前「源站上的静态文件」并没有随 `git push` 自动更新**，或 **Cloudflare Pages 未绑定本仓库 / 未用最新构建**。

仅把代码推到 `https://github.com/ThinkingLeafSpace/thinkingleaf.space` **不会**自动改你在 CF 背后托管的那份文件，除非已配置「从 Git 自动部署」。

## 请你在线上检查的三件事

1. **Cloudflare Dashboard → Workers & Pages → Pages**  
   - 是否有一个项目绑定 **`ThinkingLeafSpace/thinkingleaf.space`**、分支 **`main`**？  
   - 最近一次 **Deployments** 的提交哈希，是否等于 GitHub 上最新一次 push？

2. **若 Pages 未连接该仓库**  
   - 在 Pages 里 **Connect to Git**，选本仓库与 `main`，构建命令留空、输出目录选 **`/`**（纯静态根目录）。  
   - 保存后触发一次部署，再看线上 `remake.html`。

3. **若源站是对象存储 / 自有服务器 / 面板上传**  
   - `git push` 只更新了 GitHub，**必须再把本地 `thinkingleaf.space` 整站同步到实际提供 HTML 的那一侧**（FTP、R2、rsync、面板「上传」等）。

## Cloudflare Pages 预览地址（不要抄「每次部署变的哈希」）

- **固定生产预览域名**（项目名）：`https://thinkingleaf-space-20251122.pages.dev`  
- 自检页面（与线上 `/remake` 对应）：`https://thinkingleaf-space-20251122.pages.dev/remake`  
- 控制台里形如 `1ee93535.thinkingleaf-space-20251122.pages.dev` 的是**单次部署**子域，会随每次构建变化；日常请用上面 **不带哈希** 的 `*.pages.dev` 地址。

## 部署后自检命令

```bash
curl -sL 'https://thinkingleaf.space/remake' | grep -E '<title>'
```

应出现：`筑 · 创造 - 筑居思`（与仓库一致）。若你仍使用 `remake.html`，注意线上可能 **308** 到 `/remake`，以最终跳转后的路径为准。

## 本地与远程一致时

在站点目录执行：

```bash
git status
git push origin main
```

若 `git status` 干净且已 push，则问题只在 **线上托管与 Git 未联动**，按上文在 Cloudflare（或你的主机）侧处理即可。

---

## 分步排查：当前是哪一环出问题

按下表从上到下做；**已通过**打勾，**卡在哪一步**就是问题所在。

| 步骤 | 检查什么 | 如何判断（你可本地执行） | 当前结论（截至文档更新时的观测） |
|------|----------|--------------------------|----------------------------------|
| 1 | 本地是否有未提交修改 | `git status` | 干净则 **代码已就绪** |
| 2 | 本地是否与 GitHub 一致 | `git log -1` 与 GitHub 网页上 `main` 最新提交是否同一哈希 | 一致则 **推送成功** |
| 3 | GitHub 上文件是否为新内容 | 打开仓库中 `remake.html`，搜索 `筑 · 创造` | 有则 **仓库侧无问题** |
| 4 | 域名是否经 Cloudflare | `dig thinkingleaf.space A` 是否为 `104.21.x` / `172.67.x` 等 Cloudflare 段 | 是则 **流量走 CF** |
| 5 | 访问路径实际命中谁 | `curl -sI https://thinkingleaf.space/remake.html` 看是否 **308** 到 `/remake` | 若为 308：**浏览器最终打开的是 `/remake`，不是裸的 `remake.html` 文件名** |
| 6 | 线上 HTML 是否等于仓库 | `curl -sL https://thinkingleaf.space/remake \| grep title` | 若仍是 `造物拾遗` 而仓库已是 `筑 · 创造`：**线上部署产物未更新** |

**归纳**

- **步骤 1～3 通过、6 不通过**：问题在 **部署与发布**（Cloudflare Pages 未绑本仓库、未自动构建、或源站仍是旧文件），**不是 Git 写错**。
- **步骤 5 的 308**：说明站点做了 **「去掉 .html」** 的规范地址；排查时请以 **`https://thinkingleaf.space/remake`**（或 Pages 项目预览域名）为准，看 **最近一次部署** 是否包含当前 `main`。
- **缓存**：若 `cf-cache-status` 为 `DYNAMIC`，通常不是「只清浏览器缓存」就能解决，仍要 **重新部署或更新源站文件**。
