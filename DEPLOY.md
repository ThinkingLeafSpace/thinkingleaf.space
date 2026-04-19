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

## 部署后自检命令

```bash
curl -sL 'https://thinkingleaf.space/remake.html' | grep -E '<title>'
```

应出现：`筑 · 创造 - 筑居思`（与仓库一致）。

## 本地与远程一致时

在站点目录执行：

```bash
git status
git push origin main
```

若 `git status` 干净且已 push，则问题只在 **线上托管与 Git 未联动**，按上文在 Cloudflare（或你的主机）侧处理即可。
