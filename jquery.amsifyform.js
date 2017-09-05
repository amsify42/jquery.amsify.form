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

            this._form              = null;

            this.fieldNames         = [];

            this.fieldRules         = [];

            this.validated          = true;

            this.topField           = null;

            this.errorMessages      = {
                default         : 'There is a error in the field',
                required        : ':field is required',
                email           : 'Please enter valid email',
                onlynumber      : 'Please enter valid number',
                onlydecimal     : 'Please enter valid decimals',
                alphanumeric    : 'Must be alphanumeric',
                nospecialchar   : 'Special characters not allowed',
                url             : 'Please enter valid url',
                minlen          : ':field must be atleast :num characters long',
                maxlen          : ':field cannot exceed :num characters',
                min             : ':field must be atleast :num',
                max             : ':field cannot greater than :num',
                range           : 'Please enter value between :min and :max',
                pattern         : ':field is not valid',
                emaildomain     : 'Email with domains :formats is not allowed',
                fileformat      : 'Only :formats are allowed',
                alongwith       : {
                    required    : ':field is required along with :compareTo',
                    value       : ':field is required along with selected value of :compareTo',
                },
                apartfrom       : {
                    required    : ':field is not required along with :compareTo',
                    value       : ':field is not required along with selected value of :compareTo',
                },
                compare         : {
                    equal       : ':field and :compareTo should be same',
                    greater     : ':field should be greater than :compareTo',
                    lesser      : ':field should be lesser than :compareTo'
                }
            };

            this.preRules           = {
                range           : 'onlydecimal',
                emaildomain     : 'email',
                compare         : 'onlydecimal',
            };

            this.validationSets     = {
                forNum          : ['minlen', 'maxlen', 'min', 'max'],
                forTwoFields    : ['alongwith', 'apartfrom', 'compare'],
                formats         : ['fileformat', 'emaildomain'],
            };

            this.filters            = {
                email       : /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i,
                url         : /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                decimal     : /^-?\d*\.?\d{0,9}$/,
                specialchar : /^[a-zA-Z0-9- ]*$/
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

                        formField = _self.attributesToRules(formField, fieldName, input);

                        $(input).addClass('amsify-validate-field');
                        formField = _self.validationToObject(formField, $(input).attr('amsify-validate'));

                        if($.inArray(fieldName, _self.fieldNames) == -1) {
                            _self.fieldNames.push(fieldName);
                            _self.fieldRules.push(formField);
                        }
                    }
                }).bind(_self));
            },

            attributesToRules   : function (formField, fieldName, input) {
                // If required attribute is found
                if($(input).is('[required]')) {
                    $(input).removeAttr('required');
                    formField.rules.required = { message : this.setMessage('required', {field: fieldName})};
                }

                // If input type is email
                if($(input).attr('type') == 'email') {
                    formField.rules.email = { message : this.setMessage('email', {field: fieldName})};
                }

                // If minlength attribute is found
                if($(input).is('[minlength]')) {
                    var number = $(input).attr('minlength');
                    $(input).removeAttr('minlength');
                    formField.rules.minlen = { message : this.setMessage('minlen', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[maxlength]')) {
                    var number = $(input).attr('maxlength');
                    $(input).removeAttr('maxlength');
                    formField.rules.maxlen = { message : this.setMessage('maxlen', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[min]')) {
                    var number = $(input).attr('min');
                    $(input).removeAttr('min');
                    formField.rules.min = { message : this.setMessage('min', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[max]')) {
                    var number = $(input).attr('max');
                    $(input).removeAttr('max');
                    formField.rules.max = { message : this.setMessage('max', {field: fieldName, num: number})};
                }

                // If pattern attribute is found
                if($(input).is('[pattern]') || $(input).is('[amsify-pattern]')) {
                    var pattern;
                    if($(input).is('[pattern]')) {
                        pattern = $(input).attr('pattern');
                        $(input).removeAttr('pattern');
                    } else {
                        pattern = $(input).attr('amsify-pattern');
                        $(input).removeAttr('amsify-pattern');
                    }
                    formField.rules.pattern  = { message : this.setMessage('pattern', {field: fieldName}), check : pattern};
                }

                return formField;
            },

            validationToObject  : function(formField, string) {
                var validationArray     = string.split('|');
                validationArray         = this.insertPreRules(validationArray);
                var validationMessage   = '';
                var _self               = this;
                $.each(validationArray, (function(valIndex, validation) {
                    var ruleArray   = validation.split(':');
                    var rule        = ruleArray[0];
                    if(validation.indexOf('message-') != -1) {
                        var messageArray     = validation.split('message-');
                        validationMessage    = messageArray[1]; 
                    } else {
                        validationMessage    = _self.setMessage(ruleArray, _self.extractReplacements(formField.name, ruleArray));
                    }
                    if(!formField.rules.hasOwnProperty(rule)) {
                        formField.rules[rule] = _self.setRuleInfo(formField.name, ruleArray, validationMessage);
                    }
                }).bind(_self));
                return formField;
            },

            insertPreRules      : function(validationArray) {
                var _self = this;
                $.each(validationArray, (function(index, validation){
                    var ruleArray   = validation.split(':');
                    var rule        = ruleArray[0];
                    if(_self.preRules[rule]) {
                        if(!ruleArray[2] || ruleArray[2] != 'equal')
                        validationArray.splice(index, 0, _self.preRules[rule]);
                    }
                }).bind(_self));
                return validationArray;
            },

            setRuleInfo         : function(field, ruleArray, message) {
                var info    = {message : message };
                var sets    = this.validationSets;
                if(ruleArray.length > 1) {
                    if(ruleArray[0] == 'range' && ruleArray.length > 2) {
                        info.min = Number(ruleArray[1]);
                        info.max = Number(ruleArray[2]);
                    } else if($.inArray(ruleArray[0], sets.forNum) > -1) {
                        if(ruleArray[0] == 'minlen' || ruleArray[0] == 'minlen')
                            info.num = Number(ruleArray[1]);
                        else
                            info.num = parseFloat(ruleArray[1]);
                    } else if($.inArray(ruleArray[0], sets.forTwoFields) > -1) {
                        info.type   = 'equal';
                        if(ruleArray[2]) {
                            if(ruleArray[0] == 'compare')
                                info.type   = ruleArray[2];
                            else
                                info.values = ruleArray[2].split(',');
                        }
                        info.field      = field;
                        info.compareTo  = ruleArray[1];
                    } else if($.inArray(ruleArray[0], sets.formats) > -1) {
                        info.formats = ruleArray[1].split(',');
                    }
                 }
                return info;
            },

            setMessage          : function(rule, replacements) {
                var message = this.extractMessage(rule);
                if(message) {
                    $.each(replacements, function(key, value){
                        message = message.replace((new RegExp(':'+key, 'gi')), value) 
                    });
                    return message;
                } else {
                    return this.errorMessages['default'];
                }
            },

            extractReplacements : function (field, ruleArray) {
                var replacements    = {field: field};
                var sets            = this.validationSets;
                if(ruleArray.length > 1) {
                    if(ruleArray[0] == 'range' && ruleArray.length > 2) {
                        replacements.min        = ruleArray[1];
                        replacements.max        = ruleArray[2];
                    } else if($.inArray(ruleArray[0], sets.forNum) > -1) {
                        replacements.num        = ruleArray[1];
                    } else if($.inArray(ruleArray[0], sets.forTwoFields) > -1) {
                        replacements.field      = field;
                        replacements.compareTo  = ruleArray[1];
                    } else if($.inArray(ruleArray[0], sets.formats) > -1) {
                        replacements.formats    = ruleArray[1];
                    }
                 }
                return replacements;    
            },

            extractMessage      : function(rule) {
                var message;
                if(typeof rule == 'object' && rule.length > 1) {
                    if(rule[0] == 'compare') {
                        if(rule.length == 2) {
                            message = this.errorMessages[rule[0]]['equal'];
                        } else if(rule.length == 3) {
                            message = this.errorMessages[rule[0]][rule[2]];
                        }
                    } else if(rule[0] == 'alongwith' || rule[0] == 'apartfrom') {
                        if(rule.length == 2) {
                            message = this.errorMessages[rule[0]]['required'];
                        } else if(rule.length == 3) {
                            message = this.errorMessages[rule[0]]['value'];
                        }
                    } else {
                        message = this.errorMessages[rule[0]];
                    }
                } else {
                    message = this.errorMessages[rule];
                }
                return message;
            },

            validatedSingle     : function(name) {
                var _self = this;
                $.each(this.fieldRules, (function(fieldIndex, fieldRule) {
                    if(name == fieldRule.field) {
                        $.each(fieldRule.rules, (function(ruleName, rule) {
                            if(ruleName == 'requiredif') {
                                return this.requiredIf(fieldRule);
                            } else {
                                var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                                if(!ruleValidated) {
                                    _self.showError(fieldRule.field, rule.message);
                                    return false;
                                } else {
                                    _self.cleanError(fieldRule.field);
                                    return true;
                                }
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
                        if(ruleName == 'requiredif') {
                            return this.requiredIf(fieldRule);
                        } else {
                            var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                            if(!ruleValidated){
                                _self.showError(fieldRule.field, rule.message);
                                _self.validated  = false;
                                if(!_self.topField) _self.topField   = fieldRule.field;
                                return false;
                            }
                        }
                    }).bind(_self));
                }).bind(_self));
            },

            validatedRules      : function(field, rule) {
                var validated   = true;
                var fieldValue  = this.getFieldValue(field);
                
                switch(rule) {
                    case 'required':
                    if(fieldValue === undefined || fieldValue == '')
                        validated = false;
                    break;

                    case 'onlynumber':
                    if(isNaN(fieldValue))
                        validated = false;
                    break;

                    case 'onlydecimal':
                    if(!this.filters.decimal.test(fieldValue))
                        validated = false;
                    break;

                    case 'alphanumeric':
                    if(!this.isAlphaNumeric(fieldValue))
                        validated = false;
                    break;

                    case 'nospecialchar':
                    if(!this.filters.specialchar.test(fieldValue))
                        validated = false;
                    break;

                    case 'email':
                    if(!this.filters.email.test(fieldValue))
                        validated = false;
                    break;

                    case 'url':
                    if(!this.filters.url.test(fieldValue))
                        validated = false;
                    break;

                    case 'pattern':
                    var pattern = new RegExp(field.rules.pattern.check);
                    if(!pattern.test(fieldValue))
                        validated = false;
                    break;

                    case 'minlen':
                    if(fieldValue.length < field.rules.minlen.num)
                        validated = false;
                    break;

                    case 'maxlen':
                    if(fieldValue.length > field.rules.maxlen.num)
                        validated = false;
                    break;

                    case 'min':
                    if(Number(fieldValue) < field.rules.min.num)
                        validated = false;
                    break;

                    case 'max':
                    if(Number(fieldValue) > field.rules.max.num)
                        validated = false;
                    break;

                    case 'range':
                    fieldValue = Number(fieldValue);
                    if(fieldValue > field.rules.range.max || fieldValue < field.rules.range.min)
                        validated = false;
                    break;

                    case 'compare':
                    if(!this.compareValidated(fieldValue, field))
                        validated = false;
                    break;

                    case 'alongwith':
                    if(!this.validatedAlongWith(fieldValue, field))
                        validated = false;
                    break;

                    case 'apartfrom':
                    if(!this.validatedApartFrom(fieldValue, field))
                        validated = false;
                    break;

                    case 'fileformat':
                    var extension = fieldValue.split('.').pop().toLowerCase()
                    if(this.filterFormats(extension, field.rules.fileformat.formats))
                        validated = false;
                    break;

                    case 'emaildomain':
                    var emailDomain = fieldValue.split('@').pop().toLowerCase();
                    emailDomain     = emailDomain.split('.')[0];
                    if(!this.filterFormats(emailDomain, field.rules.emaildomain.formats))
                        validated = false;
                    break;

                    default:
                    validated = true;
                    break;
                }

                return validated;
            },

            requiredIf          : function(field) {
                if(this.getFieldValue(field) != '') {
                    return true;  
                }  else {
                    this.cleanError(field.field);
                    return false;
                }
            },

            isAlphaNumeric      : function(input) {
                var reg   = /^[^%\s]/;
                var reg2  = /[a-zA-Z]/;
                var reg3  = /[0-9]/;
                return reg.test(input) && reg2.test(input) && reg3.test(input);
            },

            validatedAlongWith  : function(value, field) {
                var otherValue  = this.getFieldValue(field.rules.alongwith.compareTo);
                if(field.rules.alongwith.values !== undefined) {
                    if(!value && $.inArray(otherValue, field.rules.alongwith.values) != -1) {
                        return false;
                    }
                } else {
                    if(!value && otherValue) {
                        return false;
                    }
                }
                return true;
            },

            validatedApartFrom  : function(value, field) {
                var otherValue  = this.getFieldValue(field.rules.apartfrom.compareTo);
                if(field.rules.apartfrom.values !== undefined) {
                    if(value && $.inArray(otherValue, field.rules.apartfrom.values) != -1) {
                        return false;
                    }
                } else {
                    if(value && otherValue) {
                        return false;
                    }
                }
                return true;            
            },

            filterFormats       : function(value, formats) {
                if($.inArray(value, formats) != -1) {
                    return false;
                }
                return true;
            },

            compareValidated    : function(value, field) {
                var type        = field.rules.compare.type;
                var otherValue  = this.getFieldValue(field.rules.compare.compareTo);
                if(type == 'equal') {
                    if(value != otherValue)
                        return false;
                } else {
                    value       = Number(value);
                    otherValue  = Number(otherValue);
                    if(type == 'greater') {
                        if(value <= otherValue)
                            return false;
                    } else if(type == 'lesser') {
                        if(value >= otherValue)
                            return false;
                    }
                }
                return true;
            },

            getFieldValue       : function(field) {
                if(typeof field == 'object') {
                    if(field.type !== undefined)
                        return this.valueByInput(field.field, field.type);
                    else
                        return this.valueByInput(field.field, this.fieldType(field.name));
                } else {
                    return this.valueByInput(field, this.fieldType(field));
                }
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
                $(settings.errorClass).hide();
            },

            cleanFormErrors     : function() {
                $(this._form).find(settings.errorClass).hide();
            }
        };

        var _c = {
            i                   : function() {
                for(var i = 0; i < arguments.length; i++) {
                    console.info(arguments[i]);
                }   
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