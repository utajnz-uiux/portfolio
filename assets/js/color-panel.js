(function () {
  var root = document.querySelector('[data-color-panel]');
  if (!root) return;

  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

  var HUES = [
    { id: 'green', label: 'green' },
    { id: 'red', label: 'Red' },
    { id: 'orange', label: 'Orange' },
    { id: 'pistachio', label: 'Pistachio' },
    { id: 'cyan', label: 'Cyan' },
    { id: 'grey', label: 'Grey' },
    { id: 'violetred', label: 'VioletRed', solo: true }
  ];

  var BASES = {
    accessible: {
      light: {
        green: '#1F6B3A',
        red: '#A01828',
        orange: '#C45F00',
        pistachio: '#7A7340',
        cyan: '#007AA8',
        grey: '#5C5C5C',
        violetred: '#8E2456'
      },
      dark: {
        green: '#008C45',
        red: '#E2001A',
        orange: '#F57A00',
        pistachio: '#A4A030',
        cyan: '#009BD4',
        grey: '#767676',
        violetred: '#C2187A'
      }
    },
    inaccessible: {
      light: {
        green: '#34C759',
        red: '#FF3B30',
        orange: '#FF9500',
        pistachio: '#B8A060',
        cyan: '#32ADE6',
        grey: '#AEAEB2',
        violetred: '#FF2D92'
      },
      dark: {
        green: '#44D67A',
        red: '#FF5A5F',
        orange: '#FFB340',
        pistachio: '#C4B060',
        cyan: '#5AC8FA',
        grey: '#98989D',
        violetred: '#FF6482'
      }
    }
  };

  var state = { mode: 'dark', contrast: 'accessible' };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return (
      '#' +
      [r, g, b]
        .map(function (v) {
          var h = Math.round(Math.max(0, Math.min(255, v))).toString(16);
          return h.length === 1 ? '0' + h : h;
        })
        .join('')
    );
  }

  function mix(hex, target, amount) {
    var a = hexToRgb(hex);
    var b = hexToRgb(target);
    return rgbToHex(
      a.r + (b.r - a.r) * amount,
      a.g + (b.g - a.g) * amount,
      a.b + (b.b - a.b) * amount
    );
  }

  function ramp(base, accessible) {
    var shades = [];
    var tints = [];
    var i;
    var shadeStep = accessible ? 0.085 : 0.065;
    var tintStep = accessible ? 0.09 : 0.115;
    for (i = 1; i <= 9; i += 1) {
      shades.push(mix(base, '#000000', shadeStep * i));
      tints.push(mix(base, '#FFFFFF', tintStep * i));
    }
    return { base: base, shades: shades, tints: tints };
  }

  function palette(hueId) {
    return ramp(
      BASES[state.contrast][state.mode][hueId],
      state.contrast === 'accessible'
    );
  }

  function txt(x, y, str, opts) {
    opts = opts || {};
    return (
      '<text x="' +
      x +
      '" y="' +
      y +
      '" fill="' +
      (opts.fill || '#1A1310') +
      '" font-family="' +
      MONO +
      '" font-size="' +
      (opts.size || 10) +
      '" font-weight="' +
      (opts.weight || 400) +
      '"' +
      (opts.anchor ? ' text-anchor="' + opts.anchor + '"' : '') +
      (opts.opacity ? ' opacity="' + opts.opacity + '"' : '') +
      '>' +
      esc(str) +
      '</text>'
    );
  }

  function rect(x, y, w, h, fill, extra) {
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      fill +
      '"' +
      (extra || '') +
      '/>'
    );
  }

  function swatchRow(x, y, colors, sw, sh, gap) {
    gap = gap || 2;
    return colors
      .map(function (c, i) {
        return rect(x + i * (sw + gap), y, sw, sh, c);
      })
      .join('');
  }

  function hueRowLight(y, hue, cfg) {
    var p = palette(hue.id);
    var labelX = 28;
    var baseX = 72;
    var rampX = 128;
    var sw = 17;
    var sh = 19;
    var out =
      txt(labelX, y + 30, hue.label, { fill: cfg.ink, size: 10 }) +
      rect(baseX, y + 6, 48, 48, p.base);

    if (!hue.solo) {
      out +=
        swatchRow(rampX, y + 6, p.shades, sw, sh) +
        swatchRow(rampX, y + 29, p.tints, sw, sh) +
        txt(488, y + 18, '-s1,2,3,4,5,6,7,8,9', {
          fill: cfg.muted,
          size: 8,
          anchor: 'end'
        }) +
        txt(488, y + 41, '-t1,2,3,4,5,6,7,8,9', {
          fill: cfg.muted,
          size: 8,
          anchor: 'end'
        });
    }
    return out;
  }

  function guideLinesLight(y0, y1, cfg) {
    var xs = [222, 326, 430];
    var labels = ['-t4', '-s5', '-t8'];
    var out = '';
    xs.forEach(function (x, i) {
      out +=
        '<line x1="' +
        x +
        '" y1="' +
        y0 +
        '" x2="' +
        x +
        '" y2="' +
        y1 +
        '" stroke="' +
        cfg.guide +
        '" stroke-width="1"/>' +
        txt(x, y1 + 14, labels[i], {
          fill: cfg.muted,
          size: 8,
          anchor: 'middle'
        });
    });
    return out;
  }

  function renderLight() {
    var acc = state.contrast === 'accessible';
    var cfg = {
      bg: '#FFFFFF',
      ink: '#1A1310',
      muted: 'rgba(26,19,16,0.45)',
      caption: 'rgba(26,19,16,0.38)',
      guide: 'rgba(26,19,16,0.12)',
      title: acc ? 'Accessible Colours' : 'Inaccessible Colours',
      disabled: acc ? '#767676' : '#AEAEB2'
    };
    var rowStart = 156;
    var rowStep = 78;
    var rampTop = rowStart - 4;
    var rampBottom = rowStart + rowStep * 6 + 44;
    var h = rampBottom + 36;

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ' +
      h +
      '" class="color-panel-svg" role="img" aria-label="' +
      esc(cfg.title) +
      '">' +
      rect(0, 0, 520, h, cfg.bg, ' rx="14"') +
      txt(28, 40, cfg.title, { fill: cfg.ink, size: 22, weight: 500 }) +
      txt(28, 72, 'White', { fill: cfg.caption, size: 9 }) +
      txt(108, 72, 'Black', { fill: cfg.caption, size: 9 }) +
      txt(188, 72, 'Obsidian', { fill: cfg.caption, size: 9 }) +
      rect(108, 80, 52, 52, '#000000') +
      rect(188, 80, 52, 52, '#1A1310') +
      guideLinesLight(rampTop, rampBottom, cfg);

    HUES.forEach(function (hue, i) {
      svg += hueRowLight(rowStart + i * rowStep, hue, cfg);
    });

    svg += '</svg>';
    return { svg: svg, aspect: '520 / ' + h, mode: 'light' };
  }

  function renderDark() {
    var acc = state.contrast === 'accessible';
    var cfg = {
      bg: '#3A3A3A',
      ink: 'rgba(255,255,255,0.72)',
      muted: 'rgba(255,255,255,0.45)',
      caption: 'rgba(255,255,255,0.38)',
      guide: 'rgba(255,255,255,0.14)',
      title: acc ? 'Accessible Colours' : 'Inaccessible Colours',
      disabled: acc ? '#8A8884' : '#6A6A6A',
      subOrange: acc ? ['#FF9C5A', '#FFBB87'] : ['#FFB340', '#FFD699'],
      subRed: acc ? ['#90111F', '#FF6B6B'] : ['#CC2233', '#FF8888']
    };
    var h = 780;
    var rowStart = 248;
    var rowStep = 68;
    var rampTop = rowStart - 6;
    var rampBottom = rowStart + rowStep * 6 + 40;

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 ' +
      h +
      '" class="color-panel-svg" role="img" aria-label="' +
      esc(cfg.title) +
      '">' +
      rect(0, 0, 1024, h, cfg.bg) +
      rect(1, 1, 1022, h - 2, 'none', ' rx="12" stroke="rgba(255,255,255,0.06)" stroke-width="1"') +
      txt(40, 52, cfg.title, { fill: '#FFFFFF', size: 28, weight: 500 }) +
      txt(984, 48, 'BG grey-s6', { fill: cfg.muted, size: 11, weight: 600, anchor: 'end' }) +
      txt(40, 96, 'Typo Maincolors', { fill: cfg.muted, size: 11, weight: 600 }) +
      txt(40, 108, 'White', { fill: cfg.caption, size: 9 }) +
      rect(40, 116, 52, 52, '#FFFFFF') +
      txt(48, 148, 'Obsidian', { fill: '#1A1310', size: 10, weight: 500 }) +
      txt(112, 108, 'Black', { fill: cfg.caption, size: 9 }) +
      rect(112, 116, 52, 52, '#000000') +
      txt(124, 140, 'White', { fill: '#FFFFFF', size: 10, weight: 500 }) +
      txt(124, 152, 'Grey-t6', { fill: 'rgba(255,255,255,0.55)', size: 8 }) +
      txt(184, 108, 'Obsidian', { fill: cfg.caption, size: 9 }) +
      rect(184, 116, 52, 52, '#1A1310') +
      txt(190, 148, acc ? 'Disabled grey-t4' : 'Disabled', {
        fill: cfg.disabled,
        size: 10,
        weight: 500
      }) +
      txt(280, 96, 'System background & surface depth', {
        fill: cfg.muted,
        size: 11,
        weight: 600
      }) +
      txt(280, 112, 'Surfaces are either filled colors or transparent colors using levels of white.', {
        fill: cfg.caption,
        size: 8
      });

    var stack = [
      { x: 280, y: 132, w: 88, h: 56, op: 0.1, label: 's1 (10%)' },
      { x: 296, y: 124, w: 88, h: 56, op: 0.16, label: 's2' },
      { x: 312, y: 116, w: 88, h: 56, op: 0.22, label: 's3' },
      { x: 328, y: 108, w: 88, h: 56, op: 0.28, label: 's4' },
      { x: 344, y: 100, w: 88, h: 56, op: 0.34, label: 's5' },
      { x: 360, y: 92, w: 88, h: 56, op: 0.4, label: 's6 (60%)' }
    ];
    stack.forEach(function (s) {
      svg += rect(s.x, s.y, s.w, s.h, '#FFFFFF', ' opacity="' + s.op + '"');
    });
    svg +=
      rect(448, 88, 52, 52, '#1A1310') +
      txt(452, 120, 'Obsidian', { fill: cfg.caption, size: 8 }) +
      txt(452, 132, 't0', { fill: cfg.caption, size: 8 }) +
      txt(560, 96, 'Dynamic Subcolors', { fill: cfg.muted, size: 11, weight: 600 }) +
      rect(628, 88, 28, 14, '#FF6B00', ' rx="2"') +
      txt(634, 99, 'New', { fill: '#FFFFFF', size: 8, weight: 600 }) +
      txt(560, 124, 'Orange', { fill: cfg.ink, size: 9 }) +
      rect(610, 116, 36, 14, cfg.subOrange[0]) +
      rect(650, 116, 36, 14, cfg.subOrange[1]) +
      txt(560, 152, 'Red', { fill: cfg.ink, size: 9 }) +
      rect(610, 144, 36, 14, cfg.subRed[0]) +
      rect(650, 144, 36, 14, cfg.subRed[1]) +
      txt(720, 96, 'Input field example', { fill: cfg.muted, size: 11, weight: 600 }) +
      rect(720, 116, 88, 28, 'rgba(255,255,255,0.04)', ' stroke="' + cfg.subOrange[0] + '" stroke-width="1"') +
      txt(728, 128, '▾', { fill: cfg.subOrange[0], size: 10 }) +
      txt(742, 134, 'Dropdown', { fill: cfg.ink, size: 9 }) +
      rect(814, 116, 88, 28, 'rgba(255,255,255,0.04)', ' stroke="' + cfg.subOrange[0] + '" stroke-width="1"') +
      txt(822, 128, '✎', { fill: cfg.subOrange[0], size: 10 }) +
      txt(836, 134, 'Dropdown', { fill: cfg.ink, size: 9 }) +
      rect(908, 116, 96, 28, 'rgba(255,255,255,0.04)', ' stroke="rgba(255,255,255,0.22)" stroke-width="1"') +
      txt(916, 128, '⌕', { fill: cfg.muted, size: 10 }) +
      txt(930, 128, 'Label', { fill: cfg.muted, size: 8 }) +
      txt(930, 138, 'Input', { fill: cfg.ink, size: 9 }) +
      '<line x1="908" y1="144" x2="1004" y2="144" stroke="#E2001A" stroke-width="1"/>' +
      txt(908, 156, 'Supporting text', { fill: '#E2001A', size: 8 }) +
      '<line x1="268" y1="178" x2="268" y2="' +
      (rampBottom + 20) +
      '" stroke="' +
      cfg.guide +
      '" stroke-width="1"/>' +
      '<line x1="612" y1="178" x2="612" y2="' +
      (rampBottom + 20) +
      '" stroke="' +
      cfg.guide +
      '" stroke-width="1"/>' +
      txt(40, 206, acc
        ? 'Text vs BG: At least a ratio of 4.5:1 or higher. Therefore don\u2019t hesitate to design new colors and icons if needed.'
        : 'Legacy palette \u2014 lower contrast pairs kept for reference. Toggle accessible to see the adjusted ramps.', {
        fill: cfg.muted,
        size: 9
      });

    var guideXs = [334, 478, 622];
    var guideLabels = ['-t4', '-s5', '-t8'];
    guideXs.forEach(function (x, i) {
      svg +=
        '<line x1="' +
        x +
        '" y1="' +
        rampTop +
        '" x2="' +
        x +
        '" y2="' +
        rampBottom +
        '" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>' +
        txt(x, rampTop - 8, guideLabels[i], {
          fill: cfg.muted,
          size: 8,
          anchor: 'middle'
        }) +
        txt(x, rampBottom + 14, guideLabels[i], {
          fill: cfg.muted,
          size: 8,
          anchor: 'middle'
        });
    });

    svg += txt(334, rampTop - 20, 'New Subcolors on dark surface', {
      fill: cfg.caption,
      size: 8,
      anchor: 'middle'
    });
    svg += txt(556, rampTop - 20, 'Combined colors', {
      fill: cfg.caption,
      size: 8,
      anchor: 'middle'
    });

    HUES.forEach(function (hue, i) {
      var y = rowStart + i * rowStep;
      var p = palette(hue.id);
      var baseX = 96;
      var rampX = 154;
      var sw = 17;
      var sh = 19;
      svg +=
        txt(40, y + 38, hue.label, { fill: cfg.ink, size: 10 }) +
        rect(baseX, y + 14, 48, 48, p.base);
      if (!hue.solo) {
        svg +=
          swatchRow(rampX, y + 14, p.shades, sw, sh) +
          swatchRow(rampX, y + 37, p.tints, sw, sh) +
          txt(984, y + 26, '-s1,2,3,4,5,6,7,8,9', {
            fill: cfg.muted,
            size: 8,
            anchor: 'end'
          }) +
          txt(984, y + 49, '-t1,2,3,4,5,6,7,8,9', {
            fill: cfg.muted,
            size: 8,
            anchor: 'end'
          });
      }
    });

    svg +=
      txt(40, h - 18, 'Color variants - less saturation, more contrast', {
        fill: cfg.caption,
        size: 9
      }) +
      txt(984, h - 18, 'Semantic tokens - Light / Dark', {
        fill: cfg.caption,
        size: 9,
        anchor: 'end'
      }) +
      '</svg>';

    return { svg: svg, aspect: '1024 / ' + h, mode: 'dark' };
  }

  function renderSwitch() {
    return (
      '<div class="color-panel-switch" role="toolbar" aria-label="Colour panel mode">' +
      '<div class="color-panel-switch-group" role="group" aria-label="Contrast">' +
      ['accessible', 'inaccessible']
        .map(function (v) {
          return (
            '<button type="button" class="color-panel-switch-btn' +
            (state.contrast === v ? ' is-on' : '') +
            '" data-contrast="' +
            v +
            '">' +
            (v === 'accessible' ? 'Accessible' : 'Inaccessible') +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="color-panel-switch-group" role="group" aria-label="Theme">' +
      ['light', 'dark']
        .map(function (v) {
          return (
            '<button type="button" class="color-panel-switch-btn' +
            (state.mode === v ? ' is-on' : '') +
            '" data-mode="' +
            v +
            '">' +
            (v === 'light' ? 'Light' : 'Dark') +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '</div>'
    );
  }

  function render() {
    var doc = state.mode === 'light' ? renderLight() : renderDark();
    root.className =
      'color-panel-shell color-panel-shell--' +
      doc.mode +
      ' color-panel-shell--' +
      state.contrast;
    root.style.setProperty('--cp-aspect', doc.aspect);
    root.innerHTML =
      renderSwitch() +
      '<div class="color-panel-stage">' +
      doc.svg +
      '</div>';
  }

  root.addEventListener('click', function (event) {
    var modeBtn = event.target.closest('[data-mode]');
    var contrastBtn = event.target.closest('[data-contrast]');
    if (modeBtn) {
      state.mode = modeBtn.getAttribute('data-mode');
      render();
      return;
    }
    if (contrastBtn) {
      state.contrast = contrastBtn.getAttribute('data-contrast');
      render();
    }
  });

  render();
})();
