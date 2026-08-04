---
layout: default
title: Support AERO
description: Support AERO, UVM's Formula SAE Electric vehicle team — see how funds are raised and spent, and how to give.
og_image: /images/[PLACEHOLDER-og-image].jpg
---

## Help AERO Build and Race

AERO is the University of Vermont's Formula SAE Electric team, where students design, build, and race an all-electric formula-style race car from the ground up. Your support helps cover parts, tools, and competition expenses.

[Read more about the team](/our_team).

### Donate Online

[Donate via PayPal or Venmo](<!-- insert paypal link -->){:target="_blank"}


### Donate by Check

Make checks payable to <!-- insert AERO checking location --> and mail to:

> UVM College of Engineering & Mathematical Sciences<br>
> Room 101, Votey Building, 33 Colchester Ave<br>
> Burlington, VT, 05405

### 2026–27 Advancement Fund — Progress

{% assign donations = site.data.donations.donations %}
{% assign goal = site.data.donations.goal %}
{% assign count = donations | size %}
{% assign total = 0 %}
{% assign inkind_total = 0 %}
{% for d in donations %}
  {% if d.method == "in-kind" %}{% assign inkind_total = inkind_total | plus: d.amount %}{% else %}{% assign total = total | plus: d.amount %}{% endif %}
{% endfor %}
{% assign pct = total | times: 100 | divided_by: goal %}
<div class="donation-progress">
  <span class="raised">{% include money.html amount=total %} raised</span>
  <span class="goal"> of {% include money.html amount=goal %} goal &middot; {{ count }} donation{% if count != 1 %}s{% endif %}</span>
  <div class="donation-progress-bar">
    <div class="fill" style="width: {{ pct }}%"></div>
  </div>
  {% if inkind_total > 0 %}<span class="inkind">plus {% include money.html amount=inkind_total %} of in-kind support</span>{% endif %}
</div>

<ul class="donation-feed">
{% for d in donations %}  <li>
    <div class="donation-avatar">{{ d.donor | slice: 0 }}</div>
    <div class="donation-detail">
      <span class="donor-name">{{ d.donor }}</span> donated <span class="donation-amount">{% include money.html amount=d.amount %}</span> to {% if d.designation == "Shared" %}AERO General Fund{% else %}{{ d.designation }}{% endif %}
      <div class="donation-meta">{{ d.date | date: "%b %-d" }}{% if d.memo %} &middot; {{ d.memo }}{% endif %}</div>
    </div>
  </li>
{% endfor %}</ul>

<script>
(function() {
  var items = document.querySelectorAll('.donation-feed li');
  var limit = 5;
  if (items.length > limit) {
    for (var i = limit; i < items.length; i++) items[i].style.display = 'none';
    var btn = document.createElement('button');
    btn.textContent = 'Show all ' + items.length + ' donations';
    btn.style.cssText = 'background:none;border:none;color:var(--link);cursor:pointer;padding:0.5rem 0;font-size:0.95rem;';
    btn.addEventListener('click', function() {
      for (var i = limit; i < items.length; i++) items[i].style.display = '';
      btn.remove();
    });
    document.querySelector('.donation-feed').after(btn);
  }
})();
</script>

### Looking Ahead


---

## Where the Money Goes

AERO runs on a combined build-season budget of roughly [PLACEHOLDER total], funded by UVM club funding, sponsors, and alumni support, plus [PLACEHOLDER] of in-kind support (materials, shop access, discounts).

We are raising [PLACEHOLDER $ amount] for the 2027 FSAE Formula Hybrid-Electric competition at the New Hampshire Motor Speedway from [PLACEHOLDER date to PLACEHOLDER date].


*Note: These budgets do not include member out-of-pocket costs for personal travel, food, and lodging.*

{% assign budget = site.data.budget %}

{% comment %}Compute regular-season totals{% endcomment %}
{% assign rs_inc = 0 %}
{% assign rs_exp = 0 %}
{% assign rs_ink = 0 %}
{% for team in budget.regular_season.teams %}
  {% for i in team.income %}{% assign rs_inc = rs_inc | plus: i.amount %}{% endfor %}
  {% for e in team.expenses %}{% assign rs_exp = rs_exp | plus: e.amount %}{% endfor %}
  {% for k in team.in_kind %}{% assign rs_ink = rs_ink | plus: k.value %}{% endfor %}
{% endfor %}

{% comment %}Compute post-season totals{% endcomment %}
{% assign ps_inc = 0 %}
{% assign ps_ink = 0 %}
{% for d in donations %}
  {% if d.method == "in-kind" %}
    {% assign ps_ink = ps_ink | plus: d.amount %}
  {% else %}
    {% assign ps_inc = ps_inc | plus: d.amount %}
  {% endif %}
{% endfor %}
{% assign ps_exp = 0 %}
{% for team in budget.post_season.teams %}
  {% for e in team.expenses %}{% assign ps_exp = ps_exp | plus: e.amount %}{% endfor %}
{% endfor %}

{% assign total_inc = rs_inc | plus: ps_inc %}
{% assign total_exp = rs_exp | plus: ps_exp %}
{% assign total_ink = rs_ink | plus: ps_ink %}

<table class="summary-table">
<thead><tr><th></th><th style="text-align:right">Build Season</th><th style="text-align:right">Competition</th><th style="text-align:right">Total</th></tr></thead>
<tbody>
<tr><td>Cash Income</td><td style="text-align:right">{% include money.html amount=rs_inc %}</td><td style="text-align:right">{% include money.html amount=ps_inc %}</td><td style="text-align:right">{% include money.html amount=total_inc %}</td></tr>
<tr><td>Expenses</td><td style="text-align:right">{% include money.html amount=rs_exp %}</td><td style="text-align:right">{% include money.html amount=ps_exp %}</td><td style="text-align:right">{% include money.html amount=total_exp %}</td></tr>
<tr><td>In-Kind Support</td><td style="text-align:right">{% include money.html amount=rs_ink %}</td><td style="text-align:right">{% include money.html amount=ps_ink %}</td><td style="text-align:right">{% include money.html amount=total_ink %}</td></tr>
</tbody>
</table>

### {{ budget.post_season.label }}

*Note: Competition actual expenses are not final until receipts are in — update the "Actual" figures as totals are confirmed.*

{% for team in budget.post_season.teams %}
#### {{ team.name }}

{% if team.description %}{{ team.description | markdownify }}{% endif %}

{% if team.donation_recipient %}
{% assign d_total = 0 %}
{% assign d_family = 0 %}
{% assign d_community = 0 %}
{% assign d_alumni = 0 %}
{% assign d_orgs = "" %}
{% assign d_inkind = "" %}
{% assign d_inkind_total = 0 %}
{% for d in donations %}
  {% assign d_team = d.assignment | default: d.designation %}
  {% if d_team == team.donation_recipient %}
    {% if d.method == "in-kind" %}
      {% if d_inkind != "" %}{% assign d_inkind = d_inkind | append: "|" %}{% endif %}
      {% assign ink_label = d.donor %}{% if d.memo %}{% assign ink_label = ink_label | append: " (" | append: d.memo | append: ")" %}{% endif %}
      {% assign d_inkind = d_inkind | append: ink_label | append: ":" | append: d.amount %}
      {% assign d_inkind_total = d_inkind_total | plus: d.amount %}
    {% else %}
      {% assign d_total = d_total | plus: d.amount %}
      {% if d.type == "organization" %}
        {% if d_orgs != "" %}{% assign d_orgs = d_orgs | append: "|" %}{% endif %}
        {% assign d_orgs = d_orgs | append: d.donor | append: ":" | append: d.amount %}
      {% elsif d.type == "family" %}
        {% assign d_family = d_family | plus: d.amount %}
      {% elsif d.type == "alumni" %}
        {% assign d_alumni = d_alumni | plus: d.amount %}
      {% else %}
        {% assign d_community = d_community | plus: d.amount %}
      {% endif %}
    {% endif %}
  {% endif %}
{% endfor %}
<table>
<thead><tr><th></th><th style="text-align:right">Budget</th><th style="text-align:right">Actual</th></tr></thead>
<tbody>
<tr><td colspan="3"><strong>Income</strong></td></tr>
{% if d_family > 0 %}<tr><td>Family</td><td></td><td style="text-align:right">{% include money.html amount=d_family %}</td></tr>{% endif %}
{% if d_community > 0 %}<tr><td>Community</td><td></td><td style="text-align:right">{% include money.html amount=d_community %}</td></tr>{% endif %}
{% if d_alumni > 0 %}<tr><td>Alumni</td><td></td><td style="text-align:right">{% include money.html amount=d_alumni %}</td></tr>{% endif %}
{% if d_orgs != "" %}
{% assign org_entries = d_orgs | split: "|" | reverse %}
{% for entry in org_entries %}
{% assign parts = entry | split: ":" %}
{% assign org_name = parts[0] %}{% assign org_amount = parts[1] %}
<tr><td>{{ org_name }}</td><td></td><td style="text-align:right">{% include money.html amount=org_amount %}</td></tr>
{% endfor %}
{% endif %}
<tr><td><strong>Total Income</strong></td><td></td><td style="text-align:right"><strong>{% include money.html amount=d_total %}</strong></td></tr>
{% if team.expenses %}
<tr><td colspan="3"><strong>Expenses</strong></td></tr>
{% assign ps_team_exp = 0 %}
{% assign ps_team_act = 0 %}
{% assign has_any_actual = false %}
{% for e in team.expenses %}
{% assign ps_team_exp = ps_team_exp | plus: e.amount %}
{% if e.actual %}{% assign ps_team_act = ps_team_act | plus: e.actual %}{% assign has_any_actual = true %}{% endif %}
<tr><td>{{ e.category }}</td><td style="text-align:right">{% if e.amount %}{% if e.estimated %}~{% endif %}{% include money.html amount=e.amount %}{% else %}TBD{% endif %}</td><td style="text-align:right">{% if e.actual %}{% include money.html amount=e.actual %}{% endif %}</td></tr>
{% endfor %}
{% if ps_team_exp > 0 %}
<tr><td><strong>Total Expenses</strong></td><td style="text-align:right"><strong>{% include money.html amount=ps_team_exp %}</strong></td><td style="text-align:right">{% if has_any_actual %}<strong>{% include money.html amount=ps_team_act %}</strong>{% endif %}</td></tr>
{% endif %}
{% endif %}
{% if d_inkind != "" %}
<tr><td colspan="3"><strong>In-Kind Support</strong></td></tr>
{% assign inkind_entries = d_inkind | split: "|" %}
{% for entry in inkind_entries %}
{% assign parts = entry | split: ":" %}
{% assign ink_name = parts[0] %}
{% assign ink_amount = parts[1] %}
<tr><td>{{ ink_name }}</td><td></td><td style="text-align:right">{% include money.html amount=ink_amount %}</td></tr>
{% endfor %}
<tr><td><strong>Total In-Kind</strong></td><td></td><td style="text-align:right"><strong>{% include money.html amount=d_inkind_total %}</strong></td></tr>
{% endif %}
</tbody>
</table>
{% endif %}

{% endfor %}

### {{ budget.regular_season.label }}

{% for team in budget.regular_season.teams %}
#### {{ team.name }}

{% if team.note %}{{ team.note }}{% endif %}

{% assign inc_total = 0 %}
{% for i in team.income %}{% assign inc_total = inc_total | plus: i.amount %}{% endfor %}
{% assign exp_total = 0 %}
{% for e in team.expenses %}{% assign exp_total = exp_total | plus: e.amount %}{% endfor %}
{% assign net = inc_total | minus: exp_total %}

<table>
<thead><tr><th></th><th style="text-align:right">Amount</th></tr></thead>
<tbody>
{% if team.income %}
<tr><td colspan="2"><strong>{% if team.in_kind %}Cash {% endif %}Income</strong></td></tr>
{% for i in team.income %}
<tr><td>{{ i.source }}</td><td style="text-align:right">{% include money.html amount=i.amount %}</td></tr>
{% endfor %}
<tr><td><strong>Total{% if team.in_kind %} Cash{% endif %} Income</strong></td><td style="text-align:right"><strong>{% include money.html amount=inc_total %}</strong></td></tr>
{% endif %}
{% if team.expenses %}
<tr><td colspan="2"><strong>Expenses</strong></td></tr>
{% for e in team.expenses %}
<tr><td>{{ e.category }}</td><td style="text-align:right">{% if e.amount %}{% if e.estimated %}~{% endif %}{% include money.html amount=e.amount %}{% else %}TBD{% endif %}</td></tr>
{% endfor %}
<tr><td><strong>Total Expenses</strong></td><td style="text-align:right"><strong>{% include money.html amount=exp_total %}</strong></td></tr>
{% if net < 0 %}
<tr><td><strong>Net</strong></td><td style="text-align:right"><strong style="color:var(--accent)">{% include money.html amount=net %}</strong></td></tr>
{% else %}
<tr><td><strong>Net</strong></td><td style="text-align:right"><strong style="color:#2a9d8f">+{% include money.html amount=net %}</strong></td></tr>
{% endif %}
{% endif %}
{% if team.in_kind %}
{% assign ink_total = 0 %}
{% for k in team.in_kind %}{% assign ink_total = ink_total | plus: k.value %}{% endfor %}
<tr><td colspan="2"><strong>In-Kind Support</strong></td></tr>
{% for k in team.in_kind %}
<tr><td>{{ k.source }}</td><td style="text-align:right">{% include money.html amount=k.value %}</td></tr>
{% endfor %}
<tr><td><strong>Total In-Kind</strong></td><td style="text-align:right"><strong>{% include money.html amount=ink_total %}</strong></td></tr>
{% endif %}
</tbody>
</table>

{% endfor %}

---

### About Us



### Questions?

Email us at [aero@uvm.edu](mailto:PLACEHOLDER@uvm.edu?subject=Support%20Inquiry).

---

*We're grateful to our [sponsors](/sponsors), whose support makes this build possible.*
