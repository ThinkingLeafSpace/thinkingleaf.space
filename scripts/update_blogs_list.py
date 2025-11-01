#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动更新blogs.html中的博客列表
从文件名最前面提取日期（标准格式：YYYY-MM-DD-标题.html）
"""

import re
from pathlib import Path
from datetime import datetime

SITE_ROOT = Path(__file__).parent.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
BLOGS_HTML = SITE_ROOT / 'blogs.html'


def extract_date_from_filename(filename):
    """
    从文件名最前面提取日期（标准格式：YYYY-MM-DD-标题）
    返回值：YYYY-MM-DD格式的日期字符串，如果未找到则返回None
    """
    name_without_ext = Path(filename).stem
    match = re.match(r'^(\d{4}-\d{2}-\d{2})', name_without_ext)
    return match.group(1) if match else None


def extract_blog_info(html_file):
    """从文件名和HTML内容中提取博客信息"""
    filename = html_file.name
    
    # 从文件名最前面提取日期
    date_str = extract_date_from_filename(filename)
    
    # 如果文件名没有日期，尝试从HTML内容提取（兼容旧文件）
    if not date_str:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        date_match = re.search(r'<time datetime="([^"]+)">', content)
        if date_match:
            date_str = date_match.group(1).split()[0]  # 只取日期部分
    
    # 从HTML提取标题和描述
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    title_match = re.search(r'<title>([^<]+)</title>', content)
    title = title_match.group(1).replace(' - 筑居思', '').strip() if title_match else ''
    
    desc_match = re.search(r'<meta name="description" content="([^"]+)">', content)
    description = desc_match.group(1) if desc_match else ''
    
    return {
        'title': title,
        'date': date_str or '',
        'description': description,
        'filename': filename
    }


def get_all_blogs():
    """获取所有博客文件并按日期排序"""
    blogs = []
    
    for html_file in BLOGS_DIR.glob('*.html'):
        if html_file.name.startswith('.'):
            continue
        
        info = extract_blog_info(html_file)
        if info['date']:
            try:
                date_obj = datetime.strptime(info['date'], '%Y-%m-%d')
                blogs.append((date_obj, info))
            except:
                pass
    
    # 按日期从新到旧排序
    blogs.sort(key=lambda x: x[0], reverse=True)
    
    return [info for _, info in blogs]


def update_blogs_html():
    """更新blogs.html文件"""
    blogs = get_all_blogs()
    
    if not blogs:
        print("警告: 没有找到博客文件")
        return []
    
    # 读取现有blogs.html
    with open(BLOGS_HTML, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成新的博客链接HTML
    blog_links_html = []
    for blog in blogs[:20]:  # 只显示最新的20篇
        date_formatted = blog['date']
        
        # 转义HTML特殊字符
        title = blog['title'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        desc = (blog['description'][:100] if blog['description'] else '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        if blog['description'] and len(blog['description']) > 100:
            desc += '...'
        
        blog_links_html.append(f'''                                    <a href="blogs/{blog['filename']}" class="link-card">
                                        <div class="link-content">
                                            <h5>{title}</h5>
                                            <span class="date-tag">{date_formatted}</span>
                                            <p>{desc}</p>
                                        </div>
                                    </a>''')
    
    # 查找并替换"生活随笔"部分的链接网格
    # 匹配从 <h4>生活随笔</h4> 到关闭links-grid的</div>
    pattern = r'(<h4>生活随笔</h4>\s*<div class="links-grid">)(.*?)(\s*</div>\s*</div>\s*</div>)'
    
    # 生成替换内容，保持原有缩进
    new_links_content = '\n'.join(blog_links_html)
    replacement = r'\1\n' + new_links_content + '\n                                ' + r'\3'
    
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # 备份原文件
        backup_path = BLOGS_HTML.with_suffix('.html.bak')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # 写入新内容
        with open(BLOGS_HTML, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ 已自动更新 blogs.html")
        print(f"  备份文件保存在: {backup_path.name}")
    else:
        print("警告: 未找到 '生活随笔' 部分，请手动更新")
        print("=" * 60)
        print("生成的博客链接（前10条）:")
        print("=" * 60)
        print("\n".join(blog_links_html[:10]))
    
    return blogs


def main():
    """主函数"""
    print("开始更新博客列表...")
    blogs = update_blogs_html()
    print(f"✓ 找到 {len(blogs)} 篇博客")
    if blogs:
        print(f"  已更新前 {min(len(blogs), 20)} 篇到 blogs.html")


if __name__ == '__main__':
    main()

