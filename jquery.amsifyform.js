(function($) {

    $.fn.amsifyForm = function(options) {

        // merging default settings with custom
        var settings = $.extend({
            formSelector    : 'form',
            autoValidate    : true,
            validateOn      : 'change focusout',
            submitSelector  : '',
            loadingText     : '',
            errorClass      : '.field-error'
        }, options);

        /**
         * initialization begins from here
         * @type {Object}
         */
        var AmsifyForm = function () {

            this. _form              = null;

            this.fieldNames          = [];

            this.fieldRules          = [];

            this.validated           = true;

            this.topField            = null;

            this.errorMessages       = {
                default     : 'There is a error in the field',
                required    : ':field is required',
                email       : 'Please enter valid email'
            };

            this.filters             = {
                email   : /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i,
                url     : /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
            };
        };


        AmsifyForm.prototype = {

            _init               : function(form, settings) {
                this._form  = form;
                var _self   = this;
                this.iterateInputs($(form).find(':input'));
                $(document).ready(function() {
                    $(form).submit((function(e) {
                        _self.validateFields();
                        if(!_self.validated) { 
                            e.preventDefault();
                            _self.focusField(_self.topField);
                        }
                    }).bind(_self));
                });
                if(settings.autoValidate && settings.validateOn) {
                    $(document).ready(function() {
                        $(form).find(':input').on(settings.validateOn, (function(event) {
                            if($.inArray(event.target.name, _self.fieldNames) > -1){
                                _self.validatedSingle(event.target.name);
                            }
                        }).bind(_self));
                    });
                }
            },

            iterateInputs       : function(inputs) {
                var _self = this;
                $.each(inputs, (function(key, input) {
                    // If AmsifyForm Validate Attribute is set
                    if($(input).attr('name') && ($(input).attr('amsify-validate') || $(input).prop('required'))) {

                        var fieldName       = $(input).attr('name');
                        var formField       = { rules : {}};
                        formField.field     = fieldName;
                        formField.type      = _self.fieldType(fieldName);

                        // Set Title if it is available
                        if($(input).prop('placeholder')) {
                            formField.name = $(input).attr('placeholder');
                        } else {
                            formField.name = $(input).attr('name');
                        }

                        // If required attribute is found
                        if($(input).is('[required]')) {
                            $(input).removeAttr('required');
                            formField.rules.required = { message : _self.setMessage('required', fieldName)};
                        }

                        // If input type is email
                        if($(input).attr('type') == 'email') {
                            formField.rules.email = { message : _self.setMessage('email', fieldName)};
                        }

                        $(input).addClass('amsify-validate-field');
                        formField = _self.validationToObject(formField, $(input).attr('amsify-validate'));

                        if($.inArray(fieldName, _self.fieldNames) == -1) {
                            _self.fieldNames.push(fieldName);
                            _self.fieldRules.push(formField);
                        }
                    }
                }).bind(_self));
            },

            validationToObject  : function(formField, string) {
                var validationArray     = string.split('|');
                var validationMessage   = '';
                var _self               = this;
                $.each(validationArray, (function(valIndex, validation) {
                    var ruleArray   = validation.split(':');
                    var rule        = ruleArray[0];
                    if(validation.indexOf('message-') != -1) {
                        var messageArray     = validation.split('message-');
                        validationMessage    = messageArray[1]; 
                    } else {
                        validationMessage    = _self.setMessage(rule, formField.name);
                    }
                    if(!formField.rules.hasOwnProperty(rule)) {
                        formField.rules[rule] = { message : validationMessage };
                    }
                }).bind(_self));
                return formField;
            },

            setMessage          : function(rule, fieldName) {
                var regex   = new RegExp(':field', 'gi');
                var message = this.errorMessages[rule];
                if(message) 
                    return message.replace(regex, fieldName) 
                else 
                    return this.errorMessages['default'];
            },

            validatedSingle     : function(name) {
                var _self = this;
                $.each(this.fieldRules, (function(fieldIndex, fieldRule) {
                    if(name == fieldRule.field) {
                        $.each(fieldRule.rules, (function(ruleName, rule) {
                            var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                            if(!ruleValidated) {
                                _self.showError(fieldRule.field, rule.message);
                            } else {
                                _self.cleanError(fieldRule.field);
                            }
                        }).bind(_self));
                    }
                }).bind(_self));
            },

            validateFields      : function() {
                this.cleanAllErrors();
                this.validated  = true;
                this.topField   = null;
                var _self       = this;
                $.each(this.fieldRules, (function(fieldIndex, fieldRule) {
                    $.each(fieldRule.rules, (function(ruleName, rule) {
                        var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                        if(!ruleValidated){
                            _self.showError(fieldRule.field, rule.message);
                            _self.validated  = false;
                            if(!_self.topField) _self.topField   = fieldRule.field;
                            return;
                        }
                    }).bind(_self));
                }).bind(_self));
            },

            validatedRules      : function(field, rule) {
                var validated   = true;
                var fieldValue;
                if(field.type !== undefined)
                    fieldValue  = this.valueByInput(field.field, field.type);
                else
                    fieldValue  = this.valueByInput(field.field, this.fieldType(field.name));
                switch(rule) {
                    case 'required':
                    if(fieldValue === undefined || fieldValue == '') {
                        validated = false;
                        break;
                    }
                        
                    default:
                    validated = true;
                }

                return validated;
            },

            valueByInput        : function(name, type) {
                var formField   = this.formField(name);
                var fieldvalue;
                if(type == 'DIV') {
                    fieldvalue = formField.html();
                } else if(type == 'INPUT') {
                    var inputType = formField.attr('type'); 
                    // If Input type is radio
                    if(inputType == 'radio') {
                        fieldvalue = this.radioValue(name);
                    }
                    // If Input type is checkbox
                    else if(inputType == 'checkbox') {
                        fieldvalue = this.checkboxValues(name);
                    } 
                    else {
                        fieldvalue = formField.val();
                    }
                } else {
                    fieldvalue = formField.val();
                }

                return fieldvalue;
            },

            formField           : function(name) {
                return $(this._form).find('*[name="'+name+'"]');
            },

            fieldType           : function(name) {
                return this.formField(name).prop('tagName');
            },

            checkboxValues      : function(name) {
                return $(this._form).find('*[name="'+name+'"]:checked').map(function(){ return $(this).val(); }).get();
            },

            radioValue          : function(name) {
                return $(this._form).find('*[name="'+name+'"]:checked').val();
            },

            focusField          : function(name) {
                this.formField(name).focus();
            },

            showError           : function(fieldName, message) {
                var formField       = this.formField(fieldName);
                // Check for span with 'for' attribute
                if($('span').is('[for="'+fieldName+'"]')) {
                    $('span[for="'+fieldName+'"]').addClass(settings.errorClass.substring(1)).show().html(message);
                } 
                // One Sibling
                else if(formField.siblings(settings.errorClass).length == 1) {
                    formField.siblings(settings.errorClass).show().html(message);
                } 
                // Multiple Siblings
                else if(formField.siblings(settings.errorClass).length > 1) {
                    // Next Sibling
                    if(formField.next(settings.errorClass).length) {
                        formField.next(settings.errorClass).show().html(message); 
                    } 
                    // Previous Sibling
                    else {
                        formField.prev(settings.errorClass).show().html(message); 
                    }
                } 
                // append html for message in case no tag is found
                else {
                    formField.after('<span class="'+settings.errorClass.substring(1)+'">'+message+'</span>');
                }
            },

            cleanError          : function(fieldName) {
                var formField       = this.formField(fieldName);
                // Check for span with 'for' attribute
                if($('span').is('[for="'+fieldName+'"]')) {
                    $('span[for="'+fieldName+'"]').addClass(settings.errorClass.substring(1)).hide();
                } 
                // One Sibling
                else if(formField.siblings(settings.errorClass).length == 1) {
                    formField.siblings(settings.errorClass).hide();
                } 
                // Multiple Siblings
                else if(formField.siblings(settings.errorClass).length > 1) {
                    // Next Sibling
                    if(formField.next(settings.errorClass).length) {
                        formField.next(settings.errorClass).hide(); 
                    } 
                    // Previous Sibling
                    else {
                        formField.prev(settings.errorClass).hide(); 
                    }
                }
            },

            cleanAllErrors      : function() {
                $(this._form).find(settings.errorClass).hide();
            }
        };

        /**
         * Initializing each instance of selector
         * @return {object}
         */
        return this.each(function() {
            (new AmsifyForm)._init(this, settings);
        });

    };

}(jQuery));