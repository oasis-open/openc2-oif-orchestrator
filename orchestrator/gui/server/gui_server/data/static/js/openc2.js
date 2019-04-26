/*jslint devel: true */
/*jslint nomen: true */
/*
OpenC2 Message Creator
*/

(function ($) { //an IIFE so safely alias jQuery to $
	"use strict";
	
    $.OpenC2 = function (messageSelect, messageFields, alertFun) {
        this.messageSelect = (messageSelect instanceof $) ? messageSelect : $(messageSelect);
        this.messageFields = (messageFields instanceof $) ? messageFields : $(messageFields);
		this.alertFun = (typeof alertFun === 'function') ? alertFun : alert.bind(window);
		this.nulls = [null, undefined, '', ' '];
		this.message = null;
		
		this.Types = ['Record', 'Enumerated', 'Map', 'Choice', 'ArrayOf', 'Array'];
		this.messageSelect.change(this._messageChange.bind(this));
    };

    //assigning an object literal to the prototype is a shorter syntax
    //than assigning one property at a time
    $.OpenC2.prototype = {
		initSchema: function (schema) {
			this.schema = (schema instanceof Object) ? schema : {};
			this.messageSelect.find('option.schema_record').remove();
			var schema_records = [];
			
			try {
				schema_records = $.map(this.schema.meta.exports, function (v) { return v; });
			} catch (e) {
				$('#message-list').append($('<option/>').addClass('schema_record').attr('disabled', '').text('Cannot Load, Invalid Schema'));
				this.alertFun('Schema Invalid, cannot load message types');
			}
			
			schema_records.sort();
			
			schema_records.forEach(function (rec) {
				this.messageSelect.append($('<option/>').addClass('schema_record').attr('value', rec).text(rec));
			}, this);
		},
		_messageChange: function (e) {
			var selected = $(e.target).val(),
				msg = this.schema.types.filter(function (type) { return type[0] === selected; });
			
			if (selected === '') {
				return;
			} else if (msg.length === 1) {
				this.message = msg[0];
			} else {
				this.messageFields.empty().append($('<p/>').text(selected + ' could not be found in the schema'));
				this.alertFun(selected + ' could not be found in the schema');
				return;
			}
			this._addFields();
		},
		_choiceChange: function (e) {
			var id = $(e.target).attr('id').replace('-choice', ''),
				choiceCont = $(e.target).parent().find('.choiceOptions'),
				selected = $(e.target).val(),
				selectedDef = this.schema.types.filter(function (type) {
					return type[0] === id;
				});
			
			choiceCont.empty();
			selectedDef = (selectedDef.length === 1) ? selectedDef[0][selectedDef[0].length - 1] : [];
			
			selectedDef = selectedDef.filter(function (type) {
				return Number(type[0]) === Number(selected);
			});
			selectedDef = (selectedDef.length === 1) ? selectedDef[0] : [];
			
			choiceCont.append(this._defField(selectedDef, id.toLowerCase(), true));
		},
		_addFields: function () {
			this.messageFields
				.empty()
				.append($('<p/>').append($('<b/>').text('Comment: ')).append($('<span/>').text(this.message[this.message.length - 2])))
				.append($('<div/>').attr('id', 'fieldDefs'));
			
			var defs = this.message[this.message.length - 1],
				fieldDefs = this.messageFields.find('#fieldDefs');
			
			defs.forEach(function (def) {
				fieldDefs.append(this._defType(def));
			}, this);
		},
		_defType: function (def, parent, field) {
			parent = ($.inArray(parent, this.nulls) < 0 ? parent : null);
			field = (typeof field === 'boolean') ? field : false;
			var defType = this.schema.types.filter(function (type) {
					return type[0] === def[2];
				}),
				defs = [],
				rtnCont = $('<div/>'),
				sel = null,
				rec = false;
			
			defType = defType.length === 1 ? defType[0] : def;
			defs = defType[defType.length - 1];
			
			switch (defType[1]) {
			case 'Enumerated':
				rtnCont = $('<div/>')
					.addClass('form-group' + (field ? '' : ' col-sm-6'))
					.attr({
						'aria-describedby': def[0] + '_help',
						optional: this._isOptional(def)
					})
					.append($('<label/>').attr('for', (parent !== null ? parent + '.' : '') + def[1]).text(def[1]))
					.append($('<small/>').attr('id', def[0] + '_help').addClass('form-text text-muted').text(def[def.length - 1]))
					.append($('<div/>').addClass('col-12 my-1'));
				
				sel = $('<select/>')
					.addClass('form-control')
					.attr({
						id: (parent !== null ? parent + '.' : '') + def[1],
						name: (parent !== null ? parent + '.' : '') + def[1]
					})
					.append($('<option/>').attr('value', '').attr('selected', '').text(def[1] + ' Options'));
					
				defs.forEach(function (def) {
					sel.append($('<option/>').attr('value', def[1]).text(def[1] + ' - ' + def[2]));
				}, this);

				rtnCont.append(sel);
				break;
							
			case 'Choice':
				rtnCont = $('<fieldset/>')
					.addClass('border border-secondary' + (field ? '' : ' col-sm-6'))
					.attr({
						id: defType[0],
						'aria-describedby': def[0] + '_help'
					})
					.append($('<legend/>').text(def[1]))
					.append($('<small/>').attr('id', def[0] + '_help').addClass('form-text text-muted').text(def[def.length - 1]))
					.append($('<div/>').addClass('col-12 my-1'));
							
				sel = $('<select/>')
					.addClass('form-control')
					.attr('id', defType[0] + '-choice')
					.append($('<option/>').attr('value', '').attr('selected', '').text(def[1] + ' Options'));
						
				defs.forEach(function (def) {
					var com = def[def.length - 1];
					sel.append($('<option/>').attr('value', def[0]).text(def[1] + (com === '' ? '' : ' - ' + com)));
				});
							
				rtnCont.append(sel).append($('<div>').addClass('col-sm-12 py-2 choiceOptions'));
								
				sel.change(this._choiceChange.bind(this));
				break;
						
			case 'Record':
				rec = true;
			case 'Map':
				rtnCont = $('<fieldset/>')
					.addClass('border border-' + (rec ? 'primary' : 'light') + (field ? '' : ' col-sm-6'))
					.attr('aria-describedby', def[0] + '_help')
					.append($('<legend/>').text(def[1]))
					.append($('<small/>').attr('id', def[0] + '_help').addClass('form-text text-muted').text(def[def.length - 1]))
					.append($('<div/>').addClass('col-12 my-1'));
					
				defs.forEach(function (d) {
					rtnCont.append(this._defField(d, ($.inArray(parent, this.nulls) < 0 ? parent + '.' : '') + def[1]).addClass(field ? 'mx-2' : ''));
				}, this);
				break;
				
			case 'ArrayOf':
				console.log('Array', defType);
				break;
				
			case 'Array':
				console.log('Array', defType);
				break;
							
			default:
				rtnCont = this._defField(defType, parent, false);
			}

			return rtnCont;
		},
		_defField: function (def, parent, field) {
			parent = ($.inArray(parent, this.nulls) < 0 ? parent : null);
			field = (typeof field === 'boolean') ? field : true;
			
			var defType = this.schema.types.filter(function (type) {
				return type[0] === def[2];
			});
			
			defType = (defType.length === 1 ? defType[0] : def);
			
			if ($.inArray(defType[1], this.Types) >= 0) {
				return this._defType(def, parent, true);
				
			} else {
				def = ($.isNumeric(def[0]) ? def.slice(1) : def);
				
				return $('<div/>').addClass('form-group' + (field ? '' : ' col-sm-6'))
					.append($('<label/>').attr('for', (parent !== null ? parent + '.' : '') + def[0]).text(def[0]))
					.append($('<input/>').attr({
						type: 'text',
						name: (parent !== null ? parent + '.' : '') + def[0],
						'aria-describedby': def[0] + '_help',
						placeholder: 'Enter ' + def[0],
						optional: this._isOptional(def)
					}).addClass('form-control'))
					.append($('<small/>').attr('id', def[0] + '_help').addClass('form-text text-muted').text(def[def.length - 1]));
			}
		},
		_isOptional: function (def) {
			console.log(def);
			console.log(def.length);
			switch (def.length) {
				case 5:
					return $.inArray('[0', def[3]) >= 0
					
				case 4:
					return $.inArray('[0', def[2]) >= 0
					
				default:
					console.log('default optional - ' + def[0] + ' - ' + def[1]);
					return false;
			}
		},
		genMsg: function () {
			var msg = {},
				msgFields = this.messageFields.serializeArray();
			
			msgFields.forEach(function (field) {
				var optional = this.messageFields.find('[name=\'' + field.name + '\']').first().attr('optional') || false;
				
				if (optional) {
					if ($.inArray(field.value, this.nulls) < 0) {
						this._setMultiKey(msg, field.name, field.value);
					}
				} else {
					this._setMultiKey(msg, field.name, field.value);
				}
			}, this);
			
			console.log(msg);
		},
		_setMultiKey: function (a, k, v) {
			var keys = k.split('.');
			
			if (keys.length > 1) {
				if (!a.hasOwnProperty(keys[0])) {
					a[keys[0]] = {};
				}
				this._setMultiKey(a[keys[0]], keys.slice(1).join('.'), v);
				
			} else {
				a[k] = v;
			}
		},
		_getMultiKey: function (a, k) {
			var keys = k.split('.');
			
			if (keys.length > 1) {
				return (a.hasOwnProperty(keys[0]) ? this._getMultiKey(a[keys[0]], keys.slice(1).join('.')) : '');
			} else {
				return (a.hasOwnProperty(k) ? a[k] : '');
			}
		}
    };

    $.OpenC2.defaultOptions = {
        schema: {},
		messageSelect: 'message-select',
		messageFields: 'message-fields'
    };
	
}(jQuery));

/* 
* so you can use it as:
var oc2 = new $.OpenC2($('#message-select'), $('#message-fields'))
oc2.InitSchema(OpenC2Schema)
*/