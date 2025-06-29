#!/bin/bash
# 重命名博客文件的Shell脚本

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查是否安装了必要的Python包
pip_check() {
  python3 -c "import $1" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "正在安装必要的Python包: $1..."
    pip3 install $1
    if [ $? -ne 0 ]; then
      echo "无法安装 $1。请手动安装后再运行此脚本。"
      echo "使用命令: pip3 install $1"
      exit 1
    fi
  fi
}

# 检查必要的包
pip_check "bs4"

# 运行Python脚本
echo "正在运行博客文件重命名工具..."
python3 "$SCRIPT_DIR/rename_blog_files.py"

# 检查脚本运行结果
if [ $? -eq 0 ]; then
  echo "重命名操作完成！"
else
  echo "重命名操作失败。"
fi 