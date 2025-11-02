# 📋 设置 master 为主分支指南

> 将 GitHub 仓库的默认分支从 `main` 或其他分支改为 `master`，用于 GitHub Pages 部署

---

## 🎯 目标

- 将 GitHub 仓库的**默认分支**设置为 `master`
- 确保 GitHub Pages 使用 `master` 分支作为源

---

## 📍 方法：在 GitHub 网页设置（最简单）

### 第一步：进入仓库设置

1. 打开浏览器，访问你的仓库：
   ```
   https://github.com/ThinkingLeafSpace/thinkingleaf.space
   ```

2. 点击仓库页面右上角的 **⚙️ Settings（设置）** 按钮
   - 如果没有看到 Settings，可能需要先确认仓库访问权限

### 第二步：找到默认分支设置

1. 在左侧菜单中找到 **"Branches"（分支）** 选项
2. 点击进入分支设置页面

### 第三步：修改默认分支

1. 在页面顶部找到 **"Default branch"（默认分支）** 部分
2. 点击右侧的 **🔄 Switch to another branch（切换到其他分支）** 按钮
3. 在弹出的分支列表中选择 **`master`**
4. 确认对话框会弹出，点击 **"Update"（更新）** 按钮
5. 如果需要，再次确认（因为这会影响到其他协作者）

---

## 🌐 配置 GitHub Pages 使用 master 分支

### 第一步：进入 Pages 设置

1. 仍在 Settings 页面
2. 在左侧菜单中找到 **"Pages"** 选项
3. 点击进入 GitHub Pages 设置

### 第二步：选择源分支

1. 在 **"Source"（源）** 部分：
   - **Branch（分支）** 下拉菜单选择 **`master`**
   - **Folder（文件夹）** 选择 **`/ (root)`**（根目录）
2. 点击 **"Save"（保存）**

---

## ✅ 验证设置

### 方法1：检查仓库主页

1. 返回仓库主页：https://github.com/ThinkingLeafSpace/thinkingleaf.space
2. 查看仓库名称下方：
   - 应该显示 **`master`** 分支（之前可能是 `main`）
   - 如果显示 `master`，说明默认分支已切换成功 ✅

### 方法2：检查 GitHub Pages

1. 访问你的网站（如果有的话）
2. 或者在 Pages 设置页面查看状态
3. 应该显示 "Your site is published at..." 的提示

---

## 🔧 如果遇到问题

### 问题1：找不到 Settings 按钮

**原因：** 可能是仓库权限问题

**解决：**
- 确认你是仓库的所有者或管理员
- 如果是 fork 的仓库，需要在原始仓库设置

### 问题2：无法切换到 master

**原因：** master 分支可能不存在于远程

**解决：**
```bash
# 1. 确认本地master分支存在
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
git branch  # 应该看到 * master

# 2. 确保master已推送到远程
git push -u origin master
```

### 问题3：GitHub Pages 没有更新

**解决：**
1. 等待几分钟（GitHub 需要时间部署）
2. 清除浏览器缓存后重新访问
3. 检查 Pages 设置页面是否有错误提示

---

## 📝 本地同步（可选）

设置完成后，如果你想清理本地的其他分支引用：

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"

# 清理已删除的远程分支引用
git remote prune origin

# 查看当前分支状态
git branch -a
```

---

## 🎯 快速检查清单

- [ ] 在 GitHub 网页进入仓库 Settings
- [ ] 找到 Branches → Default branch
- [ ] 切换到 `master` 分支
- [ ] 进入 Pages 设置
- [ ] 确认 Source 分支为 `master`
- [ ] 保存设置
- [ ] 验证仓库主页显示 `master` 分支
- [ ] 等待几分钟后检查网站是否正常

---

## 💡 提示

- **默认分支**：这是仓库的主要分支，通常是其他分支合并的目标
- **GitHub Pages 源分支**：这是网站内容的来源分支，可以是任何分支
- 两个设置可以不同，但通常保持一致更方便管理

---

**设置完成后，你的仓库就会使用 `master` 作为主分支了！** ✅

