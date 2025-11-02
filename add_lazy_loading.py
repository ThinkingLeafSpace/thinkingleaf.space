#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量添加懒加载CSS引用到所有HTML文件
"""

import os
import re
from pathlib import Path

# 懒加载CSS引用
LAZY_LOADING_CSS = '<link rel="stylesheet" href="../css/lazy-loading.css">'
LAZY_LOADING_CSS_ROOT = '<link rel="stylesheet" href="css/lazy-loading.css">'

def add_lazy_loading_css(file_path):
    """为单个HTML文件添加懒加载CSS引用"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已包含懒加载CSS
        if 'lazy-loading.css' in content:
            return 'skipped'
        
        # 确定是根目录还是子目录文件
        is_root = 'blogs' not in str(file_path) and 'exhibits' not in str(file_path)
        lazy_css = LAZY_LOADING_CSS_ROOT if is_root else LAZY_LOADING_CSS
        
        # 查找CSS引用位置
        patterns = [
            # 博客文章：在blog-post.css后添加
            (r'(<link rel="stylesheet" href="\.\./css/blog-post\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS),
            # 展品页面：在style.css或styles.css后添加
            (r'(<link rel="stylesheet" href="\.\./style\.css">)', 
             r'\1\n  ' + LAZY_LOADING_CSS),
            (r'(<link rel="stylesheet" href="\.\./css/styles\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS),
            # 根目录文件：在ui-principles.css或dark-mode.css后添加
            (r'(<link rel="stylesheet" href="css/ui-principles\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS_ROOT),
            (r'(<link rel="stylesheet" href="css/dark-mode\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS_ROOT),
            (r'(<link rel="stylesheet" href="css/search\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS_ROOT),
            # 通用：在任何CSS引用后添加（作为后备）
            (r'(<link rel="stylesheet" href="\.\./css/styles\.css">)', 
             r'\1\n    ' + LAZY_LOADING_CSS),
        ]
        
        for pattern, replacement in patterns:
            if re.search(pattern, content):
                new_content = re.sub(pattern, replacement, content, count=1)
                # 确保不会重复添加
                if 'lazy-loading.css' not in new_content or new_content.count('lazy-loading.css') == 1:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    return 'added'
        
        return 'not_found'
    except Exception as e:
        print(f"  错误: {e}")
        return 'error'

def main():
    """主函数"""
    print("=" * 50)
    print("批量添加懒加载CSS引用")
    print("=" * 50)
    print()
    
    # 获取脚本所在目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    added_count = 0
    skipped_count = 0
    not_found_count = 0
    error_count = 0
    
    # 处理博客文章
    print("处理 blogs/ 目录下的文章...")
    blogs_dir = Path('blogs')
    if blogs_dir.exists():
        for html_file in blogs_dir.glob('*.html'):
            result = add_lazy_loading_css(html_file)
            if result == 'added':
                print(f"  ✓ 已添加: {html_file}")
                added_count += 1
            elif result == 'skipped':
                print(f"  ⊙ 跳过: {html_file} (已包含)")
                skipped_count += 1
            elif result == 'not_found':
                print(f"  ⚠ 警告: {html_file} (未找到合适位置)")
                not_found_count += 1
            else:
                print(f"  ✗ 错误: {html_file}")
                error_count += 1
    
    # 处理展品页面
    print("\n处理 exhibits/ 目录下的页面...")
    exhibits_dir = Path('exhibits')
    if exhibits_dir.exists():
        for html_file in exhibits_dir.glob('*.html'):
            result = add_lazy_loading_css(html_file)
            if result == 'added':
                print(f"  ✓ 已添加: {html_file}")
                added_count += 1
            elif result == 'skipped':
                print(f"  ⊙ 跳过: {html_file} (已包含)")
                skipped_count += 1
            elif result == 'not_found':
                print(f"  ⚠ 警告: {html_file} (未找到合适位置)")
                not_found_count += 1
            else:
                print(f"  ✗ 错误: {html_file}")
                error_count += 1
    
    # 处理cabinet.html
    print("\n处理 cabinet.html...")
    cabinet_file = Path('cabinet.html')
    if cabinet_file.exists():
        result = add_lazy_loading_css(cabinet_file)
        if result == 'added':
            print(f"  ✓ 已添加: {cabinet_file}")
            added_count += 1
        elif result == 'skipped':
            print(f"  ⊙ 跳过: {cabinet_file} (已包含)")
            skipped_count += 1
        elif result == 'not_found':
            print(f"  ⚠ 警告: {cabinet_file} (未找到合适位置)")
            not_found_count += 1
        else:
            print(f"  ✗ 错误: {cabinet_file}")
            error_count += 1
    
    # 处理其他根目录文件
    print("\n处理根目录下的其他HTML文件...")
    root_files = ['portfolio.html', 'newsletter.html', 'mitsein.html']
    for filename in root_files:
        file_path = Path(filename)
        if file_path.exists():
            result = add_lazy_loading_css(file_path)
            if result == 'added':
                print(f"  ✓ 已添加: {file_path}")
                added_count += 1
            elif result == 'skipped':
                print(f"  ⊙ 跳过: {file_path} (已包含)")
                skipped_count += 1
            elif result == 'not_found':
                print(f"  ⚠ 警告: {file_path} (未找到合适位置)")
                not_found_count += 1
            else:
                print(f"  ✗ 错误: {file_path}")
                error_count += 1
    
    # 总结
    print()
    print("=" * 50)
    print("处理完成！")
    print("=" * 50)
    print(f"✓ 已添加懒加载CSS: {added_count} 个文件")
    print(f"⊙ 已跳过（已有）: {skipped_count} 个文件")
    if not_found_count > 0:
        print(f"⚠ 未找到合适位置: {not_found_count} 个文件（需手动添加）")
    if error_count > 0:
        print(f"✗ 处理错误: {error_count} 个文件")
    print()
    print("提示：请检查修改后的文件，确保格式正确。")

if __name__ == '__main__':
    main()

