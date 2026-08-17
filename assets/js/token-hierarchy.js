(function () {
  var root = document.querySelector('[data-token-hierarchy]');
  if (!root) return;

  var ELEMENTS_BY_GROUP = {
    text: ['headline', 'body', 'notification', 'label', 'badge'],
    surface: ['overlay', 'vibrant', 'softened'],
    fill: ['navigation', 'spinner', 'backdrop', 'dropdown', 'tile'],
    stroke: ['navigation', 'spinner', 'backdrop', 'dropdown', 'tile'],
    radius: ['minimal', 'rounded', 'full', 'none'],
    spacing: ['xs', 's', 'm', 'lg', 'xl', 'xxl']
  };

  var GROUPS_BY_TYPE = {
    font: ['text'],
    style: ['surface', 'fill', 'stroke'],
    form: ['radius', 'spacing']
  };

  var columns = [
    {
      id: 'namespace',
      label: 'Namespace',
      tone: 'namespace',
      groups: [
        { key: 'system', label: 'System', options: [{ value: 'prisma', label: 'Prisma' }] },
        {
          key: 'theme',
          label: 'Theme',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'high-contrast', label: 'High Contrast' },
            { value: 'accessible', label: 'Accessible' },
            { value: 'inaccessible', label: 'Inaccessible' }
          ]
        }
      ]
    },
    {
      id: 'base',
      label: 'Base',
      tone: 'base',
      groups: [
        {
          key: 'category',
          label: 'Category',
          hint: 'primitives',
          options: [
            { value: 'color', label: 'Color + transparency' },
            { value: 'number', label: 'Number' }
          ]
        }
      ]
    },
    {
      id: 'object',
      label: 'Object',
      tone: 'object',
      groups: [
        {
          key: 'type',
          label: 'Type',
          options: [
            { value: 'font', label: 'Font' },
            { value: 'style', label: 'Style' },
            { value: 'form', label: 'Form' }
          ]
        },
        {
          key: 'group',
          label: 'Group',
          hint: 'semantics',
          options: [],
          dynamic: true
        },
        {
          key: 'element',
          label: 'Element',
          options: [],
          dynamic: true
        }
      ]
    },
    {
      id: 'modifier',
      label: 'Modifier',
      tone: 'modifier',
      groups: [
        {
          key: 'variant',
          label: 'Variant',
          optional: true,
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'tertiary', label: 'Tertiary' },
            { value: 'brand', label: 'Brand' },
            { value: 'success', label: 'Success' },
            { value: 'alert', label: 'Alert' },
            { value: 'error', label: 'Error' }
          ]
        },
        {
          key: 'state',
          label: 'State',
          optional: true,
          options: [
            { value: 'initial', label: 'Initial' },
            { value: 'hover', label: 'Hover' },
            { value: 'selected', label: 'Selected' },
            { value: 'pressed', label: 'Pressed' },
            { value: 'focused', label: 'Focused' },
            { value: 'active', label: 'Active' },
            { value: 'active-disabled', label: 'Active-disabled' },
            { value: 'disabled', label: 'Disabled' }
          ]
        },
        {
          key: 'scale',
          label: 'Scale',
          optional: true,
          options: [
            { value: 'minimal', label: 'Minimal' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'full', label: 'Full' },
            { value: 'none', label: 'None' },
            { value: 'xs', label: 'XS' },
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'lg', label: 'LG' },
            { value: 'xl', label: 'XL' },
            { value: 'xxl', label: 'XXL' }
          ]
        }
      ]
    }
  ];

  var selection = {
    system: 'prisma',
    theme: 'dark',
    category: 'color',
    type: 'font',
    group: 'text',
    element: 'headline',
    variant: 'primary',
    uiState: 'hover',
    scale: ''
  };

  var groupKeyMap = {
    state: 'uiState'
  };

  function selectionKey(groupKey) {
    return groupKeyMap[groupKey] || groupKey;
  }

  function groupsForType(type) {
    return GROUPS_BY_TYPE[type] || [];
  }

  function elementsForGroup(group) {
    return ELEMENTS_BY_GROUP[group] || [];
  }

  function ensureObjectSelections() {
    var groups = groupsForType(selection.type);
    if (!groups.includes(selection.group)) {
      selection.group = groups[0];
    }
    var elements = elementsForGroup(selection.group);
    if (!elements.includes(selection.element)) {
      selection.element = elements[0];
    }
  }

  function tokenParts() {
    ensureObjectSelections();
    var parts = [
      { tone: 'namespace', value: selection.system },
      { tone: 'namespace', value: selection.theme },
      { tone: 'base', value: selection.category },
      { tone: 'object', value: selection.type },
      { tone: 'object', value: selection.group },
      { tone: 'object', value: selection.element }
    ];

    if (selection.variant) parts.push({ tone: 'modifier', value: selection.variant });
    if (selection.uiState) parts.push({ tone: 'modifier', value: selection.uiState });
    if (selection.scale) parts.push({ tone: 'modifier', value: selection.scale });

    return parts;
  }

  function tokenString() {
    return tokenParts()
      .map(function (part) {
        return part.value;
      })
      .join('-');
  }

  var activeMobileTab = 'namespace';
  var TAB_ORDER = ['namespace', 'base', 'object', 'modifier'];

  function isMobileTabs() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function advanceMobileTab(columnId) {
    if (!isMobileTabs()) return;
    var index = TAB_ORDER.indexOf(columnId);
    if (index >= 0 && index < TAB_ORDER.length - 1) {
      activeMobileTab = TAB_ORDER[index + 1];
    }
  }

  function renderColumn(column) {
    var groupsHtml = column.groups
      .map(function (group) {
        return (
          '<div class="token-hierarchy-group">' +
          '<div class="token-hierarchy-group-head">' +
          '<span class="token-hierarchy-group-label">' +
          group.label +
          '</span>' +
          (group.hint ? '<span class="token-hierarchy-group-hint">' + group.hint + '</span>' : '') +
          '</div>' +
          '<div class="token-hierarchy-chips" role="group" aria-label="' +
          column.label +
          ' ' +
          group.label +
          '">' +
          renderOptions(group, column.id) +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    var isActive = column.id === activeMobileTab;
    var mobile = isMobileTabs();

    return (
      '<div class="token-hierarchy-column token-hierarchy-column--' +
      column.tone +
      (mobile && isActive ? ' is-active' : '') +
      '" id="token-panel-' +
      column.id +
      '" role="tabpanel" aria-labelledby="token-tab-' +
      column.id +
      '"' +
      (mobile && !isActive ? ' hidden' : '') +
      '>' +
      '<div class="token-hierarchy-column-head">' +
      column.label +
      '</div>' +
      '<div class="token-hierarchy-column-body">' +
      groupsHtml +
      '</div>' +
      '</div>'
    );
  }

  function renderOptions(group, columnId) {
    var options = group.options;

    if (group.key === 'group') {
      options = groupsForType(selection.type).map(function (value) {
        return { value: value, label: value.charAt(0).toUpperCase() + value.slice(1) };
      });
    }

    if (group.key === 'element') {
      options = elementsForGroup(selection.group).map(function (value) {
        return { value: value, label: value.charAt(0).toUpperCase() + value.slice(1) };
      });
    }

    return options
      .map(function (option) {
        var selected = selection[selectionKey(group.key)] === option.value;
        return (
          '<button type="button" class="token-hierarchy-chip' +
          (selected ? ' is-selected' : '') +
          '" data-column="' +
          columnId +
          '" data-key="' +
          group.key +
          '" data-value="' +
          option.value +
          '" aria-pressed="' +
          selected +
          '">' +
          option.label +
          '</button>'
        );
      })
      .join('');
  }

  function render() {
    var flow =
      '<p class="token-hierarchy-steps" aria-hidden="true">' +
      columns
        .map(function (column, index) {
          return (
            (index ? '<span class="token-hierarchy-steps-sep">→</span>' : '') +
            '<span class="token-hierarchy-step token-hierarchy-step--' +
            column.tone +
            '">' +
            column.label +
            '</span>'
          );
        })
        .join('') +
      '</p>';

    var tabs =
      '<div class="token-hierarchy-tabs" role="tablist" aria-label="Token layers">' +
      columns
        .map(function (column) {
          var isActive = column.id === activeMobileTab;
          return (
            '<button type="button" class="token-hierarchy-tab token-hierarchy-tab--' +
            column.tone +
            (isActive ? ' is-active' : '') +
            '" id="token-tab-' +
            column.id +
            '" role="tab" aria-selected="' +
            isActive +
            '" aria-controls="token-panel-' +
            column.id +
            '" data-tab="' +
            column.id +
            '">' +
            column.label +
            '</button>'
          );
        })
        .join('') +
      '</div>';

    var board =
      '<div class="token-hierarchy-board">' + columns.map(renderColumn).join('') + '</div>';

    var parts = tokenParts();
    var preview =
      '<div class="token-hierarchy-preview" aria-live="polite">' +
      '<span class="token-hierarchy-preview-label">Built token</span>' +
      '<div class="token-hierarchy-preview-track">' +
      parts
        .map(function (part, index) {
          return (
            (index ? '<span class="token-hierarchy-preview-sep">-</span>' : '') +
            '<span class="token-hierarchy-preview-part token-hierarchy-preview-part--' +
            part.tone +
            '">' +
            part.value +
            '</span>'
          );
        })
        .join('') +
      '</div>' +
      '<p class="token-hierarchy-preview-caption">Unified naming convention — one token name in Figma, the same in the Prisma Theme.</p>' +
      '</div>';

    var mobileHint =
      '<p class="token-hierarchy-mobile-hint">Click through to see how a token name builds up.</p>';

    root.innerHTML =
      '<div class="token-hierarchy-inner">' + preview + mobileHint + tabs + flow + board + '</div>';
  }

  root.addEventListener('click', function (event) {
    var tab = event.target.closest('.token-hierarchy-tab');
    if (tab) {
      activeMobileTab = tab.getAttribute('data-tab');
      render();
      return;
    }

    var chip = event.target.closest('.token-hierarchy-chip');
    if (!chip) return;

    var key = chip.getAttribute('data-key');
    var value = chip.getAttribute('data-value');
    var selKey = selectionKey(key);

    if (selection[selKey] === value) {
      if (key === 'variant' || key === 'state' || key === 'scale') {
        selection[selKey] = '';
      }
      render();
      return;
    }

    selection[selKey] = value;

    if (key === 'type') {
      ensureObjectSelections();
    }

    if (key === 'group') {
      var elements = elementsForGroup(selection.group);
      if (!elements.includes(selection.element)) {
        selection.element = elements[0];
      }
    }

    advanceMobileTab(chip.getAttribute('data-column'));
    render();
  });

  window.addEventListener('resize', function () {
    render();
  });

  render();
})();
