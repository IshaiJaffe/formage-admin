
var _extends = require('./common')._extends;


var Widget = exports.Widget = function(options)
{
    this.required = options.required || false;
    this.attrs = options.attrs || {};
    this.validators = options.validators || [];
    this.attrs = options.attrs || {};
    this.attrs.class = this.attrs.class || [];
    this.attrs.class.push(this.required ? 'required_label' : 'optional_label');
    this.name = '';
    this.value = null;
};

Widget.prototype.pre_render = function(callback)
{
    callback(null);
}

Widget.prototype.render = function(res)
{
    return this;
};

Widget.prototype.render_attributes = function(res)
{
    this.attrs['name'] = this.name;
    this.attrs['id'] = 'id_' + this.name;
    for(var attr in this.attrs)
    {
        var value = Array.isArray(this.attrs[attr]) ? this.attrs[attr].join(' ') : this.attrs[attr];
        res.write(' ' + attr + '="' + value + '"');
    }
    return this;
};

var InputWidget = exports.InputWidget = _extends(Widget,function(type,options)
{
    options.attrs.type = options.attrs.type || type;
    InputWidget.super_.call(this,options);
});

InputWidget.prototype.render = function(res)
{
    res.write('<input value="' + this.value + '"');
    this.render_attributes(res);
    res.write(' />');
    return this;
};

var TextWidget = exports.TextWidget = _extends(InputWidget,function(options)
{
    TextWidget.super_.call(this,'text',options); 
});

var NumberWidget = exports.NumberWidget = _extends(InputWidget,function(options)
{
    NumberWidget.super_.call(this,'number',options);
});

var CheckboxWidget = exports.CheckboxWidget = _extends(InputWidget,function(options)
{
    CheckboxWidget.super_.call(this,'checkbox',options);
});

CheckboxWidget.prototype.render = function(res)
{
    if(this.value)
        this.attrs['checked'] = 'checked';
    return CheckboxWidget.super_.prototype.render.call(this,res);
}

var ChoicesWidget = exports.ChoicesWidget = _extends(Widget,function(options)
{
    this.choices = options.choices || [];
    this.names = [];
    for(var i=0; i<this.choices.length; i++)
    {
        if(typeof(this.choices[i]) == 'object')
        {
            this.choices[i] = this.choices[i][0];
            this.names[i] = this.choices[i][1];
        }
        else
            this.names[i] = this.choices[i];
    };
    ChoicesWidget.super_.call(this,options);
});

ChoicesWidget.prototype.render = function(res)
{
    res.write('<select ');
    this.render_attributes(res);
    res.write(' >');
    if(!this.required)
    {
        var selected = this.value ? '' : 'selected="selected" ';
        res.write('<option ' + selected + 'value=""> ---- </option>');
    }
    for(var i=0; i<this.choices.length; i++)
    {
        var selected = this.value == this.choices[i] ? 'selected="selected" ' : '';
        res.write('<option ' + selected + 'value="' + this.choices[i] + '">' + this.names[i] + '</option>');
    }
    res.write('</select>');
    return this;
};

var RefWidget = exports.RefWidget = _extends(ChoicesWidget,function(options)
{
    this.ref = options.ref;
    RefWidget.super_.call(this,options);
});

RefWidget.prototype.pre_render = function(callback)
{
    var self = this;
    this.ref.find({},function(err,objects)
    {
        if(err)
            callback(err);
        else
        {
            self.choices = [];
            for(var i=0; i<objects.length; i++)
                self.choices.push([objects[i].id,objects[i] + '']);
            return RefWidget.super_.prototype.pre_render.call(self,callback);
        }
    });
};

//var UnknownRefWidget = exports.UnknownRefWidget = _extends(ChoicesWidget)
    
var ListWidget = exports.ListWidget = _extends(Widget,function(options)
{
    ListWidget.super_.call(this,options);
});

ListWidget.prototype.render = function(res,render_template,render_item)
{
    res.write("<div class='nf_listfield' name='" + this.name + "'><div class='nf_hidden_template'>");
    render_template(res);
    res.write('</div><ul>');
    for(var i=0; i<this.value.length; i++)
    {
        res.write('<li>');
        render_item(res,i);
        res.write('</li>');
    }
    res.write('</ul></div>');
};
    
    
    
    
    
    
    
    
    
    
    
    