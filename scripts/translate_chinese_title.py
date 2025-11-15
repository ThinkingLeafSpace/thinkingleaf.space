#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中文标题转英文标题脚本
自动将中文标题翻译为英文标题，并保存映射关系
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional

SCRIPT_DIR = Path(__file__).parent
TITLE_TRANSLATION_FILE = SCRIPT_DIR / 'title_translation_mapping.json'


def load_translation_mapping() -> Dict[str, str]:
    """加载标题翻译映射"""
    if TITLE_TRANSLATION_FILE.exists():
        with open(TITLE_TRANSLATION_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_translation_mapping(mapping: Dict[str, str]):
    """保存标题翻译映射"""
    with open(TITLE_TRANSLATION_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)


def translate_title_simple(chinese_title: str) -> str:
    """
    简单的标题翻译（基于规则和常见词汇）
    这是一个基础实现，可以后续集成翻译API
    """
    # 常见词汇映射
    common_words = {
        '筑居思': 'ThinkingLeafSpace',
        '算法': 'Algorithm',
        '阅读': 'Reading',
        '思考': 'Thoughts',
        '感悟': 'Reflections',
        '随笔': 'Essays',
        '内观': 'Vipassana',
        '禅修': 'Meditation',
        '正念': 'Mindfulness',
        '自我': 'Self',
        '觉察': 'Awareness',
        '成长': 'Growth',
        '生活': 'Life',
        '工作': 'Work',
        '平衡': 'Balance',
        '设计': 'Design',
        '实验': 'Experiment',
        '失败': 'Failure',
        '成功': 'Success',
        '创造': 'Creation',
        '创造性': 'Creativity',
        '思维': 'Thinking',
        '哲学': 'Philosophy',
        '人生': 'Life',
        '决定': 'Decision',
        '想象': 'Imagination',
        '分享': 'Sharing',
        '推荐': 'Recommendation',
        'RSS': 'RSS',
        '订阅': 'Subscription',
        '内容': 'Content',
        '信息': 'Information',
        '认知': 'Cognition',
        '绿洲': 'Oasis',
        '艺术': 'Art',
        '实践': 'Practice',
        '体验': 'Experience',
        '探索': 'Exploration',
        '学习': 'Learning',
        '学会': 'Learned',
        '岁': 'Years Old',
        '年': 'Year',
        '月': 'Month',
        '日': 'Day',
        '为什么': 'Why',
        '如何': 'How',
        '什么': 'What',
        '在': 'In',
        '的': '',
        '了': '',
        '是': 'Is',
        '我': 'I',
        '你': 'You',
        '他': 'He',
        '她': 'She',
        '我们': 'We',
        '他们': 'They',
        '终于': 'Finally',
        '安心': 'Peaceful',
        '去': 'Go',
        '玩': 'Play',
        '如果': 'If',
        '在': 'In',
        '夏夜': 'Summer Night',
        '一个': 'A',
        '旅人': 'Traveler',
        '听': 'Listen',
        '山风': 'Mountain Wind',
        '永远': 'Forever',
        '不要': "Don't",
        '停止': 'Stop',
        '好文': 'Good Article',
        '停下来': 'Stop',
        '休息': 'Rest',
        '一下': 'A Moment',
        '好久不见': 'Long Time No See',
        '最近': 'Recently',
        '在外太空': 'In Outer Space',
        '种下': 'Plant',
        '小花': 'Little Flower',
        '答': 'Answer',
        '问卷': 'Questionnaire',
        '如何面对': 'How to Face',
        '重大': 'Major',
        '人生决定': 'Life Decision',
        '一直': 'All the Way',
        '游到': 'Swim to',
        '海水': 'Sea Water',
        '变蓝': 'Turn Blue',
        '半载': 'Half Year',
        '观想': 'Contemplation',
        '小记': 'Notes',
        '大理': 'Dali',
        '路上': 'On the Road',
        '或许': 'Perhaps',
        '就是': 'Is',
        '容易': 'Easy',
        '对吗': 'Right',
        '在禅堂里': 'In the Meditation Hall',
        '我遇见了': 'I Met',
        '所有人': 'Everyone',
        '记': 'Notes',
        '第二次': 'Second Time',
        '结缘': 'Connection',
        '24岁': '24 Years Old',
        '学会的': 'Learned',
        '24件事': '24 Things',
        '2025年了': '2025',
        '还是': 'Still',
        '推荐用': 'Recommend Using',
        'RSS订阅': 'RSS Subscription',
        '内容': 'Content',
    }
    
    # 移除"筑居思："前缀
    title = chinese_title.replace('筑居思：', '').replace('筑居思·', '').strip()
    
    # 尝试直接匹配常见短语
    for phrase, translation in common_words.items():
        if phrase in title:
            title = title.replace(phrase, translation)
    
    # 清理多余的空格和标点
    title = re.sub(r'\s+', ' ', title).strip()
    title = re.sub(r'\s*-\s*', ' - ', title)
    
    # 如果翻译后还是中文，返回空字符串（需要手动翻译）
    if re.search(r'[\u4e00-\u9fa5]', title):
        return ""
    
    return title


def translate_title_with_api(chinese_title: str) -> Optional[str]:
    """
    使用翻译API翻译标题（可选实现）
    可以集成Google Translate API、百度翻译API等
    """
    # TODO: 集成翻译API
    # 示例：
    # from googletrans import Translator
    # translator = Translator()
    # result = translator.translate(chinese_title, dest='en')
    # return result.text
    return None


def translate_chinese_title(chinese_title: str, use_mapping: bool = True) -> str:
    """
    将中文标题翻译为英文标题
    优先使用映射表，如果没有则尝试自动翻译
    """
    mapping = load_translation_mapping()
    
    # 如果已经在映射表中，直接返回
    if use_mapping and chinese_title in mapping:
        return mapping[chinese_title]
    
    # 尝试使用翻译API
    api_translation = translate_title_with_api(chinese_title)
    if api_translation:
        # 保存到映射表
        mapping[chinese_title] = api_translation
        save_translation_mapping(mapping)
        return api_translation
    
    # 尝试简单翻译
    simple_translation = translate_title_simple(chinese_title)
    if simple_translation:
        # 保存到映射表
        mapping[chinese_title] = simple_translation
        save_translation_mapping(mapping)
        return simple_translation
    
    # 如果都无法翻译，返回空字符串（需要手动添加到映射表）
    return ""


def add_translation(chinese_title: str, english_title: str):
    """手动添加翻译映射"""
    mapping = load_translation_mapping()
    mapping[chinese_title] = english_title
    save_translation_mapping(mapping)
    print(f"✅ 已添加翻译映射: {chinese_title} -> {english_title}")


def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法:")
        print("  翻译单个标题: python translate_chinese_title.py \"中文标题\"")
        print("  添加映射: python translate_chinese_title.py \"中文标题\" \"English Title\"")
        print("  查看所有映射: python translate_chinese_title.py --list")
        return
    
    if sys.argv[1] == '--list':
        mapping = load_translation_mapping()
        if mapping:
            print("当前翻译映射:")
            print("=" * 60)
            for chinese, english in sorted(mapping.items()):
                print(f"  {chinese} -> {english}")
        else:
            print("暂无翻译映射")
        return
    
    chinese_title = sys.argv[1]
    
    if len(sys.argv) >= 3:
        # 手动添加映射
        english_title = sys.argv[2]
        add_translation(chinese_title, english_title)
    else:
        # 自动翻译
        english_title = translate_chinese_title(chinese_title)
        if english_title:
            print(f"✅ 翻译结果: {english_title}")
        else:
            print(f"⚠️  无法自动翻译，请手动添加映射:")
            print(f"   python translate_chinese_title.py \"{chinese_title}\" \"English Title\"")


if __name__ == '__main__':
    main()

