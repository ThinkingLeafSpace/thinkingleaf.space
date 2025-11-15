#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
同步博客元数据脚本
从Obsidian Markdown文件中读取title、description、keywords，同步到HTML文件
并自动将中文标题转换为英文标题
"""

import os
import re
import json
import yaml
from pathlib import Path
from typing import Dict, Optional, Tuple
import sys

# 配置路径
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
CONFIG_FILE = SITE_ROOT / 'blog_config.json'
MAPPING_FILE = SCRIPT_DIR / 'title_slug_mapping.json'
TITLE_TRANSLATION_FILE = SCRIPT_DIR / 'title_translation_mapping.json'

# 排除的博客（不进行同步）
EXCLUDED_BLOGS = [
    "筑居思：37岁，我终于学会了\"安心去玩\"",
    "37岁，我终于学会了\"安心去玩\"",
    "learned-to-play-at-37"
]


def load_config() -> dict:
    """加载配置文件"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def load_title_mapping() -> Dict[str, str]:
    """加载标题到slug的映射"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def load_title_translation() -> Dict[str, str]:
    """加载中文标题到英文标题的翻译映射"""
    if TITLE_TRANSLATION_FILE.exists():
        with open(TITLE_TRANSLATION_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_title_translation(mapping: Dict[str, str]):
    """保存中文标题到英文标题的翻译映射"""
    with open(TITLE_TRANSLATION_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)


def translate_chinese_title(chinese_title: str, translation_mapping: Dict[str, str]) -> str:
    """
    将中文标题转换为英文标题
    优先使用映射表，如果没有则尝试自动翻译
    """
    # 如果已经在映射表中，直接返回
    if chinese_title in translation_mapping:
        return translation_mapping[chinese_title]
    
    # 尝试使用翻译API（如果有的话）
    # 这里先使用简单的规则，后续可以集成翻译API
    # 暂时返回空字符串，需要手动添加到映射表
    return ""


def extract_front_matter(content: str) -> Tuple[dict, str]:
    """提取YAML front matter"""
    front_matter = {}
    content_lines = content.split('\n')
    
    if content_lines[0].strip() == '---':
        yaml_lines = []
        i = 1
        while i < len(content_lines) and content_lines[i].strip() != '---':
            yaml_lines.append(content_lines[i])
            i += 1
        
        if i < len(content_lines):
            yaml_content = '\n'.join(yaml_lines)
            try:
                front_matter = yaml.safe_load(yaml_content) or {}
            except Exception as e:
                print(f"  警告: 解析YAML front matter失败: {e}")
            remaining_content = '\n'.join(content_lines[i+1:])
            return front_matter, remaining_content
    
    return front_matter, content


def extract_metadata_from_markdown(md_file: Path) -> Optional[dict]:
    """从Markdown文件中提取元数据"""
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        front_matter, _ = extract_front_matter(content)
        
        title = front_matter.get('title', '')
        if isinstance(title, dict):
            title = ''
        title = str(title).strip().strip('"').strip("'")
        
        description = front_matter.get('description', '')
        if isinstance(description, dict):
            description = ''
        description = str(description).strip().strip('"').strip("'")
        
        # category作为keywords的一部分
        category = front_matter.get('category', [])
        if isinstance(category, str):
            category = [category]
        elif not isinstance(category, list):
            category = []
        
        # keywords字段（如果有）
        keywords_list = front_matter.get('keywords', [])
        if isinstance(keywords_list, str):
            keywords_list = [keywords_list]
        elif not isinstance(keywords_list, list):
            keywords_list = []
        
        # 合并category和keywords
        all_keywords = list(set(category + keywords_list))
        
        return {
            'title': title,
            'description': description,
            'keywords': all_keywords
        }
    except Exception as e:
        print(f"  错误: 读取Markdown文件失败: {e}")
        return None


def find_matching_html_file(title: str, date: str = None) -> Optional[Path]:
    """根据标题查找匹配的HTML文件"""
    html_files = list(BLOGS_DIR.glob('*.html'))
    
    # 首先尝试精确匹配标题
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # 提取HTML中的标题
            title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
            if title_match:
                html_title = title_match.group(1).strip()
                html_title = html_title.replace(' - 筑居思', '').strip()
                
                # 如果标题匹配（去除"筑居思："前缀）
                clean_title = title.replace('筑居思：', '').replace('筑居思·', '').strip()
                clean_html_title = html_title.replace('筑居思：', '').replace('筑居思·', '').strip()
                
                if clean_title == clean_html_title or title == html_title:
                    return html_file
        except Exception:
            continue
    
    # 如果精确匹配失败，尝试根据日期和文件名匹配
    if date:
        date_prefix = date.replace('-', '-')
        for html_file in html_files:
            if html_file.name.startswith(date_prefix):
                return html_file
    
    return None


def update_html_metadata(html_file: Path, metadata: dict, translation_mapping: Dict[str, str]):
    """更新HTML文件中的元数据"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        title = metadata['title']
        description = metadata['description']
        keywords = metadata['keywords']
        
        # 检查是否在排除列表中
        if any(excluded in title for excluded in EXCLUDED_BLOGS):
            print(f"  跳过（在排除列表中）")
            return False
        
        # 生成英文标题（如果需要）
        english_title = translate_chinese_title(title, translation_mapping)
        if not english_title:
            # 如果没有翻译，使用中文标题
            english_title = title
        
        # 更新title标签
        title_pattern = r'<title[^>]*>.*?</title>'
        new_title = f'<title>{title} - 筑居思</title>'
        html_content = re.sub(title_pattern, new_title, html_content, flags=re.IGNORECASE | re.DOTALL)
        
        # 更新description meta标签
        desc_pattern = r'<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        new_desc = f'<meta name="description" content="{description}">'
        if re.search(desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(desc_pattern, new_desc, html_content, flags=re.IGNORECASE)
        else:
            # 如果没有description标签，在title后面添加
            html_content = re.sub(r'(<title[^>]*>.*?</title>)', r'\1\n    ' + new_desc, html_content, flags=re.IGNORECASE | re.DOTALL)
        
        # 更新keywords meta标签
        keywords_str = ', '.join(keywords)
        if not keywords_str.endswith('筑居思'):
            keywords_str += ', 筑居思'
        
        keywords_pattern = r'<meta\s+name=["\']keywords["\']\s+content=["\'][^"\']*["\']\s*/?>'
        new_keywords = f'<meta name="keywords" content="{keywords_str}">'
        if re.search(keywords_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(keywords_pattern, new_keywords, html_content, flags=re.IGNORECASE)
        else:
            # 如果没有keywords标签，在description后面添加
            html_content = re.sub(r'(<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>)', r'\1\n    ' + new_keywords, html_content, flags=re.IGNORECASE)
        
        # 更新Open Graph和Twitter卡片
        og_title_pattern = r'<meta\s+property=["\']og:title["\']\s+content=["\'][^"\']*["\']\s*/?>'
        og_desc_pattern = r'<meta\s+property=["\']og:description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        twitter_title_pattern = r'<meta\s+name=["\']twitter:title["\']\s+content=["\'][^"\']*["\']\s*/?>'
        twitter_desc_pattern = r'<meta\s+name=["\']twitter:description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        
        new_og_title = f'<meta property="og:title" content="{title} - 筑居思">'
        new_og_desc = f'<meta property="og:description" content="{description}">'
        new_twitter_title = f'<meta name="twitter:title" content="{title} - 筑居思">'
        new_twitter_desc = f'<meta name="twitter:description" content="{description}">'
        
        if re.search(og_title_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(og_title_pattern, new_og_title, html_content, flags=re.IGNORECASE)
        if re.search(og_desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(og_desc_pattern, new_og_desc, html_content, flags=re.IGNORECASE)
        if re.search(twitter_title_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(twitter_title_pattern, new_twitter_title, html_content, flags=re.IGNORECASE)
        if re.search(twitter_desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(twitter_desc_pattern, new_twitter_desc, html_content, flags=re.IGNORECASE)
        
        # 写回文件
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return True
    except Exception as e:
        print(f"  错误: 更新HTML文件失败: {e}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("博客元数据同步工具")
    print("=" * 60)
    print()
    
    # 加载配置
    config = load_config()
    obsidian_vault = Path(config.get('obsidian_vault', ''))
    
    if not obsidian_vault.exists():
        print(f"❌ 错误: Obsidian库路径不存在: {obsidian_vault}")
        print("请检查 blog_config.json 中的 'obsidian_vault' 配置")
        return
    
    # 加载映射表
    translation_mapping = load_title_translation()
    
    # 获取所有Markdown文件
    md_files = list(obsidian_vault.glob('*.md'))
    
    if not md_files:
        print("❌ 未找到任何Markdown文件")
        return
    
    print(f"📁 找到 {len(md_files)} 个Markdown文件")
    print()
    
    success_count = 0
    skip_count = 0
    failed_count = 0
    
    for md_file in sorted(md_files):
        print(f"处理: {md_file.name}")
        print("-" * 60)
        
        # 提取元数据
        metadata = extract_metadata_from_markdown(md_file)
        if not metadata or not metadata.get('title'):
            print("  跳过（无法提取元数据）")
            skip_count += 1
            print()
            continue
        
        title = metadata['title']
        description = metadata['description']
        keywords = metadata['keywords']
        
        print(f"  标题: {title}")
        print(f"  简介: {description[:50]}..." if len(description) > 50 else f"  简介: {description}")
        print(f"  关键词: {', '.join(keywords[:5])}..." if len(keywords) > 5 else f"  关键词: {', '.join(keywords)}")
        
        # 查找匹配的HTML文件
        # 从文件名提取日期
        date_match = re.match(r'^(\d{4}-\d{2}-\d{2})', md_file.name)
        date = date_match.group(1) if date_match else None
        
        html_file = find_matching_html_file(title, date)
        
        if not html_file:
            print(f"  ⚠️  警告: 未找到匹配的HTML文件")
            skip_count += 1
            print()
            continue
        
        print(f"  匹配HTML: {html_file.name}")
        
        # 更新HTML文件
        if update_html_metadata(html_file, metadata, translation_mapping):
            success_count += 1
            print("  ✅ 成功同步")
        else:
            failed_count += 1
            print("  ❌ 同步失败")
        
        print()
    
    print("=" * 60)
    print(f"同步完成！")
    print(f"  成功: {success_count}")
    print(f"  跳过: {skip_count}")
    print(f"  失败: {failed_count}")
    print("=" * 60)
    
    # 保存翻译映射表
    if translation_mapping:
        save_title_translation(translation_mapping)
        print(f"\n💾 已保存翻译映射到: {TITLE_TRANSLATION_FILE}")


if __name__ == '__main__':
    main()

