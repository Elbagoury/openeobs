
/* istanbul ignore next */
var NHMobilePatient,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

NHMobilePatient = (function(superClass) {
  extend(NHMobilePatient, superClass);

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  function NHMobilePatient(refused, partialType) {
    var dataId, self;
    if (refused == null) {
      refused = false;
    }
    if (partialType == null) {
      partialType = "dot";
    }
    self = this;
    NHMobilePatient.__super__.constructor.call(this);
    self.setUpObsMenu(self);
    self.setUpTableView();
    self.setUpChartSelect(self);
    self.setUpTabs(self);
    dataId = document.getElementById('graph-content').getAttribute('data-id');
    self.refused = refused;
    self.partial_type = partialType;
    self.chartElement = "chart";
    self.tableElement = "table-content";
    Promise.when(this.call_resource(this.urls['ajax_get_patient_obs']('ews', dataId))).then(function(raw_data) {
      var data, obs_data, server_data;
      server_data = raw_data[0];
      data = server_data.data;
      obs_data = data.obs;
      return self.draw_graph(self, obs_data, 'ews');
    });
  }

  NHMobilePatient.prototype.setUpObsMenu = function(self) {
    var obs, obs_menu;
    obs_menu = document.getElementById('obsMenu');
    if (obs_menu) {
      obs_menu.style.display = 'none';
    }
    obs = document.getElementsByClassName('obs');

    /* istanbul ignore else */
    if (obs && obs.length > 0) {
      return obs[0].addEventListener('click', function(e) {
        return self.handle_event(e, self.show_obs_menu, true);
      });
    }
  };

  NHMobilePatient.prototype.setUpTableView = function() {
    var table_view;
    table_view = document.getElementById('table-content');
    return table_view.style.display = 'none';
  };

  NHMobilePatient.prototype.setUpChartSelect = function(self) {
    var chartSelect;
    chartSelect = document.getElementById('chart_select');
    if (chartSelect) {
      return chartSelect.addEventListener('change', function(event) {
        return self.handle_event(event, self.change_chart, false, [self]);
      });
    }
  };

  NHMobilePatient.prototype.setUpTabs = function(self) {
    var i, len, results, tab, tabs, tabs_el;
    tabs_el = document.getElementsByClassName('tabs');
    tabs = tabs_el[0].getElementsByTagName('a');
    results = [];
    for (i = 0, len = tabs.length; i < len; i++) {
      tab = tabs[i];
      results.push(tab.addEventListener('click', function(e) {
        return self.handle_event(e, self.handle_tabs, true);
      }));
    }
    return results;
  };

  NHMobilePatient.prototype.handle_tabs = function(event) {
    var i, len, tab, tab_target, tabs, target_el;
    tabs = document.getElementsByClassName('tabs')[0].getElementsByTagName('a');
    for (i = 0, len = tabs.length; i < len; i++) {
      tab = tabs[i];
      tab.classList.remove('selected');
    }
    document.getElementById('graph-content').style.display = 'none';
    document.getElementById('table-content').style.display = 'none';
    target_el = event.src_el;
    target_el.classList.add('selected');
    tab_target = target_el.getAttribute('href').replace('#', '');
    return document.getElementById(tab_target).style.display = 'block';
  };

  NHMobilePatient.prototype.change_chart = function(event, self) {
    var chart, dataId, new_data_model, table;
    chart = document.getElementById(self.chartElement);
    table = document.getElementById(self.tableElement);
    chart.innerHTML = '';
    table.innerHTML = '';
    new_data_model = event.src_el.value;
    dataId = document.getElementById('graph-content').getAttribute('data-id');
    return Promise.when(self.call_resource(self.urls['ajax_get_patient_obs'](new_data_model, dataId))).then(function(raw_data) {
      var data, obs_data, server_data;
      server_data = raw_data[0];
      data = server_data.data;
      obs_data = data.obs;
      return self.draw_graph(self, obs_data, new_data_model);
    });
  };

  NHMobilePatient.prototype.show_obs_menu = function(event) {
    var body, menu, obs_menu, pat, pats;
    obs_menu = document.getElementById('obsMenu');
    body = document.getElementsByTagName('body')[0];
    menu = '<ul class="menu">' + obs_menu.innerHTML + '</ul>';
    pats = document.querySelectorAll('a.patientInfo h3.name strong');
    pat = '';
    if (pats.length > 0) {
      pat = pats[0].textContent;
    }
    return new NHModal('obs_menu', 'Pick an observation for ' + pat, menu, ['<a href="#" data-action="close" data-target="obs_menu">Cancel</a>'], 0, body);
  };

  NHMobilePatient.prototype.draw_graph = function(self, server_data, data_model) {
    var chart_el, chart_func, chart_func_name, controls, graph_content, graph_tabs, table_func, table_func_name, valid_chart, valid_table;
    graph_content = document.getElementById('graph-content');
    controls = document.getElementById('controls');
    chart_el = document.getElementById(self.chartElement);
    graph_tabs = graph_content.parentNode.getElementsByClassName('tabs')[0];
    chart_func_name = 'draw' + data_model.capitalize() + 'Chart';
    table_func_name = 'draw' + data_model.capitalize() + 'Table';
    if (server_data.length > 0) {
      controls.style.display = 'block';
      graph_tabs.style.display = 'block';
      chart_func = window[chart_func_name];
      table_func = window[table_func_name];
      valid_chart = typeof chart_func === 'function';
      valid_table = typeof table_func === 'function';
      if (!valid_chart || !valid_table) {
        graph_tabs.style.display = 'none';
      } else {
        graph_tabs.style.display = 'block';
      }
      if (valid_chart) {
        chart_func(self, server_data);
      }
      if (valid_table) {
        return table_func(self, server_data);
      }
    } else {
      controls.style.display = 'none';
      chart_el.innerHTML = '<h2>No observation data available for patient</h2>';
      return graph_tabs.style.display = 'none';
    }
  };

  return NHMobilePatient;

})(NHMobile);


/* istanbul ignore if */

if (!window.NH) {
  window.NH = {};
}


/* istanbul ignore else */

if (typeof window !== "undefined" && window !== null) {
  window.NH.NHMobilePatient = NHMobilePatient;
}
