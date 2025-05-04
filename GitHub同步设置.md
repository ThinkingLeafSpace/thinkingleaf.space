# ThinkingLeaf GitHub同步设置

## 一次性设置步骤

1. 确保已在GitHub上创建仓库(https://github.com/ThinkingLeafSpace/thinkingleaf.space)

2. 关联本地仓库到GitHub (在命令行中执行):
   ```
   git remote add origin https://github.com/ThinkingLeafSpace/thinkingleaf.space
   ```

3. 首次推送:
   ```
   git push -u origin master
   ```

## 自动同步使用说明

1. 双击运行 `auto-sync.bat` 文件
2. 等待同步完成
3. 按任意键关闭窗口

## 设置定时任务 (可选)

1. 按Win+R，输入 `taskschd.msc` 打开任务计划程序
2. 点击"创建任务"
3. 名称填写: `ThinkingLeaf同步GitHub`
4. 切换到"触发器"选项卡，点击"新建"
   - 设置您想要的同步频率(每天、每周等)
5. 切换到"操作"选项卡，点击"新建" 
   - "操作"选择"启动程序"
   - "程序或脚本"浏览选择您的auto-sync.bat文件路径
   - 起始位置填写您的项目文件夹路径
6. 确认并完成设置

现在，您的网站内容将按照计划定时自动同步到GitHub！ 