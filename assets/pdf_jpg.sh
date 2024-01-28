#!/bin/bash

for file in pdf/*.pdf
do
  base=${file%.*}
  name=`echo "${base}"  | sed -e 's/^pdf\///'`
  echo ${name}
  gs -o img/publication_preview/"$name".jpeg -200x200 -sDEVICE=jpeg -dLastPage=1 "$file"
done