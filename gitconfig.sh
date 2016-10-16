#! /bin/sh

echo "======== Git 设置开始 ========"
echo "======== git config core.filemode false ========"
git config core.filemode false
echo "======== git config core.symlinks false ========"
git config core.symlinks false
echo "======== git config core.hideDotFiles dotGitOnly ========"
git config core.hideDotFiles dotGitOnly
echo "======== Git 设置结束 ========"