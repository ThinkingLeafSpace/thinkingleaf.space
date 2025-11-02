#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量添加懒加载CSS引用到所有HTML文件
特别关注博客文章和展品页面
"""

import os
import re
from pathlib import Path

def add_lazy_loading_css(file_path):
    """为HTML文件添加懒加载CSS引用"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经包含懒加载CSS
        if 'lazy-loading.css' in content:
            return False, "已存在懒加载CSS"
        
        # 确定CSS路径（根据文件位置）
        if 'blogs/' in str(file_path):
            css_path = '../css/lazy-loading.css'
        elif 'exhibits/' in str(file_path):
            css_path = '../css/lazy-loading.css'
        else:
            css_path = 'css/lazy-loading.css'
        
        # 查找插入位置 - 在其他CSS之后
        patterns = [
            (r'(<link rel="stylesheet" href="[^"]*blog-post\.css">)', f'\\1\n    <link rel="stylesheet" href="{css_path}">'),
            (r'(<link rel="stylesheet" href="[^"]*float-music-icon\.css">)', f'\\1\n    <link rel="stylesheet" href="{css_path}">'),
            (r'(<link rel="stylesheet" href="[^"]*styles\.css">)', f'\\1\n    <link rel="stylesheet" href="{css_path}">'),
            (r'(<link rel="stylesheet" href="[^"]*style\.css">)', f'\\1\n  <link rel="stylesheet" href="{css_path}">'),
            (r'(<link rel="stylesheet" href="[^"]*ui-principles\.css">)', f'\\1\n    <link rel="stylesheet" href="{css_path}">'),
        ]
        
        modified = False
        for pattern, replacement in patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content, count=1)
                modified = True
                break
        
        # 如果找不到其他CSS，在</head>之前添加
        if not modified:
            if '</head>' in content:
                # 确保正确的缩进
                indent = '  ' if 'exhibits' in str(file_path) else '    '
                content = content.replace('</head>', f'{indent}<link rel="stylesheet" href="{css_path}">\n</head>')
                modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, "已添加懒加载CSS"
        else:
            return False, "未找到合适的插入位置"
    
    except Exception as e:
        return False, f"错误: {str(e)}"

def main():
    """主函数"""
    # 获取脚本所在目录的父目录（项目根目录）
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # 要处理的目录
    directories = [
        project_root / 'blogs',
        project_root / 'exhibits',
    ]
    
    blog_count = 0
    exhibit_count = 0
    blog_skipped = 0
    exhibit_skipped = 0
    
    print("开始批量添加懒加载CSS引用...\n")
    
    # 处理博客文章
    blog_dir = project_root / 'blogs'
    if blog_dir.exists():
        print(f"处理博客文章 ({blog_dir})...")
        for html_file in blog_dir.glob('*.html'):
            success, message = add_lazy_loading_css(html_file)
            if success:
                print(f"  ✓ {html_file.name}")
                blog_count += 1
            else:
                if "已存在" in message:
                    blog_skipped += 1
                else:
                    print(f"  ✗ {html_file.name}: {message}")
        print()
    
    # 处理展品页面
    exhibit_dir = project_root / 'exhibits'
    if exhibit_dir.exists():
        print(f"处理展品页面 ({exhibit_dir})...")
        for html_file in exhibit_dir.glob('*.html'):
            success, message = add_lazy_loading_css(html_file)
            if success:
                print(f"  ✓ {html_file.name}")
                exhibit_count += 1
            else:
                if "已存在" in message:
                    exhibit_skipped += 1
                else:
                    print(f"  ✗ {html_file.name}: {message}")
        print()
    
    # 总结
    print("=" * 50)
    print("完成！")
    print(f"博客文章: 添加了 {blog_count} 个文件，跳过 {blog_skipped} 个已存在文件")
    print(f"展品页面: 添加了 {exhibit_count} 个文件，跳过 {exhibit_skipped} 个已存在文件")
    print(f"总计: 成功添加 {blog_count + exhibit_count} 个文件的懒加载CSS")

if __name__ == '__main__':
    main()
