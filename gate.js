(function () {
  'use strict';

  var SITE_URL = (document.currentScript && document.currentScript.getAttribute('data-site')) || 'site.json';
  var HONESTY = 'Unofficial helper · not a substitute for 911 · links to official city channels · preview';
  var USA_LOCAL = 'https://www.usa.gov/local-governments';
  var MAX_KM = 100;
  var LS_NEST = '311chat.nest';

  var ALIASES = {
    nyc: ['nyc', 'new york', 'new york city', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'],
    la: ['la', 'los angeles'],
    chicago: ['chicago', 'chi'],
    houston: ['houston'],
    phoenix: ['phoenix'],
    philadelphia: ['philadelphia', 'philly'],
    'san-antonio': ['san antonio', 'sanantonio', 'san-antonio'],
    boston: ['boston'],
    denver: ['denver'],
    sf: ['sf', 'san francisco'],
    oakland: ['oakland'],
    seattle: ['seattle'],
    'redwood-city': ['redwood city'],
    'menlo-park': ['menlo park'],
    'palo-alto': ['palo alto'],
    'mountain-view': ['mountain view'],
    sunnyvale: ['sunnyvale'],
    cupertino: ['cupertino'],
    'santa-clara': ['santa clara'],
    'san-jose': ['san jose']
  };

  var ZIP3 = {
    '100': 'nyc', '101': 'nyc', '102': 'nyc', '103': 'nyc', '104': 'nyc',
    '111': 'nyc', '112': 'nyc', '113': 'nyc', '114': 'nyc',
    '900': 'la', '901': 'la', '902': 'la', '903': 'la', '904': 'la', '905': 'la',
    '906': 'la', '907': 'la', '908': 'la', '910': 'la', '911': 'la', '912': 'la',
    '913': 'la', '914': 'la', '915': 'la', '916': 'la',
    '606': 'chicago',
    '770': 'houston', '772': 'houston', '773': 'houston', '774': 'houston', '775': 'houston',
    '850': 'phoenix', '851': 'phoenix', '852': 'phoenix', '853': 'phoenix',
    '191': 'philadelphia',
    '782': 'san-antonio',
    '021': 'boston', '022': 'boston',
    '802': 'denver',
    '941': 'sf',
    '946': 'oakland',
    '951': 'san-jose',
    '981': 'seattle'
  };

  // Peninsula cities share 940/950, so these are exact ZIPs, not 3-digit prefixes.
  var ZIP5 = {
    '94301': 'palo-alto', '94303': 'palo-alto', '94304': 'palo-alto', '94306': 'palo-alto',
    '94025': 'menlo-park', '94026': 'menlo-park',
    '94035': 'mountain-view', '94040': 'mountain-view', '94041': 'mountain-view', '94043': 'mountain-view',
    '94061': 'redwood-city', '94062': 'redwood-city', '94063': 'redwood-city', '94064': 'redwood-city', '94065': 'redwood-city',
    '94085': 'sunnyvale', '94086': 'sunnyvale', '94087': 'sunnyvale', '94088': 'sunnyvale', '94089': 'sunnyvale',
    '95014': 'cupertino', '95015': 'cupertino',
    '95050': 'santa-clara', '95051': 'santa-clara', '95052': 'santa-clara',
    '95053': 'santa-clara', '95054': 'santa-clara', '95055': 'santa-clara'
  };

  var CENTERS = {
    nyc: [40.7128, -74.006],
    la: [34.0522, -118.2437],
    chicago: [41.8781, -87.6298],
    houston: [29.7604, -95.3698],
    phoenix: [33.4484, -112.074],
    philadelphia: [39.9526, -75.1652],
    'san-antonio': [29.4241, -98.4936],
    boston: [42.3601, -71.0589],
    denver: [39.7392, -104.9903],
    sf: [37.7749, -122.4194],
    oakland: [37.8044, -122.2712],
    seattle: [47.6062, -122.3321],
    'redwood-city': [37.4852, -122.2364],
    'menlo-park': [37.453, -122.1817],
    'palo-alto': [37.4419, -122.143],
    'mountain-view': [37.3861, -122.0839],
    sunnyvale: [37.3688, -122.0363],
    cupertino: [37.323, -122.0322],
    'santa-clara': [37.3541, -121.9552],
    'san-jose': [37.3382, -121.8863]
  };

  var STATE_PHRASES = [
    'district of columbia', 'new hampshire', 'new jersey', 'new mexico', 'new york',
    'north carolina', 'north dakota', 'rhode island', 'south carolina', 'south dakota',
    'west virginia',
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
    'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
    'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
    'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
    'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'tennessee', 'texas', 'utah',
    'vermont', 'virginia', 'washington', 'wisconsin', 'wyoming',
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'dc', 'fl', 'ga', 'hi', 'id', 'il',
    'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne',
    'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd',
    'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
  ];

  var ISSUES = [
    ['pothole', 'Pothole'],
    ['streetlight', 'Streetlight'],
    ['trash', 'Trash'],
    ['graffiti', 'Graffiti'],
    ['noise', 'Noise'],
    ['animals', 'Animals'],
    ['parking', 'Parking / info'],
    ['other', 'Other']
  ];

  var site = null;
  var activeSlug = '';
  var activeIssue = '';
  var fallbackPlace = null;
  var resolveGen = 0;

  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function nests() { return (site && site.nests) || []; }
  function nestBySlug(slug) {
    var list = nests();
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
    return null;
  }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function stripState(text) {
    var phrases = STATE_PHRASES.slice().sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < phrases.length; i++) {
      var phrase = phrases[i];
      if (text === phrase) return text;
      var tail = ' ' + phrase;
      if (text.length > tail.length && text.slice(-tail.length) === tail) {
        return text.slice(0, -tail.length).trim();
      }
    }
    return text;
  }
  function matchExact(text) {
    if (!text) return '';
    var keys = Object.keys(ALIASES);
    for (var i = 0; i < keys.length; i++) {
      var slug = keys[i];
      var names = ALIASES[slug];
      for (var j = 0; j < names.length; j++) {
        if (text === names[j]) return slug;
      }
    }
    var list = nests();
    for (var k = 0; k < list.length; k++) {
      if (text === norm(list[k].label)) return list[k].slug;
    }
    return '';
  }
  function cityToSlug(raw) {
    var text = norm(raw);
    if (!text) return '';
    return matchExact(text) || matchExact(stripState(text));
  }
  function zipDigits(raw) {
    return String(raw || '').replace(/\D/g, '').slice(0, 5);
  }
  function zipToSlug(raw) {
    var digits = zipDigits(raw);
    if (digits.length < 5) return '';
    return ZIP5[digits] || ZIP3[digits.slice(0, 3)] || '';
  }
  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var p1 = lat1 * Math.PI / 180;
    var p2 = lat2 * Math.PI / 180;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function nearestSlug(lat, lon) {
    var best = '';
    var bestKm = Infinity;
    Object.keys(CENTERS).forEach(function (slug) {
      if (!nestBySlug(slug)) return;
      var km = haversine(lat, lon, CENTERS[slug][0], CENTERS[slug][1]);
      if (km < bestKm) { bestKm = km; best = slug; }
    });
    if (!best || bestKm > MAX_KM) return '';
    return best;
  }
  function queryNest() {
    try { return new URLSearchParams(location.search).get('nest') || ''; }
    catch (e) { return ''; }
  }
  function queryIssue() {
    try { return new URLSearchParams(location.search).get('issue') || ''; }
    catch (e) { return ''; }
  }
  function writeQuery() {
    var url;
    try { url = new URL(location.href); }
    catch (e) { return; }
    if (activeSlug) url.searchParams.set('nest', activeSlug);
    else url.searchParams.delete('nest');
    if (activeIssue) url.searchParams.set('issue', activeIssue);
    else url.searchParams.delete('issue');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  function setNote(msg, isErr) {
    var el = $('city-gate-note');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('is-err', !!isErr);
  }
  function telHref(phone) {
    var raw = String(phone || '').trim();
    if (raw === '311') return 'tel:311';
    var digits = raw.replace(/[^\d+]/g, '');
    return digits ? ('tel:' + digits) : '';
  }
  function honestyLine() {
    return (site && site.honesty) || HONESTY;
  }
  function issueName() {
    for (var i = 0; i < ISSUES.length; i++) if (ISSUES[i][0] === activeIssue) return ISSUES[i][1];
    return '';
  }
  function filingLine() {
    var name = issueName();
    if (name) return 'Marked as ' + name + '. We do not file the report. Use the official channel.';
    return 'We do not file the report. Use the official channel.';
  }
  function placeTitle(place) {
    if (place && place.city && place.state) return place.city + ', ' + place.state;
    if (place && place.city) return place.city;
    return 'Local non-emergency help';
  }
  function searchHref(place) {
    var city = (place && place.city) || '';
    var state = (place && place.state) || '';
    var q = [city, state, '311 official'].filter(Boolean).join(' ');
    if (!city && !state) q = 'local government 311 official';
    return 'https://www.google.com/search?q=' + encodeURIComponent(q);
  }
  function fallbackActions(place) {
    return '<a class="accent-btn" href="tel:311">Call 311</a>' +
      '<a class="ghost-btn" href="' + escapeHtml(searchHref(place)) + '" target="_blank" rel="noopener noreferrer">Search official 311</a>' +
      '<a class="ghost-btn" href="' + USA_LOCAL + '" target="_blank" rel="noopener noreferrer">Find local government</a>';
  }
  function renderPicks() {
    var host = $('nest-picks');
    if (!host) return;
    host.innerHTML = nests().map(function (n) {
      var on = n.slug === activeSlug ? ' is-on' : '';
      return '<button type="button" class="nest-chip' + on + '" data-nest="' + escapeHtml(n.slug) + '">' +
        escapeHtml(n.label || n.slug) + '</button>';
    }).join('');
  }
  function renderIssues() {
    var label = $('issue-label');
    var host = $('issue-picks');
    var show = !!(activeSlug || fallbackPlace);
    if (label) label.hidden = !show;
    if (!host) return;
    host.hidden = !show;
    if (!show) { host.innerHTML = ''; return; }
    host.innerHTML = ISSUES.map(function (pair) {
      var on = pair[0] === activeIssue ? ' is-on' : '';
      return '<button type="button" class="issue-chip' + on + '" data-issue="' + pair[0] + '">' +
        escapeHtml(pair[1]) + '</button>';
    }).join('');
  }
  function renderFallbackCard(place) {
    var host = $('handoff');
    if (!host) return;
    host.hidden = false;
    host.innerHTML =
      '<article class="handoff-card">' +
        '<div class="handoff-kicker">Local handoff</div>' +
        '<h3>' + escapeHtml(placeTitle(place)) + '</h3>' +
        '<p class="handoff-blurb">' + escapeHtml(honestyLine()) + '</p>' +
        '<div class="handoff-actions">' + fallbackActions(place) + '</div>' +
        '<p class="handoff-issue">' + escapeHtml(filingLine()) + '</p>' +
        '<p class="handoff-note">311 is not available in every community. If it does not connect, use Search official 311 or Find local government.</p>' +
      '</article>';
  }
  function renderHandoff() {
    var host = $('handoff');
    if (!host) return;
    if (!activeSlug) {
      if (fallbackPlace) renderFallbackCard(fallbackPlace);
      else { host.hidden = true; host.innerHTML = ''; }
      return;
    }
    var nest = nestBySlug(activeSlug);
    if (!nest) {
      if (fallbackPlace) renderFallbackCard(fallbackPlace);
      else { host.hidden = true; host.innerHTML = ''; }
      return;
    }
    var cities = (site.directory && site.directory.cities) || {};
    var row = cities[activeSlug] || null;
    var label = (row && row.label) || nest.label || activeSlug;
    var blurb = nest.blurb || '';
    var phone = row && row.phone;
    var portal = row && row.portal;
    var note = (site.directory && site.directory.note) || '';
    var name = issueName();
    var actions = '';
    if (phone) {
      actions += '<a class="accent-btn" href="' + escapeHtml(telHref(phone)) + '">Call ' + escapeHtml(phone) + '</a>';
    }
    if (portal) {
      actions += '<a class="ghost-btn" href="' + escapeHtml(portal) + '" target="_blank" rel="noopener noreferrer">Official portal</a>';
    }
    var missingContacts = !phone && !portal;
    if (missingContacts) actions += fallbackActions({ city: nest.label || '', state: '' });
    var issueLine = name
      ? '<p class="handoff-issue">Marked as ' + escapeHtml(name) + '. We do not file this. Use the official channel.</p>'
      : '';
    if (missingContacts) {
      issueLine = '<p class="handoff-issue">' + escapeHtml(filingLine()) + '</p>';
    }
    var missing = missingContacts
      ? '<p class="handoff-blurb">No official handoff is listed for this nest yet.</p>'
      : '';
    var avail = missingContacts
      ? '<p class="handoff-note">311 is not available in every community. If it does not connect, use Search official 311 or Find local government.</p>'
      : '';
    host.hidden = false;
    host.innerHTML =
      '<article class="handoff-card">' +
        '<div class="handoff-kicker">Official channel</div>' +
        '<h3>' + escapeHtml(label) + '</h3>' +
        (blurb ? '<p class="handoff-blurb">' + escapeHtml(blurb) + '</p>' : '') +
        missing +
        '<div class="handoff-actions">' + actions + '</div>' +
        issueLine +
        (note ? '<p class="handoff-note">' + escapeHtml(note) + '</p>' : '') +
        avail +
      '</article>';
  }
  function rememberNest(slug) {
    try {
      if (slug) sessionStorage.setItem(LS_NEST, slug);
      else sessionStorage.removeItem(LS_NEST);
    } catch (e) { /* private mode */ }
  }
  function syncLocalRail() {
    var pin = null;
    var nest = nestBySlug(activeSlug);
    var cities = (site && site.directory && site.directory.cities) || {};
    var row = (activeSlug && !fallbackPlace) ? cities[activeSlug] : null;
    if (nest && row && row.portal) {
      pin = {
        tag: 'Your city',
        headline: row.label || nest.label || 'Local 311',
        snippet: 'Official channel for the place you chose. We do not file the report.',
        meta: 'Local · after you locate',
        url: row.portal
      };
    }
    try {
      if (typeof window.subxSetLocalRailPin === 'function') window.subxSetLocalRailPin(pin);
    } catch (e) { /* rail is optional */ }
  }
  function selectSlug(slug, note, isErr) {
    resolveGen++;
    if (slug && !nestBySlug(slug)) slug = '';
    activeSlug = slug || '';
    fallbackPlace = null;
    rememberNest(activeSlug);
    var nest = nestBySlug(activeSlug);
    writeQuery();
    renderPicks();
    renderIssues();
    renderHandoff();
    syncLocalRail();
    if (note) setNote(note, isErr);
    else if (nest) setNote(nest.label + ' · nest ?nest=' + nest.slug, false);
    else setNote('Pick a city, enter a ZIP, or use location if you want to.', false);
  }
  function showFallback(place, note, isErr) {
    resolveGen++;
    activeSlug = '';
    fallbackPlace = place || { city: '', state: '' };
    rememberNest('');
    var cityEl = $('city-input');
    if (cityEl && fallbackPlace.city && !norm(cityEl.value)) cityEl.value = fallbackPlace.city;
    writeQuery();
    renderPicks();
    renderIssues();
    renderHandoff();
    syncLocalRail();
    setNote(note || (placeTitle(fallbackPlace) + '. We do not file the report.'), !!isErr);
  }
  function lookupZip(zip) {
    return fetch('https://api.zippopotam.us/us/' + encodeURIComponent(zip))
      .then(function (res) {
        if (!res.ok) throw new Error('zip');
        return res.json();
      })
      .then(function (data) {
        var places = (data && data.places) || [];
        if (!places.length) return null;
        var p = places[0];
        return {
          city: p['place name'] || '',
          state: p.state || '',
          stateAbbr: p['state abbreviation'] || '',
          zip: data['post code'] || zip
        };
      });
  }
  function lookupCity(name) {
    var q = String(name || '').trim();
    if (q.length < 2) return Promise.resolve(null);
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(q) + '&count=5&language=en&format=json';
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('city');
        return res.json();
      })
      .then(function (data) {
        var results = (data && data.results) || [];
        var wanted = stripState(norm(q));
        var us = results.filter(function (r) {
          return r && r.country_code === 'US' && r.name && r.admin1;
        });
        if (!us.length) return null;
        var exact = us.filter(function (r) { return norm(r.name) === wanted; });
        var pool = exact.length ? exact : us;
        pool.sort(function (a, b) { return (b.population || 0) - (a.population || 0); });
        var best = pool[0];
        return {
          city: best.name,
          state: best.admin1,
          stateAbbr: '',
          zip: (best.postcodes && best.postcodes[0]) || ''
        };
      });
  }
  function finishPlace(place, token, typedCity) {
    if (token !== resolveGen) return;
    if (place && place.city) {
      var slug = cityToSlug(place.city);
      if (slug && nestBySlug(slug)) {
        selectSlug(slug, '', false);
        return;
      }
      var cityEl = $('city-input');
      if (cityEl && !norm(cityEl.value)) cityEl.value = place.city;
      showFallback(place, place.city + ', ' + place.state + '. Local handoff below. We do not file the report.', false);
      return;
    }
    showFallback(
      { city: typedCity || '', state: '' },
      'We could not confirm that place. Use the official links below. We do not file the report.',
      true
    );
  }
  function resolveNational(cityText, digits) {
    var token = ++resolveGen;
    setNote('Looking up that place…', false);
    var chain;
    if (digits.length === 5) {
      chain = lookupZip(digits).catch(function () { return null; }).then(function (place) {
        if (place) return place;
        if (cityText) return lookupCity(cityText).catch(function () { return null; });
        return null;
      });
    } else if (cityText) {
      chain = lookupCity(cityText).catch(function () { return null; });
    } else {
      showFallback(
        { city: '', state: '' },
        'Enter a city or a 5-digit ZIP. Here is a local handoff in the meantime.',
        false
      );
      return;
    }
    chain.then(function (place) {
      finishPlace(place, token, cityText);
    }).catch(function () {
      if (token !== resolveGen) return;
      showFallback(
        { city: cityText || '', state: '' },
        'Place lookup is unavailable. Use the official links below. We do not file the report.',
        true
      );
    });
  }
  function resolveFromForm() {
    var city = ($('city-input') && $('city-input').value) || '';
    var zip = ($('zip-input') && $('zip-input').value) || '';
    var fromCity = cityToSlug(city);
    var fromZip = zipToSlug(zip);
    if (fromCity && fromZip && fromCity !== fromZip) {
      selectSlug(fromCity, 'That ZIP is not in ' + (nestBySlug(fromCity).label) + '. Showing the city you typed.', true);
      return;
    }
    var slug = fromCity || fromZip;
    if (slug) {
      selectSlug(slug, '', false);
      return;
    }
    resolveNational(String(city || '').trim(), zipDigits(zip));
  }
  function useGeo() {
    if (!navigator.geolocation) {
      setNote('This browser has no location API. Type a city or ZIP.', true);
      return;
    }
    setNote('Asking the browser for location…', false);
    navigator.geolocation.getCurrentPosition(function (pos) {
      var slug = nearestSlug(pos.coords.latitude, pos.coords.longitude);
      if (slug) {
        selectSlug(slug, 'Matched the nearest listed city from the location you allowed. Coordinates stayed in this browser.', false);
        return;
      }
      showFallback(
        { city: '', state: '' },
        'No listed city is close enough. Enter a ZIP and we will name the place. Your coordinates stayed in this browser.',
        false
      );
      var zipEl = $('zip-input');
      if (zipEl) zipEl.focus();
    }, function () {
      setNote('Location stayed off. Type a city or ZIP instead.', true);
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  }
  function syncChrome() {
    var banner = document.querySelector('.preview-banner');
    if (!banner) return;
    document.documentElement.style.setProperty('--chrome-h', banner.offsetHeight + 'px');
  }
  function paintHonesty() {
    var el = $('honesty-line');
    if (el) el.textContent = honestyLine();
  }
  function paintPrompt() {
    var prompt = $('city-gate-prompt');
    var gate = site && site.locationGate;
    if (prompt && gate && gate.prompt) prompt.textContent = gate.prompt;
    var geo = $('geo-opt-in');
    if (geo) geo.hidden = !(gate && gate.geolocationOptIn);
  }
  function boot(data) {
    site = data || {};
    paintHonesty();
    paintPrompt();
    syncChrome();
    window.addEventListener('resize', syncChrome);
    var fromQuery = queryNest();
    var issue = queryIssue();
    if (issue) {
      for (var i = 0; i < ISSUES.length; i++) if (ISSUES[i][0] === issue) activeIssue = issue;
    }
    var stored = '';
    try { stored = sessionStorage.getItem(LS_NEST) || ''; } catch (e) { stored = ''; }
    var initial = nestBySlug(fromQuery) ? fromQuery : (nestBySlug(stored) ? stored : '');
    renderPicks();
    if (initial) selectSlug(initial, '', false);
    else setNote('Location is optional. The button asks the browser. We do not guess from your network.', false);

    var form = $('city-gate-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      resolveFromForm();
    });
    var geo = $('geo-opt-in');
    if (geo) geo.addEventListener('click', useGeo);
    var picks = $('nest-picks');
    if (picks) picks.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-nest]') : null;
      if (!btn) return;
      selectSlug(btn.getAttribute('data-nest'), '', false);
    });
    var issues = $('issue-picks');
    if (issues) issues.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-issue]') : null;
      if (!btn) return;
      var next = btn.getAttribute('data-issue') || '';
      activeIssue = (activeIssue === next) ? '' : next;
      writeQuery();
      renderIssues();
      renderHandoff();
    });
  }

  fetch(SITE_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('site.json');
      return res.json();
    })
    .then(boot)
    .catch(function () {
      boot({ honesty: HONESTY, nests: [], directory: { cities: {} }, locationGate: { enabled: true, geolocationOptIn: true, prompt: "Where are you? We'll find your city's non-emergency 311." } });
    });
})();
