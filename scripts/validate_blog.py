#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客文章验证和修复脚本
自动检查并修复常见的博客格式问题
"""

import os
import re
import sys
import yaml
import json
from pathlib import Path
from datetime import datetime, date

SITE_ROOT = Path(__file__).parent.parent


class BlogValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.fixes = []
    
    def validate_markdown(self, md_file):
        """验证Markdown文件"""
        print(f"\n正在验证: {md_file.name}")
        result = True
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查front matter
        fm_check = self._check_front_matter(content)
        if not fm_check:
            result = False
        
        return result
    
    def _check_front_matter(self, content):
        """检查front matter格式"""
        lines = content.split('\n')
        
        # 检查是否有front matter
        if not lines or lines[0].strip() != '---':
            self.errors.append("❌ 缺少front matter（需要以 --- 开头）")
            return False
        
        # 提取front matter
        yaml_lines = []
        i = 1
        while i < len(lines) and lines[i].strip() != '---':
            yaml_lines.append(lines[i])
            i += 1
        
        if i >= len(lines):
            self.errors.append("❌ front matter未闭合（缺少结束的 ---）")
            return False
        
        try:
            yaml_content = '\n'.join(yaml_lines)
            front_matter = yaml.safe_load(yaml_content) or {}
        except yaml.YAMLError as e:
            self.errors.append(f"❌ YAML格式错误: {e}")
            return False
        
        # 检查必需字段
        valid = True
        
        # 检查title
        if 'title' not in front_matter or not front_matter['title']:
            self.errors.append("❌ 缺少必需的字段: title")
            valid = False
        
        # 检查date
        if 'date' not in front_matter or not front_matter['date']:
            self.errors.append("❌ 缺少必需的字段: date")
            valid = False
        else:
            date_value = front_matter['date']
            # 检查日期格式
            if isinstance(date_value, str):
                # 检查是否是模板变量
                if '{{date' in date_value:
                    self.warnings.append("⚠️  日期使用了模板变量，请注意Obsidian会自动替换")
                else:
                    # 验证日期格式
                    try:
                        datetime.strptime(date_value, '%Y-%m-%d')
                    except ValueError:
                        self.errors.append(f"❌ 日期格式错误: {date_value}（应该是YYYY-MM-DD格式）")
                        valid = False
            elif isinstance(date_value, (datetime, date)):
                # YAML会自动将YYYY-MM-DD解析为date对象，这是正常的
                pass
            elif isinstance(date_value, dict):
                self.errors.append(f"❌ 日期格式错误（被解析为对象）: {date_value}")
                valid = False
            else:
                # 其他类型（如数字等）都是错误的
                self.errors.append(f"❌ 日期类型错误: {type(date_value).__name__}")
                valid = False
        
        # 检查description（可选，但建议填写）
        if 'description' not in front_matter or not front_matter['description']:
            self.warnings.append("ℹ️  建议添加description字段（用于博客列表显示）")
        
        # 检查category（可选，但建议填写）
        if 'category' not in front_matter or not front_matter['category']:
            self.warnings.append("ℹ️  建议添加category字段（用于标签显示）")
        
        # 检查category格式
        if 'category' in front_matter:
            cat = front_matter['category']
            if isinstance(cat, dict):
                self.errors.append("❌ category格式错误（不应该是一个对象）")
                valid = False
            elif isinstance(cat, str) and cat.strip():
                # 字符串格式也可以
                pass
            elif isinstance(cat, list):
                if not cat:
                    self.errors.append("❌ category列表为空")
                    valid = False
        
        return valid
    
    def print_report(self):
        """打印验证报告"""
        print("\n" + "="*60)
        print("验证报告")
        print("="*60)
        
        if not self.errors and not self.warnings:
            print("✅ 所有检查通过！")
            return True
        
        if self.errors:
            print(f"\n错误 ({len(self.errors)}个):")
            for error in self.errors:
                print(f"  {error}")
        
        if self.warnings:
            print(f"\n警告/建议 ({len(self.warnings)}个):")
            for warning in self.warnings:
                print(f"  {warning}")
        
        return False
    
    def suggest_fixes(self, md_file):
        """建议修复方案"""
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        # 检查front matter
        if not lines or lines[0].strip() != '---':
            print("\n建议修复:")
            print("  在文件开头添加front matter")
            print("  参考模板: scripts/obsidian-blog-template.md")
            return False
        
        return True


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: validate_blog.py <markdown文件>")
        print("示例: validate_blog.py /path/to/blog.md")
        sys.exit(1)
    
    md_file = Path(sys.argv[1])
    
    if not md_file.exists():
        print(f"错误: 文件不存在 {md_file}")
        sys.exit(1)
    
    validator = BlogValidator()
    is_valid = validator.validate_markdown(md_file)
    
    if not validator.print_report():
        if not is_valid:
            validator.suggest_fixes(md_file)
            print("\n请修复以上问题后重新运行验证")
            sys.exit(1)
    
    print("\n✅ 验证通过，可以继续部署")


if __name__ == '__main__':
    main()

