# Git 版本控制指南 (新手友好版)

## 基础设置 (仅需执行一次)

1. **设置用户信息**
   ```
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

2. **初始化本地仓库** (如果项目还未初始化Git)
   ```
   git init
   ```

3. **关联远程仓库**
   ```
   git remote add origin https://github.com/ThinkingLeafSpace/thinkingleaf.space
   ```

## 日常操作流程

### 方法1: 使用改进的自动脚本 (推荐新手使用)

1. **运行自动同步脚本**
   - 双击运行 `auto-sync.bat` 文件
   - 查看状态后确认是否继续
   - 等待同步完成
   - 按任意键关闭窗口

### 方法2: 手动命令 (了解基本概念)

1. **查看当前状态**
   ```
   git status
   ```

2. **暂存更改**
   ```
   git add .                  # 添加所有更改
   git add 文件名             # 添加特定文件
   ```

3. **提交更改**
   ```
   git commit -m "描述你的更改"
   ```

4. **推送到远程仓库**
   ```
   git push
   ```

5. **从远程仓库获取最新代码** (如果有多人协作)
   ```
   git pull
   ```

## 常见问题解决

### 1. 如何撤销未提交的更改?
```
git restore 文件名          # 撤销对特定文件的更改
git restore .              # 撤销所有更改
```

### 2. 如何查看历史记录?
```
git log                    # 查看提交历史
git log --oneline          # 查看简洁版历史
```

### 3. 如何切换到历史版本?
```
git checkout 提交ID        # 临时查看历史版本
git switch -               # 返回到最新版本
```

### 4. 提交时出现冲突怎么办?
- 先运行 `git pull` 获取最新代码
- 手动解决冲突文件中的冲突标记 (<<<<<<<, =======, >>>>>>>)
- 解决后重新 `git add` 和 `git commit`

## 版本号管理 (可选)

如果你想为项目管理版本号，可以创建package.json文件:

1. **初始化package.json** (如果没有)
   ```
   npm init -y
   ```

2. **更新版本号并推送**
   ```
   npm version patch       # 更新小版本号 (1.0.0 → 1.0.1)
   npm version minor       # 更新次版本号 (1.0.0 → 1.1.0)
   npm version major       # 更新主版本号 (1.0.0 → 2.0.0)
   git push --tags         # 推送标签
   ```

---

记住，Git是一个强大的工具，刚开始使用时可以专注于基本流程。随着你的熟练度提高，可以学习更高级的功能。如有任何问题，可以参考Git官方文档或向有经验的同事请教。 