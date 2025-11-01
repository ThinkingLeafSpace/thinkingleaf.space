#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查环境设置是否正确
"""

import sys
from pathlib import Path

def check_python():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ Python版本过低，需要Python 3.7+")
        print(f"   当前版本: {sys.version}")
        return False
    print(f"✓ Python版本: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """检查依赖包"""
    missing = []
    required = ['markdown', 'yaml', 'PIL']
    
    for package in required:
        try:
            if package == 'markdown':
                import markdown
            elif package == 'yaml':
                import yaml
            elif package == 'PIL':
                from PIL import Image
            print(f"✓ {package} 已安装")
        except ImportError:
            missing.append(package)
            print(f"❌ {package} 未安装")
    
    if missing:
        print(f"\n请运行以下命令安装缺失的依赖:")
        print(f"  pip3 install -r scripts/requirements.txt")
        return False
    
    return True

def check_directories():
    """检查目录结构"""
    site_root = Path(__file__).parent.parent
    required_dirs = [
        site_root / 'blogs',
        site_root / 'images',
        site_root / 'scripts',
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        if dir_path.exists():
            print(f"✓ 目录存在: {dir_path.name}/")
        else:
            print(f"⚠ 目录不存在: {dir_path.name}/ (将自动创建)")
            all_exist = False
    
    # 确保images/blog目录存在
    blog_images_dir = site_root / 'images' / 'blog'
    blog_images_dir.mkdir(parents=True, exist_ok=True)
    print(f"✓ 图片目录已准备: images/blog/")
    
    return True

def check_config():
    """检查配置文件"""
    site_root = Path(__file__).parent.parent
    config_file = site_root / 'blog_config.json'
    
    if config_file.exists():
        print(f"✓ 配置文件存在: blog_config.json")
        try:
            import json
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            print(f"  - Obsidian附件目录配置: {len(config.get('obsidian_attachments', []))} 个")
        except:
            print(f"⚠ 配置文件格式可能有问题")
    else:
        print(f"⚠ 配置文件不存在: blog_config.json")
        print(f"  将使用默认配置")
    
    return True

def check_scripts():
    """检查脚本文件"""
    scripts_dir = Path(__file__).parent
    required_scripts = [
        'markdown_to_html.py',
        'update_blogs_list.py',
        'deploy_blog.sh',
    ]
    
    all_exist = True
    for script in required_scripts:
        script_path = scripts_dir / script
        if script_path.exists():
            # 检查执行权限（对于.sh文件）
            if script.endswith('.sh'):
                import os
                if os.access(script_path, os.X_OK):
                    print(f"✓ {script} (有执行权限)")
                else:
                    print(f"⚠ {script} (缺少执行权限)")
                    print(f"  运行: chmod +x scripts/{script}")
                    all_exist = False
            else:
                print(f"✓ {script}")
        else:
            print(f"❌ {script} 不存在")
            all_exist = False
    
    return all_exist

def main():
    """主函数"""
    print("=" * 60)
    print("环境检查")
    print("=" * 60)
    print()
    
    checks = [
        ("Python版本", check_python),
        ("依赖包", check_dependencies),
        ("目录结构", check_directories),
        ("配置文件", check_config),
        ("脚本文件", check_scripts),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n[{name}]")
        result = check_func()
        results.append(result)
    
    print()
    print("=" * 60)
    if all(results):
        print("✓ 所有检查通过！你可以开始使用部署工具了。")
        return 0
    else:
        print("⚠ 部分检查未通过，请根据上述提示修复问题。")
        return 1

if __name__ == '__main__':
    sys.exit(main())

