#! /bin/sh

echo "======== 上传远端开始 ========"
echo "======== 远端 repo 列表 ========"
git remote -v

###########################
servers=(gitlab github)
###########################

para=''
repo='master'

if [[ $1 = "--force" ]]; then
  para=$1
elif [[ -n $1 ]]; then
  repo=$1
fi

if [[ $2 = "--force" ]]; then
  para=$2
elif [[ -n $2 ]]; then
  repo=$2
fi

for (( i = 0; i < ${#servers[*]}; i++ )); do
  echo "======== 同步 ${servers[i]} $repo ========"
  git push $para ${servers[i]} $repo
done