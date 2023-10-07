#!/bin/bash

for file in *.pdf
do
  name=${file%.*}
  gs -o publication_preview/"$name".jpeg -200x200 -sDEVICE=jpeg -dLastPage=1 "$file"
done