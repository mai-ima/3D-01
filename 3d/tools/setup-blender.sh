#!/usr/bin/env bash
# Blender(bpy)の導入: bash 3d/tools/setup-blender.sh   → .venv-blender/ に作る(Git 管理外)
#   使い方: .venv-blender/bin/python 3d/tools/blender-refine.py <モデルID> <出力.glb>
set -euo pipefail
cd "$(dirname "$0")/../.."
python3 -m venv .venv-blender
.venv-blender/bin/pip install -q bpy numpy pillow
.venv-blender/bin/python -c "import bpy;print('Blender',bpy.app.version_string)"
