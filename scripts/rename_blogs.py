#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量重命名博客文件为标准格式：YYYY-MM-DD-标题.html
从文件名或HTML内容中提取日期，自动重命名
"""

import re
from pathlib import Path
from datetime import datetime

SITE_ROOT = Path(__file__).parent.parent
BLOGS_DIR = SITE_ROOT / 'blogs'


def extract_date_from_html(html_file):
    """从HTML内容中提取日期"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 尝试多种日期格式
    patterns = [
        (r'<time datetime="([^"]+)">', '%Y-%m-%d'),  # <time datetime="2024-01-01">
        (r'(\d{4}-\d{2}-\d{2})', '%Y-%m-%d'),  # 标准日期格式 2024-01-01
        (r'(\d{4})年(\d{1,2})月(\d{1,2})日', None),  # 中文格式 2024年1月1日
    ]
    
    for pattern, date_format in patterns:
        match = re.search(pattern, content)
        if match:
            if date_format:
                # 标准格式
                date_str = match.group(1).split()[0]
                try:
                    datetime.strptime(date_str, date_format)
                    return date_str
                except:
                    continue
            else:
                # 中文格式：2024年1月1日 -> 2024-01-01
                year = match.group(1)
                month = match.group(2).zfill(2)
                day = match.group(3).zfill(2)
                date_str = f"{year}-{month}-{day}"
                try:
                    datetime.strptime(date_str, '%Y-%m-%d')
                    return date_str
                except:
                    continue
    
    return None


def extract_title_from_html(html_file):
    """从HTML内容中提取标题"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    title_match = re.search(r'<title>([^<]+)</title>', content)
    if title_match:
        title = title_match.group(1).replace(' - 筑居思', '').strip()
        # 清理标题，用于文件名
        safe_title = re.sub(r'[^\w\s-]', '', title).strip()
        safe_title = re.sub(r'[-\s]+', '-', safe_title)
        return safe_title
    
    return None


def generate_safe_filename(date_str, title, original_filename):
    """生成安全的文件名"""
    if not title:
        # 如果没有标题，使用原文件名（去掉扩展名）
        title = Path(original_filename).stem
        title = re.sub(r'[^\w\s-]', '', title).strip()
        title = re.sub(r'[-\s]+', '-', title)
    
    # 如果标题为空，使用默认值
    if not title:
        title = 'untitled'
    
    return f"{date_str}-{title}.html"


def rename_blogs(dry_run=True):
    """批量重命名博客文件"""
    files_to_rename = []
    
    print("扫描博客文件...\n")
    
    for html_file in BLOGS_DIR.glob('*.html'):
        if html_file.name.startswith('.'):
            continue
        
        filename = html_file.name
        
        # 检查是否已有日期前缀
        if re.match(r'^\d{4}-\d{2}-\d{2}', filename):
            print(f"✓ {filename} - 已符合标准格式，跳过")
            continue
        
        # 提取日期和标题
        date_str = extract_date_from_html(html_file)
        title = extract_title_from_filename(filename) or extract_title_from_html(html_file)
        
        if not date_str:
            print(f"⚠ {filename} - 无法提取日期，跳过")
            continue
        
        # 生成新文件名
        new_filename = generate_safe_filename(date_str, title, filename)
        
        if new_filename == filename:
            print(f"✓ {filename} - 文件名已正确")
            continue
        
        files_to_rename.append({
            'old': html_file,
            'new': BLOGS_DIR / new_filename,
            'date': date_str,
            'title': title or 'untitled'
        })
    
    if not files_to_rename:
        print("\n✓ 所有文件都已符合标准格式！")
        return
    
    print(f"\n找到 {len(files_to_rename)} 个需要重命名的文件：\n")
    for item in files_to_rename:
        print(f"  {item['old'].name}")
        print(f"  -> {item['new'].name}")
        print(f"  日期: {item['date']}, 标题: {item['title']}\n")
    
    if dry_run:
        print("⚠ 这是预览模式（dry-run），实际未重命名")
        print("运行脚本时使用 --execute 参数来执行重命名")
        return
    
    # 执行重命名
    print("开始重命名...\n")
    renamed = 0
    for item in files_to_rename:
        old_path = item['old']
        new_path = item['new']
        
        # 如果目标文件已存在，添加序号
        counter = 1
        original_new_path = new_path
        while new_path.exists():
            stem = original_new_path.stem
            new_path = BLOGS_DIR / f"{stem}-{counter}.html"
            counter += 1
        
        try:
            old_path.rename(new_path)
            print(f"✓ {old_path.name} -> {new_path.name}")
            renamed += 1
        except Exception as e:
            print(f"✗ 重命名失败: {old_path.name} - {e}")
    
    print(f"\n✓ 完成！成功重命名 {renamed}/{len(files_to_rename)} 个文件")


def extract_title_from_filename(filename):
    """从文件名提取标题（去掉扩展名）"""
    stem = Path(filename).stem
    # 如果文件名已经有一些格式，尝试提取标题部分
    # 例如：22-years-old -> 22-years-old
    return stem if stem else None


def main():
    """主函数"""
    import sys
    
    dry_run = '--execute' not in sys.argv
    
    if dry_run:
        print("=" * 60)
        print("博客文件重命名工具（预览模式）")
        print("=" * 60)
        print("提示: 添加 --execute 参数来执行实际重命名\n")
    else:
        print("=" * 60)
        print("博客文件重命名工具（执行模式）")
        print("=" * 60)
        print()
    
    rename_blogs(dry_run=dry_run)


if __name__ == '__main__':
    main()
