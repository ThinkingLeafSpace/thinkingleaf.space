#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动为博客文章添加关键词
基于文章内容进行语义识别和关键词提取
"""

import os
import re
import html
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
from html import unescape
import sys

# 尝试导入jieba，如果没有则使用简单的方法
try:
    import jieba
    import jieba.analyse
    JIEBA_AVAILABLE = True
except ImportError:
    JIEBA_AVAILABLE = False
    print("警告: jieba库未安装，将使用简单关键词提取方法")
    print("建议安装: pip install jieba")

# 停用词列表（常见无意义词）
STOP_WORDS = {
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
    '为', '而', '与', '或', '及', '等', '这', '那', '他', '她', '它', '我们', '你们', '他们', '它们', '这个', '那个', '这些', '那些',
    '可以', '应该', '能够', '可能', '如果', '但是', '虽然', '因为', '所以', '然后', '而且', '还是', '就是', '只是', '就是', '其实',
    '什么', '怎么', '为什么', '如何', '多少', '几个', '哪些', '那么', '这样', '那样', '这里', '那里', '这时', '那时',
    '但是', '可是', '不过', '然而', '因此', '所以', '于是', '然后', '接着', '最后', '首先', '其次', '另外', '此外',
    '非常', '特别', '十分', '很', '比较', '更加', '最', '更', '还', '还', '再', '又', '也', '都', '全', '全部', '所有', '整个',
    '通过', '根据', '按照', '依照', '关于', '对于', '至于', '至于', '至于', '由于', '因为', '为了', '以便', '以致',
    '文章', '内容', '问题', '方法', '方式', '过程', '结果', '原因', '时候', '时间', '地方', '方面', '情况', '事情', '东西'
}

# 领域相关的基础关键词
DOMAIN_KEYWORDS = {
    '禅修': ['内观', 'Vipassana', '正念', '冥想', '禅修', '修行', '觉知', '观想', '正念练习', '佛教', '佛法'],
    '设计': ['设计', 'UI设计', 'UX设计', '用户体验', '界面设计', '交互设计', '视觉设计', '设计思维', '创意设计'],
    '思考': ['思考', '反思', '哲学', '人生', '生活', '成长', '自我', '觉察', '认知', '思维', '想法'],
    '技术': ['技术', '编程', '开发', '代码', '前端', '后端', '算法', '工具', '软件', '系统'],
    '旅行': ['旅行', '旅游', '大理', '云南', '风景', '探索', '体验', '旅途'],
    '阅读': ['阅读', '读书', '书籍', '文学', '写作', '文字', '文章'],
    '工作': ['工作', '职业', '职场', '工作坊', '项目', '实践', '经验'],
}

class HTMLMetaParser(HTMLParser):
    """解析HTML中的meta标签和内容"""
    
    def __init__(self):
        super().__init__()
        self.meta_tags = {}
        self.title = ''
        self.description = ''
        self.keywords = ''
        self.content = ''
        self.in_head = False
        self.in_title = False
        self.in_content = False
        self.current_tag = None
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'head':
            self.in_head = True
        elif tag == 'title' and self.in_head:
            self.in_title = True
        elif tag == 'meta' and self.in_head:
            name = attrs_dict.get('name', '')
            property_attr = attrs_dict.get('property', '')
            content = attrs_dict.get('content', '')
            
            if name == 'description':
                self.description = content
            elif name == 'keywords':
                self.keywords = content
            elif property_attr == 'og:description':
                if not self.description:
                    self.description = content
        elif tag in ['main', 'article', '.post-content', '.article-body', '.content']:
            self.in_content = True
            self.current_tag = tag
            
    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        elif tag == 'title':
            self.in_title = False
        elif tag in ['main', 'article']:
            self.in_content = False
            self.current_tag = None
            
    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_content:
            self.content += data + ' '


def extract_text_from_html(html_content):
    """从HTML中提取纯文本内容"""
    # 移除script和style标签
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # 提取title
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ''
    title = re.sub(r'\s+', ' ', html.unescape(title))
    title = title.replace(' - 筑居思', '').strip()
    
    # 提取description
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html_content, re.IGNORECASE)
    description = desc_match.group(1) if desc_match else ''
    
    # 提取正文内容 - 尝试多个选择器
    content = ''
    content_patterns = [
        r'<div\s+class=["\']post-content["\']>(.*?)</div>',
        r'<div\s+class=["\']article-body["\']>(.*?)</div>',
        r'<article[^>]*>(.*?)</article>',
        r'<main[^>]*>(.*?)</main>',
    ]
    
    for pattern in content_patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE | re.DOTALL)
        if matches:
            content = ' '.join(matches)
            break
    
    # 如果还没找到，提取body中的文本
    if not content:
        body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.IGNORECASE | re.DOTALL)
        if body_match:
            body_content = body_match.group(1)
            # 移除导航、侧边栏等
            body_content = re.sub(r'<nav[^>]*>.*?</nav>', '', body_content, flags=re.DOTALL | re.IGNORECASE)
            body_content = re.sub(r'<div[^>]*class=["\'][^"\']*sidebar[^"\']*["\'][^>]*>.*?</div>', '', body_content, flags=re.DOTALL | re.IGNORECASE)
            body_content = re.sub(r'<footer[^>]*>.*?</footer>', '', body_content, flags=re.DOTALL | re.IGNORECASE)
            content = body_content
    
    # 移除HTML标签
    text = re.sub(r'<[^>]+>', ' ', content)
    # 解码HTML实体
    text = html.unescape(text)
    # 清理空白字符
    text = re.sub(r'\s+', ' ', text).strip()
    
    return title, description, text


def extract_keywords_jieba(text, title='', description='', top_k=10):
    """使用jieba提取关键词"""
    if not text:
        return []
    
    # 合并标题、描述和正文（标题和描述权重更高）
    full_text = title * 5 + ' ' + description * 3 + ' ' + text
    
    # 提取关键词
    keywords = jieba.analyse.extract_tags(
        full_text,
        topK=top_k * 3,  # 提取更多，然后过滤
        withWeight=False,
        allowPOS=('n', 'nr', 'ns', 'nt', 'nz', 'vn', 'v', 'a', 'an')  # 名词、动词、形容词
    )
    
    # 从标题中提取重要词汇（优先）
    title_keywords = []
    if title:
        title_seg = jieba.cut(title, cut_all=False)
        for word in title_seg:
            word = word.strip()
            if len(word) >= 2 and word not in STOP_WORDS and word.isalnum():
                # 过滤纯数字和单字符
                if not word.isdigit() and not re.match(r'^[a-zA-Z]$', word):
                    title_keywords.append(word)
    
    # 过滤停用词和过短的词
    filtered_keywords = []
    seen = set()
    
    # 首先添加标题中的关键词
    for kw in title_keywords[:5]:
        if kw not in seen:
            filtered_keywords.append(kw)
            seen.add(kw)
    
    # 然后添加从全文提取的关键词
    for kw in keywords:
        kw = kw.strip()
        if (len(kw) >= 2 and 
            kw not in STOP_WORDS and 
            kw not in seen and
            kw.isalnum() and
            not kw.isdigit() and
            not re.match(r'^[a-zA-Z]$', kw)):
            # 过滤无意义的片段
            if not re.match(r'^[的了是在有和就]$', kw):
                filtered_keywords.append(kw)
                seen.add(kw)
        if len(filtered_keywords) >= top_k:
            break
    
    return filtered_keywords[:top_k]


def extract_keywords_simple(text, title='', description='', top_k=10):
    """简单的关键词提取方法（不使用jieba）"""
    keywords = []
    seen = set()
    
    # 优先从标题提取关键词（2-6字中文词，3+字母英文词）
    if title:
        title_chinese = re.findall(r'[\u4e00-\u9fa5]{2,6}', title)
        title_english = re.findall(r'\b[a-zA-Z]{3,}\b', title)
        for word in title_chinese + title_english:
            word = word.strip().lower()
            if word not in STOP_WORDS and word not in seen and len(word) >= 2:
                keywords.append(word)
                seen.add(word)
    
    # 从描述中提取
    if description:
        desc_chinese = re.findall(r'[\u4e00-\u9fa5]{2,6}', description)
        desc_english = re.findall(r'\b[a-zA-Z]{3,}\b', description)
        for word in desc_chinese + desc_english:
            word = word.strip().lower()
            if word not in STOP_WORDS and word not in seen and len(word) >= 2:
                keywords.append(word)
                seen.add(word)
    
    # 从正文中提取（词频统计）
    if text:
        full_text = text.lower()
        chinese_words = re.findall(r'[\u4e00-\u9fa5]{2,6}', full_text)
        english_words = re.findall(r'\b[a-zA-Z]{3,}\b', full_text)
        
        word_counts = Counter(chinese_words + english_words)
        
        for word, count in word_counts.most_common(top_k * 2):
            word = word.strip()
            if (word not in STOP_WORDS and 
                word not in seen and 
                len(word) >= 2 and 
                count >= 2 and
                not word.isdigit()):
                keywords.append(word)
                seen.add(word)
            if len(keywords) >= top_k:
                break
    
    return keywords[:top_k]


def extract_keywords(text, title='', description='', top_k=10):
    """提取关键词的主函数"""
    if JIEBA_AVAILABLE:
        return extract_keywords_jieba(text, title, description, top_k)
    else:
        return extract_keywords_simple(text, title, description, top_k)


def add_domain_keywords(keywords, text, title='', description=''):
    """根据内容添加领域相关关键词"""
    full_text = (title + ' ' + description + ' ' + text).lower()
    added_keywords = []
    
    for domain, domain_kws in DOMAIN_KEYWORDS.items():
        for kw in domain_kws:
            kw_lower = kw.lower()
            if kw in full_text or kw_lower in full_text:
                if kw not in keywords and kw not in added_keywords:
                    added_keywords.append(kw)
    
    # 将领域关键词添加到前面（权重更高），但不超过3个
    domain_kws = added_keywords[:3]
    # 合并，去重，保持顺序
    result = []
    seen = set()
    for kw in domain_kws + keywords:
        if kw not in seen:
            result.append(kw)
            seen.add(kw)
    
    return result


def update_html_keywords(file_path, keywords):
    """更新HTML文件中的keywords meta标签"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 生成关键词字符串
        keywords_str = ', '.join(keywords)
        keywords_str += ', 筑居思'  # 添加网站名称
        
        # 检查是否已有keywords标签
        keywords_pattern = r'<meta\s+name=["\']keywords["\']\s+content=["\'][^"\']*["\']\s*/?>'
        
        if re.search(keywords_pattern, content, re.IGNORECASE):
            # 更新现有的keywords标签
            new_keywords_tag = f'<meta name="keywords" content="{keywords_str}">'
            content = re.sub(keywords_pattern, new_keywords_tag, content, flags=re.IGNORECASE)
        else:
            # 在description后面添加keywords标签
            desc_pattern = r'(<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>)'
            new_keywords_tag = f'\n    <meta name="keywords" content="{keywords_str}">'
            
            if re.search(desc_pattern, content, re.IGNORECASE):
                content = re.sub(desc_pattern, r'\1' + new_keywords_tag, content, flags=re.IGNORECASE)
            else:
                # 如果没有description，在title后面添加
                title_pattern = r'(<title[^>]*>.*?</title>)'
                if re.search(title_pattern, content, re.IGNORECASE | re.DOTALL):
                    content = re.sub(title_pattern, r'\1' + new_keywords_tag, content, flags=re.IGNORECASE | re.DOTALL)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"错误: 更新 {file_path} 失败: {e}")
        return False


def process_blog_file(file_path):
    """处理单个博客文件"""
    print(f"处理: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 提取文本内容
        title, description, text = extract_text_from_html(html_content)
        
        if not text and not title:
            print(f"  警告: 无法提取内容，跳过")
            return False
        
        # 提取关键词
        keywords = extract_keywords(text, title, description, top_k=10)
        
        # 添加领域关键词
        keywords = add_domain_keywords(keywords, text, title, description)
        
        # 去重并限制数量（保留最多12个，最终选择10个）
        keywords = list(dict.fromkeys(keywords))[:12]
        
        # 如果关键词太少，尝试从描述中提取更多
        if len(keywords) < 8 and description:
            desc_words = re.findall(r'[\u4e00-\u9fa5]{2,6}|\b[a-zA-Z]{3,}\b', description)
            for word in desc_words:
                word = word.strip()
                if word not in keywords and word not in STOP_WORDS and len(word) >= 2:
                    keywords.append(word)
                if len(keywords) >= 10:
                    break
        
        keywords = keywords[:10]  # 最终限制为10个
        
        if not keywords:
            print(f"  警告: 未提取到关键词")
            return False
        
        print(f"  提取的关键词: {', '.join(keywords)}")
        
        # 更新HTML文件
        if update_html_keywords(file_path, keywords):
            print(f"  ✓ 成功更新关键词")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"  错误: {e}")
        return False


def main():
    """主函数"""
    # 获取脚本所在目录
    script_dir = Path(__file__).parent
    # 博客目录
    blogs_dir = script_dir.parent / 'blogs'
    
    if not blogs_dir.exists():
        print(f"错误: 博客目录不存在: {blogs_dir}")
        return
    
    # 获取所有HTML文件
    blog_files = list(blogs_dir.glob('*.html'))
    
    if not blog_files:
        print("未找到博客文件")
        return
    
    print(f"找到 {len(blog_files)} 个博客文件")
    print("=" * 50)
    
    success_count = 0
    skip_count = 0
    
    for blog_file in sorted(blog_files):
        if process_blog_file(blog_file):
            success_count += 1
        else:
            skip_count += 1
        print()
    
    print("=" * 50)
    print(f"处理完成: 成功 {success_count} 个, 跳过 {skip_count} 个")


if __name__ == '__main__':
    main()

