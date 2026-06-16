#!/usr/bin/env bash
# Crop a portrait photo into the lab people-page style:
#   centered circular mask, white background, soft drop shadow.
# Output dimensions match the established style (420x440 JPEG).
#
# Idempotent — on first run, the source is preserved as <name>.orig
# next to the input; subsequent runs re-process from .orig so the
# circle/shadow doesn't get applied twice.
#
# Usage:
#   ./portrait_crop.sh path/to/photo.jpg                # in-place
#   ./portrait_crop.sh path/to/raw.jpg path/to/out.jpg  # source -> dest

set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <photo.jpg> [<dest.jpg>]" >&2
  exit 2
fi

src="$1"
dst="${2:-$1}"

if [ ! -f "$src" ]; then
  echo "error: $src not found" >&2
  exit 1
fi

# In-place mode: preserve the true original as a sibling .orig so reruns
# always start from the unprocessed photo.
if [ "$src" = "$dst" ]; then
  orig="${src%.*}.orig"
  if [ ! -f "$orig" ]; then
    cp "$src" "$orig"
  fi
  src="$orig"
fi

magick "$src" \
  -auto-orient \
  -resize 400x400^ -gravity center -extent 400x400 \
  \( -size 400x400 xc:black -fill white -draw "circle 200,200 200,0" \) \
  -alpha off -compose CopyOpacity -composite \
  -compose Over \
  \( +clone -background black -shadow 50x6+4+8 \) \
  +swap -background white -layers merge +repage \
  -alpha remove -alpha off \
  -gravity center -extent 420x440 -background white -flatten \
  "$dst"

echo "wrote $dst"
