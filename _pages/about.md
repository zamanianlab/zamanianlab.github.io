---
layout: page
title: About
permalink: /
---

<div class="row align-items-start mt-2 mb-4">
  <div class="col-sm-7">
    <p>We are a research lab in the Department of Pathobiological Sciences at the <a href="http://www.wisc.edu">University of Wisconsin—Madison</a>. We pair experimental and computational approaches to study neglected parasitic diseases and host-pathogen interactions, with the goal of identifying molecular drivers of successful infection. Our mission is to illuminate the biology of these complex pathogens, advance human and animal health through new therapeutics, and facilitate the training of scientists at every career stage.</p>
    <img class="img-fluid d-block mx-auto" src="assets/img/lab-logo.png" alt="Zamanian Lab logo" style="width: 44%; margin-top: 0.1rem;">
  </div>
  <div class="col-sm-5">
    <div class="lab-news">
      <div class="news-label"><img src="assets/img/megaphone.png" alt="" height="13" style="margin-right: 0.3rem; vertical-align: middle; position: relative; top: -1px;">Lab News</div>
      <div class="news-scroll">
        {% for item in site.data.news %}
        <div class="news-entry">
          <span class="news-date">{{ item.date }}</span>
          <span class="news-body">{{ item.text }}</span>
        </div>
        {% endfor %}
      </div>
    </div>
  </div>
</div>

<div class="row mb-3">
  <div class="col-sm-4">
    <img class="img-fluid rounded z-depth-1" src="assets/img/madison/madison_1_crop.jpg" alt="Madison">
  </div>
  <div class="col-sm-4">
    <img class="img-fluid rounded z-depth-1" src="assets/img/madison/svm_north.jpg" alt="School of Veterinary Medicine">
  </div>
  <div class="col-sm-4">
    <img class="img-fluid rounded z-depth-1" src="assets/img/lab_pic.jpg" alt="Lab group">
  </div>
</div>

<hr>

<div class="text-center funding-row">
  <span class="funding-label">Past &amp; present funding</span>
  <div class="funding-logos">
    <img src="assets/img/funding/NIH.png" alt="NIH">
    <img src="assets/img/funding/NSF.png" alt="NSF">
    <img src="assets/img/funding/WARF.png" alt="WARF">
    <img src="assets/img/funding/Gates.png" alt="Gates Foundation">
    <img src="assets/img/funding/USDA.png" alt="USDA">
  </div>
</div>
