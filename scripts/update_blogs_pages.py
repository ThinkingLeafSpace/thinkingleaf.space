#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新博客列表页面脚本
从HTML文件中提取标题、简介、关键词，自动更新blogs.html和index.html
"""

import re
import json
from pathlib import Path
from html import unescape
from typing import Dict, List, Optional
from datetime import datetime

# 配置路径
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
BLOGS_HTML = SITE_ROOT / 'blogs.html'
INDEX_HTML = SITE_ROOT / 'index.html'


def extract_blog_info(html_file: Path) -> Optional[Dict]:
    """从HTML文件中提取博客信息"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取title标签
        title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        if not title_match:
            return None
        
        title = title_match.group(1).strip()
        title = title.replace(' - 筑居思', '').strip()
        title = unescape(title)
        
        # 提取description
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
        description = unescape(desc_match.group(1)) if desc_match else ''
        
        # 提取keywords
        keywords_match = re.search(r'<meta\s+name=["\']keywords["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
        keywords_str = unescape(keywords_match.group(1)) if keywords_match else ''
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip() and k.strip() != '筑居思']
        
        # 提取日期
        date_match = re.match(r'^(\d{4}-\d{2}-\d{2})', html_file.name)
        date = date_match.group(1) if date_match else None
        
        # 提取首图（灵魂封面图）- 优先查找位置A的定调图
        cover_image = None
        # 查找第一个 figure > img（位置A：灵魂定调图）
        figure_match = re.search(r'<figure[^>]*>\s*<img[^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE | re.DOTALL)
        if figure_match:
            cover_image = figure_match.group(1)
        else:
            # 如果没有figure，查找第一个 .post-content img 或 article img
            img_match = re.search(r'(?:<div[^>]*class=["\'][^"\']*post-content[^"\']*["\']|article)[^>]*>.*?<img[^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE | re.DOTALL)
            if img_match:
                cover_image = img_match.group(1)
        
        # 过滤占位符图片和无效路径
        if cover_image:
            cover_image_lower = cover_image.lower()
            if ('placeholder-image' in cover_image_lower or 
                'placeholder' in cover_image_lower or
                '${date}' in cover_image or
                '${' in cover_image):
                cover_image = None
        
        # 规范化图片路径（相对于blogs.html）
        if cover_image:
            # 如果图片路径是相对于博客文件的（../images/），需要转换为相对于blogs.html的路径
            if cover_image.startswith('../'):
                # 从 blogs/xxx.html 到 images/，需要去掉 ../
                cover_image = cover_image.replace('../', '')
            elif cover_image.startswith('./'):
                cover_image = cover_image.replace('./', '')
            elif not cover_image.startswith('http') and not cover_image.startswith('/'):
                # 相对路径，假设是相对于博客文件的
                cover_image = cover_image
        
        return {
            'filename': html_file.name,
            'title': title,
            'description': description,
            'keywords': keywords,
            'date': date,
            'cover_image': cover_image
        }
    except Exception as e:
        print(f"错误: 读取 {html_file.name} 失败: {e}")
        return None


def get_all_blogs() -> List[Dict]:
    """获取所有博客信息，按日期排序（最新的在前）"""
    blogs = []
    
    for html_file in sorted(BLOGS_DIR.glob('*.html'), reverse=True):
        info = extract_blog_info(html_file)
        if info:
            blogs.append(info)
    
    # 按日期排序（最新的在前）
    blogs.sort(key=lambda x: x['date'] if x['date'] else '', reverse=True)
    
    return blogs


def escape_html(text: str) -> str:
    """转义HTML特殊字符"""
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#39;'))


def update_blogs_html():
    """更新blogs.html文件"""
    blogs = get_all_blogs()
    
    if not blogs:
        print("警告: 没有找到博客文件")
        return
    
    # 读取现有blogs.html
    with open(BLOGS_HTML, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成新的博客链接HTML
    # 首页重构：只显示"灵魂黄金三角"（封面图、标题、关键词标签、日期）
    # 不显示简介段落，避免"认知过载"
    blog_links_html = []
    for blog in blogs:
        date_formatted = blog['date'] if blog['date'] else ''
        title_escaped = escape_html(blog['title'])
        keywords_escaped = ', '.join([escape_html(k) for k in blog['keywords'][:8]])  # 最多显示8个关键词
        
        # 生成关键词标签HTML（作为"灵魂黄金三角"的一部分）
        keywords_html = ''
        if keywords_escaped:
            keywords_html = f'<div class="blog-keywords"><span class="keywords-label">关键词：</span><span class="keywords-list">{keywords_escaped}</span></div>'
        
        # 生成封面图HTML（灵魂封面图）
        cover_html = ''
        if blog.get('cover_image'):
            cover_image_escaped = escape_html(blog['cover_image'])
            cover_html = f'''                                        <div class="blog-cover-wrap">
                                            <img class="blog-cover" src="{cover_image_escaped}" alt="{title_escaped}" loading="lazy">
                                        </div>'''
        
        # 首页：显示封面图、标题、日期、关键词（灵魂黄金三角）
        blog_links_html.append(f'''                                    <a href="blogs/{blog['filename']}" class="link-card">
                                        {cover_html}
                                        <div class="link-content">
                                            <h5>{title_escaped}</h5>
                                            <span class="date-tag">{date_formatted}</span>
                                            {keywords_html}
                                        </div>
                                    </a>''')
    
    # 查找并替换博客链接部分
    # 匹配从 <div class="links-grid"> 开始到 </div> 结束（但要匹配到正确的结束位置）
    # 需要匹配到 </div></div></div></section> 之前
    pattern = r'(<div class="links-grid">)(.*?)(\s*</div>\s*</div>\s*</div>\s*</section>)'
    
    # 生成替换内容
    new_links_content = '\n'.join(blog_links_html)
    replacement = r'\1\n' + new_links_content + '\n                                ' + r'\3'
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # 写回文件
        with open(BLOGS_HTML, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已更新 blogs.html，共 {len(blogs)} 篇文章")
    else:
        # 尝试更宽松的匹配
        pattern2 = r'(<div class="subcategory">\s*<div class="links-grid">)(.*?)(\s*</div>\s*</div>\s*</div>\s*</section>)'
        match2 = re.search(pattern2, content, re.DOTALL)
        if match2:
            content = re.sub(pattern2, replacement, content, flags=re.DOTALL)
            with open(BLOGS_HTML, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 已更新 blogs.html，共 {len(blogs)} 篇文章")
        else:
            print("⚠️  警告: 未找到匹配的链接网格区域")
            print("尝试查找的内容:")
            print(repr(content[content.find('<div class="links-grid">'):content.find('<div class="links-grid">')+500]))


def update_index_html():
    """更新index.html文件，只显示最新的3篇文章"""
    blogs = get_all_blogs()
    
    if not blogs:
        print("警告: 没有找到博客文件")
        return
    
    # 只取最新的3篇
    latest_blogs = blogs[:3]
    
    # 读取现有index.html
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成新的博客卡片HTML
    # 首页重构：只显示"灵魂黄金三角"（标题、日期、关键词）
    # 不显示简介段落，避免"认知过载"
    blog_cards_html = []
    for blog in latest_blogs:
        date_formatted = blog['date'] if blog['date'] else ''
        title_escaped = escape_html(blog['title'])
        keywords_escaped = ', '.join([escape_html(k) for k in blog['keywords'][:5]])  # 首页显示5个关键词
        
        # 生成关键词标签（可选显示）
        keywords_html = ''
        if keywords_escaped:
            keywords_html = f'<span class="keywords-tags">{keywords_escaped}</span>'
        
        blog_cards_html.append(f'''            <a href="blogs/{blog['filename']}" class="content-card">
              <h4>{title_escaped}</h4>
              <span class="date">{date_formatted}</span>
              {keywords_html}
            </a>''')
    
    # 查找并替换博客部分
    # 匹配从 <section class="content-section"> 到 </section> 的博客部分
    pattern = r'(<section class="content-section">\s*<h3>🧠 思 · 博客</h3>\s*<div class="content-cards">)(.*?)(\s*</div>\s*</section>)'
    
    # 生成替换内容
    new_cards_content = '\n'.join(blog_cards_html)
    replacement = r'\1\n' + new_cards_content + '\n          ' + r'\3'
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # 写回文件
        with open(INDEX_HTML, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已更新 index.html，显示最新的 {len(latest_blogs)} 篇文章")
    else:
        print("⚠️  警告: 未找到匹配的博客部分")


def main():
    """主函数"""
    print("=" * 60)
    print("更新博客列表页面")
    print("=" * 60)
    print()
    
    if not BLOGS_DIR.exists():
        print(f"❌ 错误: 博客目录不存在: {BLOGS_DIR}")
        return
    
    blogs = get_all_blogs()
    print(f"📁 找到 {len(blogs)} 篇博客文章")
    print()
    
    # 更新blogs.html
    update_blogs_html()
    
    # 更新index.html
    update_index_html()
    
    print()
    print("=" * 60)
    print("更新完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()

