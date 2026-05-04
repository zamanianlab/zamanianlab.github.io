---
layout: page
title: Album
permalink: /album/
nav: false
---

{% assign gallery_raw = site.static_files | where_exp: "f", "f.path contains '/assets/img/gallery/'" | sort: "name" | reverse %}
{% assign gallery = gallery_raw | where_exp: "f", "f.name != 'album_icon.png'" %}
{% assign total = gallery | size %}

<div class="gallery-grid">
  {% for image in gallery %}
    {% assign year = image.name | split: '_' | first %}
    {% assign prev_idx = forloop.index | minus: 1 %}
    {% assign next_idx = forloop.index | plus: 1 %}
    {% if forloop.first %}{% assign prev_idx = total %}{% endif %}
    {% if forloop.last %}{% assign next_idx = 1 %}{% endif %}

    <div class="gallery-item">
      <a href="#gallery-{{ forloop.index }}" class="gallery-thumb">
        <img src="{{ image.path | relative_url }}" alt="{{ year }}">
        <span class="gallery-caption">{{ year }}</span>
      </a>
    </div>

    <div id="gallery-{{ forloop.index }}" class="gallery-lightbox" role="dialog">
      <a href="#" class="gallery-lightbox-bg" aria-label="Close"></a>
      <a href="#gallery-{{ prev_idx }}" class="gallery-lightbox-prev" aria-label="Previous">&#10094;</a>
      <a href="#gallery-{{ next_idx }}" class="gallery-lightbox-next" aria-label="Next">&#10095;</a>
      <div class="gallery-lightbox-content">
        <a href="#" class="gallery-lightbox-close" aria-label="Close">&times;</a>
        <img src="{{ image.path | relative_url }}" alt="{{ year }}">
        <p class="gallery-lightbox-caption">{{ year }}</p>
      </div>
    </div>
  {% endfor %}
</div>
