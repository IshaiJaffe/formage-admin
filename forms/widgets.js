'use strict';
if (!module.parent) console.error('Please don\'t call me directly.I am just the main app\'s minion.') || process.process.exit(1);

/*
 TODO:
 2. DateTime Widget
 3. check Autocomplete
 */

var Class = require('sji'),
    util = require('util'),
    _ = require('lodash');

var cloudinary;
try {
   cloudinary = require('cloudinary')
}
catch(ex) {}


function escape(str) {
    if (str === undefined)
        return '';

    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


var Widget = exports.Widget = Class.extend({
    init: function (options) {
        this.options = options;
        this.limit = this.options.limit || 50;
        this.required = options.required || false;
        this.validators = options.validators || [];
        this.attrs = options.attrs || {};
        if(this.options.readOnly)
            this.attrs['readonly'] = this.attrs['readonly'] || 'readonly';
        this.attrs.class = this.attrs.class || [];
        this.attrs.class.push(this.required ? 'required_label' : 'optional_label');
        this.data = options.data || {};
        this.name = '';
        this.value = undefined;
        options.static = options.static || {};
        this.static = {
            css: options.static.css || [],
            js: options.static.js || []
        };
    },

    pre_render: function (callback) {
        callback();
    },

    render: function () {
        return this;
    },

    render_attributes: function (res) {
        this.attrs['name'] = this.name;
        this.attrs['id'] = 'id_' + this.name;

        Object.keys(this.attrs).forEach(function(attr) {
            var value = Array.isArray(this[attr]) ? this[attr].join(' ') : this[attr];
            res.write(' ' + attr + '="' + escape(value) + '"');
        }, this.attrs);

        Object.keys(this.data).forEach(function(attr) {
            var value = Array.isArray(this[attr]) ? this[attr].join(' ') : this[attr];
            res.write(' data-' + attr + '="' + escape(value) + '"');
        }, this.data);

        return this;
    }
});


exports.InputWidget = Widget.extend({
    init: function (type, options) {
		options.attrs = options.attrs || {};
        options.attrs.type = options.attrs.type || type;
        this._super(options);
    },
    render: function (res) {

        res.write('\n<input' + (typeof(this.value) != 'undefined' && this.value !== null ? ' value="' + escape(this.value) + '"' : '') );
        this.render_attributes(res);
        res.write(' />\n');
        return this;
    }
});


exports.HiddenWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('hidden', options);
    }
});


exports.TextWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('text', options);
        options.attrs = options.attrs || {};
        if(options.help)
            options.attrs['placeholder'] = options.help;
    }
});


exports.PasswordWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('password', options);
    }
});


exports.TextAreaWidget = Widget.extend({
    init:function(options){
        this._super(options);
        options.attrs = options.attrs || {};
        if(options.help)
            options.attrs['placeholder'] = options.help;
    },
    render: function (res) {
        res.write('\n<textarea ');
        this.render_attributes(res);
        res.write(' >');
        res.write(escape(this.value || ''));
        res.write('</textarea>\n');
        return this;
    }
});


exports.RichTextAreaWidget = exports.TextAreaWidget.extend({
    init: function (options) {
        this._super(options);
        this.attrs.class.push('ckeditor');
        this.static.js.push('/ckeditor/ckeditor.js');
    },
    render: function (res) {
        res.write('\n<div class="nf_widget">\n');
        this._super(res);
        res.write('\n</div>\n');
    }
});


exports.DateWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('text', options);
        this.attrs.class.push('nf_datepicker');
        this.static.js.push('/datepicker/bootstrap-datepicker.js');
        this.static.css.push('/datepicker/datepicker.css');
    },
    render: function (res) {
        res.write('\n<div class="input-append date">\n');
        if(this.value)
            this.value = Number(this.value);
        this._super(res);
        res.write('\n<span class="add-on"><i class="icon-calendar"></i></span>\n');
        res.write('\n</div>\n');
    }
});


exports.DateTimeWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('text', options);
        this.attrs['data-format'] = "dd/MM/yyyy hh:mm:ss";
        this.static.js.push('/vendor/bootstrap-datetimepicker.min.js');
        this.static.css.push('/vendor/bootstrap-datetimepicker.min.css');
    },
    render: function (res) {
        var widget_id =  'datetimepicker' + this.name;
        res.write('\n<div class="input-append date nf_timepicker" id="' + widget_id + '">\n');
        if(this.value)
            this.value = Number(this.value);
        this._super(res);
        res.write('\n<span class="add-on">\n<i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>\n</span>\n</div>\n');
        var script = "$('#" + widget_id + "').datetimepicker().datetimepicker('setLocalDate',new Date(" + this.value  + ")); ";
        res.write('<script>' + script + '</script>');
    }
});


exports.TimeWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('time', options);
        this.attrs.class.push('nf_timepicker');
        this.static.js.push('/timepicker/bootstrap-timepicker.js');
        this.static.css.push('/timepicker/timepicker.css');
    },
    render: function (res) {
        res.write('\n<div class="input-append bootstrap-timepicker-component">\n');
        this._super(res);
        res.write('\n<span class="add-on"><i class="icon-time"></i></span>\n');
        res.write('\n</div>\n');
    }
});


exports.NumberWidget = exports.InputWidget.extend({
    init: function (options) {
        options = options || {};
        options.attrs = options.attrs || {};
        if ('min' in options) {
            options.attrs.min = options.min;
        }
        if ('max' in options) {
            options.attrs.max = options.max;
        }
        options.attrs.step = options.attrs.step || options.step || 'any';
        this._super('number', options);
    }
});


exports.CheckboxWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('checkbox', options);
    },
    render: function (res) {
        var old_value = this.value;
        if (this.value)
            this.attrs['checked'] = 'checked';
        else
            delete this.attrs['checked'];
        this.value = 'on';
        var ret = this._super(res);
        this.value = old_value;
        return ret;

    }
});


exports.ChoicesWidget = Widget.extend({
    init: function (options) {
        this.choices = options.choices || [];
        this._super(options);
    },


    isSelected: function (choice) {
        if (Array.isArray(this.value)) {
            return Boolean(this.value.indexOf(choice)>-1);
        } else {
            return choice == this.value;
        }
    },


    prepareValues: function () {
        if (!this.names || !this.values) {
            this.names = new Array(this.choices.length);
            this.values = new Array(this.choices.length);
            for (var i = 0; i < this.choices.length; i++) {
                if (typeof(this.choices[i]) == 'object' && this.choices[i]) {
                    this.names[i] = this.choices[i][1];
                    this.values[i] = this.choices[i][0];
                } else {
                    this.names[i] = this.choices[i];
                    this.values[i] = this.choices[i];
                }
            }
        }
    },


    render: function (res) {
        this.prepareValues();
        res.write('\n<select ');
        this.render_attributes(res);
        res.write(' >\n');
        var found_selected = false;
        if (!this.required) {
            var selected = this.value ? '' : 'selected="selected" ';
            if (selected) {
                found_selected = true;
            }
			if(!this.options.attrs.multiple)
            	res.write('\n<option ' + selected + 'value="">' + (this.options.help || '') + '..</option>\n');
        }
        for (var i = 0; i < this.values.length; i++) {
            var selected2 = this.isSelected(this.values[i]) ? 'selected="selected" ' : '';
            if (selected2) {
                found_selected = true;
            }
            res.write('\n<option ' + selected2 + 'value="' + this.values[i] + '">' + this.names[i] + '</option>\n');
        }
        if (!found_selected && this.value && !Array.isArray(this.value)) {
            res.write('\n<option selected="selected" value="' + this.value + '">Current</option>\n');
        }
        res.write('\n</select>\n');
        return this;
    }
});


exports.RefWidget = exports.ChoicesWidget.extend({
    init: function (options) {
        this.ref = options.ref;
        if (!this.ref) {
            throw new TypeError('model was not provided');
        }
        this._super(options);
		if(options.attrs && options.attrs.multiple){
			this.static.js.push('/select2/select2.js');
			this.static.css.push('/select2/select2.css');
			this.attrs.class.push('nf_comb');
			delete this.attrs['data-ref'];
		}
		else {
			this.refForm = options.refForm || options.ref.label;
			this.attrs['data-ref'] = this.refForm;
		}
    },
    pre_render: function (callback) {
        var self = this;
        var base = self._super;
        var qry;
        if(this.options.constraints){
            if(!self.value)
                qry = self.options.constraints;
            else if(Array.isArray(self.value)){
                var ids = _(self.value).compact().value();
                qry = ids.length ? {$or:[this.options.constraints,{_id:{$in:ids}}]} : self.options.constraints;
            }
            else
                qry = {$or:[this.options.constraints,{_id:self.value + ''}]};
        }
        else
            qry = {};
        if (typeof(this.ref.find) != 'function')
            return base.call(self, callback);
        this.ref.find(qry).limit(self.limit).exec(function (err, objects) {
            if (err)
                return callback(err);
            self.choices = [];
            for (var i = 0; i < objects.length; i++) {
                var label = objects[i].toString ? objects[i].toString() : '';
                self.choices.push([objects[i].id, label]);
            }
            if(!self.required)
                self.choices.unshift(['','']);
            return base.call(self, callback);
        });
    }
});


exports.ListWidget = Widget.extend({
    init: function (options) {
        this._super(options);
    },
    render: function (res, render_template, render_item) {
        res.write('\n<div class="nf_listfield" name="' + this.name + '" ');
        this.render_attributes(res);
        res.write('>\n<div class="nf_hidden_template">\n');
        render_template(res);
        res.write('\n</div>\n<ul>\n');
        this.value = this.value || [];
        for (var i = 0; i < this.value.length; i++) {
            res.write('\n<li>\n');
            render_item(res, i);
            res.write('\n</li>\n');
        }
        res.write('\n</ul>\n</div>\n');
    }
});


exports.FileWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('file', options);
    },
    render: function (res) {
        this._super(res);
        let url = this.value && this.value.url;
        if(url) {
          try {
            const fields = require("./fields");
            const storage = fields.getFileStorage();
            if (storage) {
              url = storage.getReadableUrl(url);
            }
          } catch (e) {

          }
        }
        if (url) {
            res.write('\n<a href="' + url + '">\n' + this.value.path + '</a>\n<input type="checkbox" name="' + this.name + '_clear" value="Clear" />\n Clear\n');
        }
    }
});


exports.PictureWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super('file', options);
    },

    render: function (res) {
        if (this.value && this.value.url) {
            var thumbnail_url = cloudinary.image(
                this.value.public_id, {
                    //format: 'png',
                    version:this.value.version,
                    width: 150,
                    height: 110,
                    crop: 'fill',
                    alt: this.value.original_name,
                    title: this.value.original_name
                }
            );
            res.write(util.format('<a href="%s" target="_blank">%s</a>\n', this.value.url, thumbnail_url));
            res.write(util.format('<input type="checkbox" name="%s_clear" value="false" />\nClear\n', this.name));
        }
        res.write(util.format('<input type="hidden" name="%s" value="%s" />\n', this.name, escape(JSON.stringify(this.value))));
        this._super(res);
    },
    render_attributes: function (res) {
        this.name += "_file";
        this._super(res)
    }
});


exports.MapWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super(options.showLatLng ? 'text' : 'hidden', options);
        this.attrs.class.push('nf_mapview');
        this.static.js.push('//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&language=he&libraries=places');
        this.static.js.push('/js/maps.js');
        this.static.css.push('/css/maps.css');
    },

    render: function (res) {
        res.write('<div class="nf_widget">');
        //noinspection JSUnresolvedVariable
        if (!this.options.hide_address) {
            var address = this.value ? this.value.address : '';
            this.attrs['address_field'] = 'id_' + this.name + '_address';
            res.write('\n<input type="text" name="' + this.name + '_address" id="id_' + this.name + '_address" value="' + address + '" />\n');
        }
        var old_value = this.value;
        var geometry = this.value && this.value.geometry;
        var lat = geometry ? (Array.isArray(geometry) ? geometry[0] : geometry.lat) : '';
        var lng = geometry ? (Array.isArray(geometry) ? geometry[1] : geometry.lng) : '';
        this.value = lat + '  ,  ' + lng;
        this._super(res);
        this.value = old_value;
        res.write('\n</div>\n');
    }
});

exports.MapAreaWidget = exports.InputWidget.extend({
    init: function (options) {
        this._super(options.showLatLng ? 'text' : 'hidden', options);
        this.attrs.class.push('nf_mapview_area');
        this.static.js.push('//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&language=he&libraries=places');
        this.static.js.push('/js/maps.js');
        this.static.css.push('/css/maps.css');
    },

    render: function (res) {
        res.write('<div class="nf_widget">');
        var old_value = this.value;
        var tlLat = this.value && this.value.topLeft && this.value.topLeft.geometry ? this.value.topLeft.geometry.lat : '';
        var tlLng = this.value && this.value.topLeft && this.value.topLeft.geometry ? this.value.topLeft.geometry.lng : '';
        var brLat = this.value && this.value.bottomRight && this.value.bottomRight.geometry ? this.value.bottomRight.geometry.lat : '';
        var brLng = this.value && this.value.bottomRight && this.value.bottomRight.geometry ? this.value.bottomRight.geometry.lng : '';
        this.value = tlLat + '  ,  ' + tlLng + ' ; ' + brLat + ' , ' + brLng;
        this._super(res);
        this.value = old_value;
        res.write('\n</div>\n');
    }
});



exports.ComboBoxWidget = exports.ChoicesWidget.extend({
    init: function (options) {
        this._super(options);
        this.static.js.push('/select2/select2.js');
        this.static.css.push('/select2/select2.css');

        this.attrs.class.push('nf_comb');
    }
});


exports.AutocompleteWidget = exports.TextWidget.extend({
    init: function (options) {
        if (!options.url) throw new Error('must specify url');
        if (!options.ref) throw new TypeError('model was not provided');

        this._super(options);
        this.static.js.push('/select2/select2.js');
        this.static.css.push('/select2/select2.css');
        this.attrs.class.push('nf_ref');
        this.attrs['data-ref'] = options.refForm || options.ref.label;

        this.data = this.data || {};
        this.data.url = this.data.url || options.url;
        this.data.data = this.data.data || options.data;

        this.ref = options.ref;
    },


    pre_render: function (callback) {
        var self = this;
        var _super = this._super.bind(self);
        var id = this.value;
        if(Array.isArray(id)){
            id = id.map(function(a) { return a + '';}).filter(function(a) { return a; });
            if(!id.length)
                id = null;
        }

        self.data['name'] = id || '';
        if (!id) return _super(callback);
        var query = Array.isArray(id) ? this.ref.find().where('_id').in(id) : this.ref.findById(id);
        return query.exec(function (err, doc) {
            if (err) return callback(err);
            if (doc) {
                self.doc = doc;
            }
            return _super(callback);
        });
    },


    render: function (res) {
        var self = this;
        var name = self.value;
        if (self.doc) {
            if (Array.isArray(self.doc)) {
                var elem = self.doc.filter(function (d) {return d.id == self.value;})[0];
                name = (elem || '').toString()
            } else {
                name = self.doc.toString();
            }
        }
        self.data.name = name || '';
        self._super(res);
    }
});
