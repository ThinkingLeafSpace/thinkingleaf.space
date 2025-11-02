#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量同步Obsidian中的所有博客文章
"""

import os
import sys
from pathlib import Path

# 获取脚本所在目录
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent
OBSIDIAN_DIR = Path('/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站')
BLOGS_DIR = SITE_ROOT / 'blogs'

def main():
    """主函数"""
    print("="*60)
    print("Obsidian博客批量同步工具")
    print("="*60)
    print()
    
    # 获取所有需要部署的markdown文件
    md_files = list(OBSIDIAN_DIR.glob('*.md'))
    
    if not md_files:
        print("❌ 未找到任何Markdown文件")
        return
    
    print(f"📁 找到 {len(md_files)} 篇文章需要同步")
    print()
    
    # 转换每个文件
    success_count = 0
    failed_count = 0
    
    for md_file in sorted(md_files):
        print(f"正在处理: {md_file.name}")
        print("-" * 60)
        
        # 运行部署脚本
        import subprocess
        cmd = ['bash', str(SCRIPT_DIR / 'deploy_blog.sh'), str(md_file)]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=SITE_ROOT)
            if result.returncode == 0:
                success_count += 1
                print("✅ 成功\n")
            else:
                failed_count += 1
                print(f"❌ 失败\n{result.stderr}\n")
        except Exception as e:
            failed_count += 1
            print(f"❌ 错误: {e}\n")
    
    print("="*60)
    print(f"同步完成！成功: {success_count}, 失败: {failed_count}")
    print("="*60)

if __name__ == '__main__':
    main()

