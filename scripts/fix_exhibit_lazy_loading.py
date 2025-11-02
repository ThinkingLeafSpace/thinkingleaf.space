#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复展品页面的懒加载相关问题
1. 修复script路径
2. 清理重复的图片属性
"""

import re
from pathlib import Path

def fix_exhibit_file(file_path):
    """修复展品文件中的懒加载问题"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        # 1. 修复script路径
        # <script src="js/lazy-loading.js"></script> -> <script src="../js/lazy-loading.js" defer></script>
        if re.search(r'<script src="js/lazy-loading\.js">', content):
            content = re.sub(
                r'<script src="js/lazy-loading\.js">',
                '<script src="../js/lazy-loading.js" defer></script>',
                content
            )
            modified = True
        
        # <script src="js/theme-switcher.js"></script> -> <script src="../js/theme-switcher.js"></script>
        if re.search(r'<script src="js/theme-switcher\.js">', content):
            content = re.sub(
                r'<script src="js/theme-switcher\.js">',
                '<script src="../js/theme-switcher.js"></script>',
                content
            )
            modified = True
        
        # 2. 清理重复的图片属性
        # 匹配: loading="lazy" src="..." alt="..." data-src="..." alt="..." (或重复的class)
        patterns = [
            # 处理 data-src 重复
            (r'(<img[^>]*loading="lazy"[^>]*src="([^"]*)"[^>]*?)\s+data-src="\2"[^>]*?alt="([^"]*)"\s+alt="\3"([^>]*?)(class="([^"]*)"\s+)?class="\6"([^>]*>)',
             r'\1 alt="\3" \6\4\7'),
            # 更简单的模式：移除 data-src 如果 src 已经存在
            (r'(<img[^>]*loading="lazy"[^>]*src="([^"]*)"[^>]*?)\s+data-src="\2"([^>]*>)',
             r'\1\3'),
            # 移除重复的 alt 属性
            (r'(<img[^>]*alt="([^"]*)"[^>]*?)\s+alt="\2"([^>]*>)',
             r'\1\3'),
            # 移除重复的 class 属性
            (r'(<img[^>]*class="([^"]*)"[^>]*?)\s+class="\2"([^>]*>)',
             r'\1\3'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, "已修复"
        else:
            return False, "无需修复"
    
    except Exception as e:
        return False, f"错误: {str(e)}"

def main():
    """主函数"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    exhibit_dir = project_root / 'exhibits'
    
    if not exhibit_dir.exists():
        print("展品目录不存在")
        return
    
    print("开始修复展品页面的懒加载问题...\n")
    
    count = 0
    for html_file in exhibit_dir.glob('*.html'):
        success, message = fix_exhibit_file(html_file)
        if success:
            print(f"  ✓ {html_file.name}: {message}")
            count += 1
        else:
            if "无需" in message:
                print(f"  - {html_file.name}: {message}")
            else:
                print(f"  ✗ {html_file.name}: {message}")
    
    print(f"\n完成！修复了 {count} 个文件")

if __name__ == '__main__':
    main()
