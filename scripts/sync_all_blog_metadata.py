#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
同步所有博客的标题、简介、关键词脚本
从HTML文件中读取当前的标题、简介、关键词，同步更新所有相关的meta标签
并自动为中文标题生成英文标题（除了排除的博客）
"""

import re
import json
from pathlib import Path
from typing import Dict, Optional, Tuple
import html

# 配置路径
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent
BLOGS_DIR = SITE_ROOT / 'blogs'
TITLE_TRANSLATION_FILE = SCRIPT_DIR / 'title_translation_mapping.json'

# 排除的博客（不进行英文标题转换）
EXCLUDED_BLOGS = [
    "筑居思：37岁，我终于学会了\"安心去玩\"",
    "37岁，我终于学会了\"安心去玩\"",
    "learned-to-play-at-37",
    "2025-11-14-learned-to-play-at-37.html"
]


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
    
    标题格式：筑居思·[分类]：[标题内容]
    例如：筑居思·基准：一份2022年的"灵魂快照"（普鲁斯特问卷）
    """
    # 标准化标题（统一引号格式，便于匹配）
    normalized_title = chinese_title.replace('"', '"').replace('"', '"').replace(''', "'").replace(''', "'")
    
    # 如果已经在映射表中，直接返回
    if chinese_title in translation_mapping:
        return translation_mapping[chinese_title]
    if normalized_title in translation_mapping:
        return translation_mapping[normalized_title]
    
    # 提取"筑居思·[分类]："格式
    # 例如："筑居思·基准：" -> "基准"
    category_match = re.match(r'筑居思·([^：:]+)[：:]', chinese_title)
    category = category_match.group(1) if category_match else None
    
    # 移除"筑居思："或"筑居思·[分类]："前缀，保留标题内容
    clean_title = chinese_title.replace('筑居思：', '').replace('筑居思·', '').strip()
    if category:
        clean_title = re.sub(rf'^{re.escape(category)}[：:]\s*', '', clean_title)
    clean_normalized = normalized_title.replace('筑居思：', '').replace('筑居思·', '').strip()
    if category:
        clean_normalized = re.sub(rf'^{re.escape(category)}[：:]\s*', '', clean_normalized)
    
    # 分类翻译映射（"筑居思·[分类]："格式）
    category_translations = {
        '基准': 'Baseline',
        '回响': 'Echo',
        '缘起': 'Origin',
        '算法': 'Algorithm',
        '刊物': 'Newsletter',
        '哲思': 'Philosophy',
        'Vibe': 'Vibe',
        '成长': 'Growth',
        '修行': 'Practice',
        '实践': 'Practice',
    }
    
    # 常见词汇映射（用于简单翻译）
    common_translations = {
        # 完整标题匹配
        '写在19岁': 'Writing to 19-Year-Old Self',
        '筑居思·缘起：我的思想启蒙与"灵魂栖居"': 'Origin: My Intellectual Enlightenment and "Soul Dwelling"',
        '筑居思·算法：一个"蛰伏"者的"阅读顺序"': 'Algorithm: A "Hibernator\'s" Reading Order',
        '筑居思·刊物 (No.01)：我的"心流"工具箱与"效率"实验': 'Newsletter (No.01): My "Flow" Toolkit and "Efficiency" Experiment',
        '筑居思：我从KK的103条忠告中，重构了我的"人生算法"': 'Reconstructing My "Life Algorithm" from KK\'s 103 Pieces of Advice',
        '筑居思·哲思：以人文主义为烛光，对抗灵魂的"熵增"': 'Philosophy: Using Humanism as Candlelight Against the "Entropy Increase" of the Soul',
        '筑居思·哲思：我无法用别人的答案，回应我的人生': 'Philosophy: I Cannot Respond to My Life with Others\' Answers',
        '好久不见，最近在外太空种下了小花': 'Hello Again, Little Flowers in Space',
        '筑居思·Vibe：我的人文、科技与"白日梦"': 'Vibe: My Humanities, Technology, and "Daydreams"',
        '筑居思·哲思：你是在"过生活"，还是在"计划你的传记"？': 'Philosophy: Are You "Living Life" or "Planning Your Biography"?',
        '筑居思·算法：重构"决策"的38个灵魂拷问': 'Algorithm: 38 Soul-Searching Questions to Reconstruct "Decision-Making"',
        '筑居思·成长："π型人才"的"终身学习"蓝图': 'Growth: The "Lifelong Learning" Blueprint for "π-Shaped Talents"',
        '半载观想小记：在大理、在内观禅修的路上': 'Half-Year Mindfulness Journey in Dali',
        '筑居思·修行：我24岁学到的"灵魂自洽"SOP': 'Practice: The "Soul Self-Consistency" SOP I Learned at 24',
        '筑居思·实践：或许设计实验就是容易失败，对吗？': 'Practice: Perhaps Design Experiments Tend to Fail, Right?',
        '创造性思维': 'Creative Thinking',
        '筑居思·算法：RSS——在信息迷雾中构建"认知绿洲"的艺术': 'Algorithm: RSS - The Art of Building "Cognitive Oases" in the Information Fog',
        '在禅堂里，我遇见了所有人——记第二次内观禅修的结缘': 'Meeting Everyone in the Meditation Hall',
        # 新格式：筑居思·基准
        '筑居思·基准：一份2022年的"灵魂快照"（普鲁斯特问卷）': 'Baseline: A 2022 "Soul Snapshot" (Proust Questionnaire)',
        # 新格式：筑居思·回响
        '筑居思·回响：来自19岁的确认——"你成为了我想象中的大人"': 'Echo: Confirmation from 19-Year-Old Self - "You Became the Adult I Imagined"',
        # 部分匹配（用于匹配标题中的关键部分）
        '如果在夏夜一个旅人': 'If on a Summer Night a Traveler',
        '听山风': 'Listening to Mountain Wind',
        '重新觉察自我': 'Reawakening Self-Awareness',
        '永远不要停止想象': 'Never Stop Imagining',
        '答普鲁斯克问卷': 'Answering the Proust Questionnaire',
        '好文分享丨停下来休息一下': 'Good Article Sharing: Stop and Rest',
        '如何面对重大人生决定': 'How to Face Major Life Decisions',
        '一直游到海水变蓝': 'Swimming Till the Sea Turns Blue',
        '24岁学会的24件事': '24 Things Learned at 24',
        '或许设计实验就是容易失败，对吗？': 'Design Experiments Tend to Fail',
        '2025年了为什么我还是推荐用RSS订阅内容': 'Why I Still Recommend RSS Subscription in 2025',
        '和19岁的自己对话': 'Talking to 19-Year-Old Self',
    }
    
    # 尝试匹配完整标题（带前缀）
    if chinese_title in common_translations:
        return common_translations[chinese_title]
    if normalized_title in common_translations:
        return common_translations[normalized_title]
    
    # 尝试匹配完整标题（不带前缀）
    if clean_title in common_translations:
        return common_translations[clean_title]
    if clean_normalized in common_translations:
        return common_translations[clean_normalized]
    
    # 尝试部分匹配（如果标题包含某个关键词）
    for key, value in common_translations.items():
        normalized_key = key.replace('"', '"').replace('"', '"').replace(''', "'").replace(''', "'")
        if (key in chinese_title or key in clean_title or 
            normalized_key in normalized_title or normalized_key in clean_normalized):
            return value
    
    # 如果有分类，尝试使用分类翻译格式
    # 格式：[分类]: [标题内容翻译]
    if category and category in category_translations:
        category_en = category_translations[category]
        # 尝试翻译标题内容部分
        content_translation = clean_title  # 默认使用原内容
        # 这里可以添加更多内容翻译逻辑
        return f"{category_en}: {content_translation}"
    
    # 如果无法翻译，返回空字符串（需要手动添加到映射表）
    return ""


def extract_metadata_from_html(html_file: Path) -> Optional[Dict]:
    """从HTML文件中提取元数据"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 提取title标签
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
        if not title_match:
            return None
        
        title = title_match.group(1).strip()
        # 移除" - 筑居思"后缀
        title = title.replace(' - 筑居思', '').strip()
        title = html.unescape(title)
        
        # 提取description meta标签
        desc_match = re.search(
            r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']',
            html_content,
            re.IGNORECASE
        )
        description = desc_match.group(1) if desc_match else ''
        description = html.unescape(description)
        
        # 提取keywords meta标签
        keywords_match = re.search(
            r'<meta\s+name=["\']keywords["\']\s+content=["\'](.*?)["\']',
            html_content,
            re.IGNORECASE
        )
        keywords_str = keywords_match.group(1) if keywords_match else ''
        keywords_str = html.unescape(keywords_str)
        
        # 解析关键词列表（移除"筑居思"如果存在）
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]
        keywords = [k for k in keywords if k != '筑居思']
        
        return {
            'title': title,
            'description': description,
            'keywords': keywords
        }
    except Exception as e:
        print(f"  错误: 读取HTML文件失败: {e}")
        return None


def escape_html(text: str) -> str:
    """转义HTML特殊字符"""
    return html.escape(text, quote=True)


def update_html_metadata(html_file: Path, metadata: dict, translation_mapping: Dict[str, str]) -> bool:
    """更新HTML文件中的元数据"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        title = metadata['title']
        description = metadata['description']
        keywords = metadata['keywords']
        
        # 检查是否在排除列表中
        is_excluded = any(excluded in title or excluded in html_file.name for excluded in EXCLUDED_BLOGS)
        
        # 生成英文标题（如果需要）
        english_title = ""
        if not is_excluded:
            english_title = translate_chinese_title(title, translation_mapping)
            if english_title:
                # 保存到映射表
                translation_mapping[title] = english_title
                print(f"  📝 英文标题: {english_title}")
            else:
                print(f"  ⚠️  警告: 未找到英文标题翻译，请手动添加到映射表")
        
        # 转义特殊字符
        title_escaped = escape_html(title)
        desc_escaped = escape_html(description)
        
        # 更新title标签
        title_pattern = r'<title[^>]*>.*?</title>'
        new_title = f'<title>{title_escaped} - 筑居思</title>'
        html_content = re.sub(title_pattern, new_title, html_content, flags=re.IGNORECASE | re.DOTALL)
        
        # 更新description meta标签
        desc_pattern = r'<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        new_desc = f'<meta name="description" content="{desc_escaped}">'
        if re.search(desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(desc_pattern, new_desc, html_content, flags=re.IGNORECASE)
        else:
            # 如果没有description标签，在title后面添加
            html_content = re.sub(
                r'(<title[^>]*>.*?</title>)',
                r'\1\n    ' + new_desc,
                html_content,
                flags=re.IGNORECASE | re.DOTALL
            )
        
        # 更新keywords meta标签
        keywords_list = keywords.copy()
        if '筑居思' not in keywords_list:
            keywords_list.append('筑居思')
        keywords_str = ', '.join(keywords_list)
        keywords_escaped = escape_html(keywords_str)
        
        keywords_pattern = r'<meta\s+name=["\']keywords["\']\s+content=["\'][^"\']*["\']\s*/?>'
        new_keywords = f'<meta name="keywords" content="{keywords_escaped}">'
        if re.search(keywords_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(keywords_pattern, new_keywords, html_content, flags=re.IGNORECASE)
        else:
            # 如果没有keywords标签，在description后面添加
            html_content = re.sub(
                r'(<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>)',
                r'\1\n    ' + new_keywords,
                html_content,
                flags=re.IGNORECASE
            )
        
        # 更新Open Graph和Twitter卡片
        og_title_pattern = r'<meta\s+property=["\']og:title["\']\s+content=["\'][^"\']*["\']\s*/?>'
        og_desc_pattern = r'<meta\s+property=["\']og:description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        og_url_pattern = r'<meta\s+property=["\']og:url["\']\s+content=["\'][^"\']*["\']\s*/?>'
        og_type_pattern = r'<meta\s+property=["\']og:type["\']\s+content=["\'][^"\']*["\']\s*/?>'
        twitter_title_pattern = r'<meta\s+name=["\']twitter:title["\']\s+content=["\'][^"\']*["\']\s*/?>'
        twitter_desc_pattern = r'<meta\s+name=["\']twitter:description["\']\s+content=["\'][^"\']*["\']\s*/?>'
        twitter_card_pattern = r'<meta\s+name=["\']twitter:card["\']\s+content=["\'][^"\']*["\']\s*/?>'
        
        # 提取URL
        url_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        if not url_match:
            # 从文件名生成URL
            url = f"https://thinkingleaf.space/blogs/{html_file.name}"
        else:
            url = url_match.group(1)
        
        new_og_title = f'<meta property="og:title" content="{title_escaped} - 筑居思">'
        new_og_desc = f'<meta property="og:description" content="{desc_escaped}">'
        new_og_url = f'<meta property="og:url" content="{url}">'
        new_og_type = '<meta property="og:type" content="article">'
        new_twitter_title = f'<meta name="twitter:title" content="{title_escaped} - 筑居思">'
        new_twitter_desc = f'<meta name="twitter:description" content="{desc_escaped}">'
        new_twitter_card = '<meta name="twitter:card" content="summary">'
        
        # 更新或添加Open Graph标签
        if re.search(og_title_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(og_title_pattern, new_og_title, html_content, flags=re.IGNORECASE)
        else:
            # 在keywords后面添加
            html_content = re.sub(
                r'(<meta\s+name=["\']keywords["\']\s+content=["\'][^"\']*["\']\s*/?>)',
                r'\1\n    ' + new_og_type + '\n    ' + new_og_url + '\n    ' + new_og_title + '\n    ' + new_og_desc,
                html_content,
                flags=re.IGNORECASE,
                count=1
            )
        
        if re.search(og_desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(og_desc_pattern, new_og_desc, html_content, flags=re.IGNORECASE)
        
        # 更新或添加Twitter标签
        if re.search(twitter_title_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(twitter_title_pattern, new_twitter_title, html_content, flags=re.IGNORECASE)
        else:
            # 在og:description后面添加
            html_content = re.sub(
                r'(<meta\s+property=["\']og:description["\']\s+content=["\'][^"\']*["\']\s*/?>)',
                r'\1\n    ' + new_twitter_card + '\n    ' + new_twitter_title + '\n    ' + new_twitter_desc,
                html_content,
                flags=re.IGNORECASE,
                count=1
            )
        
        if re.search(twitter_desc_pattern, html_content, re.IGNORECASE):
            html_content = re.sub(twitter_desc_pattern, new_twitter_desc, html_content, flags=re.IGNORECASE)
        
        # 更新h1标题（如果存在）
        # 尝试匹配带class="post-title"的h1
        h1_pattern = r'<h1[^>]*class=["\']post-title["\'][^>]*>.*?</h1>'
        h1_match = re.search(h1_pattern, html_content, re.IGNORECASE | re.DOTALL)
        if h1_match:
            new_h1 = f'<h1 class="post-title">{title_escaped}</h1>'
            html_content = re.sub(h1_pattern, new_h1, html_content, flags=re.IGNORECASE | re.DOTALL)
        else:
            # 尝试匹配在post-header内的h1
            header_h1_pattern = r'(<header[^>]*class=["\']post-header["\'][^>]*>.*?<h1[^>]*>).*?(</h1>)'
            header_h1_match = re.search(header_h1_pattern, html_content, re.IGNORECASE | re.DOTALL)
            if header_h1_match:
                new_h1 = f'{header_h1_match.group(1)}{title_escaped}{header_h1_match.group(2)}'
                html_content = re.sub(header_h1_pattern, lambda m: f'{m.group(1)}{title_escaped}{m.group(2)}', html_content, flags=re.IGNORECASE | re.DOTALL)
            else:
                # 尝试匹配class="page-title"的h1
                page_h1_pattern = r'<h1[^>]*class=["\']page-title["\'][^>]*>.*?</h1>'
                page_h1_match = re.search(page_h1_pattern, html_content, re.IGNORECASE | re.DOTALL)
                if page_h1_match:
                    new_h1 = f'<h1 class="page-title">{title_escaped}</h1>'
                    html_content = re.sub(page_h1_pattern, new_h1, html_content, flags=re.IGNORECASE | re.DOTALL)
        
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
    
    if not BLOGS_DIR.exists():
        print(f"❌ 错误: 博客目录不存在: {BLOGS_DIR}")
        return
    
    # 加载翻译映射表
    translation_mapping = load_title_translation()
    
    # 获取所有HTML文件
    html_files = sorted(BLOGS_DIR.glob('*.html'))
    
    if not html_files:
        print("❌ 未找到任何博客HTML文件")
        return
    
    print(f"📁 找到 {len(html_files)} 个博客文件")
    print()
    
    success_count = 0
    skip_count = 0
    failed_count = 0
    
    for html_file in html_files:
        print(f"处理: {html_file.name}")
        print("-" * 60)
        
        # 提取元数据
        metadata = extract_metadata_from_html(html_file)
        if not metadata or not metadata.get('title'):
            print("  跳过（无法提取元数据）")
            skip_count += 1
            print()
            continue
        
        title = metadata['title']
        description = metadata['description']
        keywords = metadata['keywords']
        
        print(f"  标题: {title}")
        print(f"  简介: {description[:80]}..." if len(description) > 80 else f"  简介: {description}")
        print(f"  关键词: {', '.join(keywords[:8])}..." if len(keywords) > 8 else f"  关键词: {', '.join(keywords)}")
        
        # 检查是否在排除列表中
        is_excluded = any(excluded in title or excluded in html_file.name for excluded in EXCLUDED_BLOGS)
        if is_excluded:
            print(f"  ⏭️  跳过（在排除列表中，不生成英文标题）")
        
        # 更新HTML文件
        if update_html_metadata(html_file, metadata, translation_mapping):
            success_count += 1
            print("  ✅ 成功同步")
        else:
            failed_count += 1
            print("  ❌ 同步失败")
        
        print()
    
    # 保存翻译映射表
    save_title_translation(translation_mapping)
    
    print("=" * 60)
    print(f"同步完成！")
    print(f"  成功: {success_count}")
    print(f"  跳过: {skip_count}")
    print(f"  失败: {failed_count}")
    print("=" * 60)
    
    if translation_mapping:
        print(f"\n💾 已保存翻译映射到: {TITLE_TRANSLATION_FILE}")


if __name__ == '__main__':
    main()

