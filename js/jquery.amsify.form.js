/**
 * Amsify Jquery Form 2.0
 * http://www.amsify42.com
 */
(function($) {

    $.fn.amsifyForm = function(options) {

        // merging default settings with custom
        var settings = $.extend({
            autoValidate        : true,
            secureAttributes    : false,
            validateOn          : 'change focusout',
            submitSelector      : '',
            loadingText         : '',
            errorClass          : '.field-error',
            fieldRules          : {}
        }, options);


        /**
         * For checking interval initialization
         */
        var isInterval;

        /**
         * initialization begins from here
         * @type {Object}
         */
        var AmsifyForm = function () {

            this._form              = null;

            this.fieldNames         = [];

            this.fieldRules         = [];

            this.titleAttr          = 'amsify-title';

            this.flashAttr          = 'amsify-flash';

            this.ajaxAttr           = 'amsify-ajax-action';

            this.loadingTextAttr    = 'amsify-loading-text';

            this.validateAttr       = 'amsify-validate';

            this.patternAttr        = 'amsify-pattern';

            this.tranformAttr       = 'amsify-transform';

            this.maskAttr           = 'amsify-mask';

            this.fieldClass         = 'amsify-validate-field';

            this.validated          = true;

            this.topField           = null;

            this.formSubmit         = null;

            this.submitText         = '';

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

            this.formSection  = {
                class           : '.amsify-form-section',
                skip            : '.amsify-skip-form',
                timeAttr        : 'amsify-form-timer',
                allTimeAttr     : 'amsify-all-forms-timer',
                clearIntAttr    : 'clear-interval',
            };
        };


        AmsifyForm.prototype = {

            /**
             * Executing all the required settings
             * @param  {selector} form
             * @param  {object} settings
             */
            _init               : function(form, settings) {
                var _self   = this;
                this._form  = form;
                this.setFormAttributes();
                this.setFormSubmit();
                this.iterateInputs($(form).find(':input'));
                this.processFormSection();
                $(document).ready(function() {
                    $(form).submit((function(e) {
                        _self.disableSubmit(true);
                        var allowSubmit = $(form).attr('allow-submit');
                        if(allowSubmit != 'yes') _self.validateFields();
                        if(!_self.validated || $(form).find('[amsify-ajax-checked="0"]').length || settings.ajax) {
                            e.preventDefault();
                            _self.focusField(_self.topField);
                            if(_self.validated || allowSubmit == 'yes') {
                                if($(form).hasClass(_self.formSection.class.substring(1)) && $(form).next(_self.formSection.class).length && allowSubmit != 'yes') {
                                    e.preventDefault();
                                    _self.transitNextForm(form);
                                } else if(settings.ajax) {
                                    _self.submitAjax();
                                }
                            } else {
                                _self.disableSubmit(false);
                            } 
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

            /**
             * set the values if form having attributes
             */
            setFormAttributes   : function() {
                if($(this._form).attr(this.ajaxAttr)) {
                    settings.ajax = {
                        flash   : ($(this._form).attr(this.flashAttr))? $(this._form).attr(this.flashAttr): false,
                        type    : $(this._form).attr('method'),
                        action  : $(this._form).attr(this.ajaxAttr)
                    };
                }
                if($(this._form).attr(this.loadingTextAttr)) {
                    settings.loadingText = $(this._form).attr(this.loadingTextAttr);
                }
            },

            /**
             * set form submit selector
             */
            setFormSubmit       : function() {
                var _self       = this;
                this.formSubmit = $(this._form).find(':submit:first');
                if(settings.submitSelector) {
                    this.formSubmit = $(settings.submitSelector);
                    if($(settings.submitSelector).prop('type').toLowerCase() != 'submit') {
                        $(settings.submitSelector).click((function(){
                            $(_self._form).submit();
                        }).bind(_self));
                    }
                }
                this.submitText = $(this.formSubmit).html();
            },

            /**
             * set form submit selector disabled property
             */
            disableSubmit       : function(set) {
                var buttonText = this.submitText;
                if(set && settings.loadingText) {
                   buttonText = settings.loadingText                    
                }
                $(this.formSubmit).prop('disabled', set).html(buttonText);
            },

            /**
             * Call ajax on submit
             */
            submitAjax          : function() {
                var _self           = this;
                var flash           = (settings.ajax.flash)? settings.ajax.flash : false;
                var type            = (settings.ajax.type)? settings.ajax.type : 'POST';
                var targetMethod    = (settings.ajax.action)? AmsifyHelper.getActionURL(settings.ajax.action) : AmsifyHelper.baseURL;
                var ajaxConfig      = {
                    beforeSend      : function() {
                        $('.'+_self.fieldClass).prop('disabled', true).addClass('disabled');
                        if(settings.ajax.beforeSend && typeof settings.ajax.beforeSend == "function") {
                            settings.ajax.beforeSend();
                        }
                    },
                    afterSuccess    : function(data) {
                        _self.disableSubmit(false);
                        $(_self._form)[0].reset();
                        if(settings.ajax.afterSuccess && typeof settings.ajax.afterSuccess == "function") {
                            settings.ajax.afterSuccess(data);
                        }
                    },
                    afterError    : function(data) {
                        if(data.errors) _self.iterateErrors(data.errors);
                        _self.disableSubmit(false);
                        if(settings.ajax.afterError && typeof settings.ajax.afterError == "function") {
                            settings.ajax.afterError(data);
                        }
                    },
                    complete      : function() {
                        $('.'+_self.fieldClass).prop('disabled', false).removeClass('disabled');
                        if(settings.ajax.complete && typeof settings.ajax.complete == "function") {
                            settings.ajax.complete();
                        }
                    },
                };
                AmsifyHelper.callAjax(targetMethod, (new FormData($(this._form)[0])), ajaxConfig, type, flash);
            },

            iterateInputs       : function(inputs) {
                var _self = this;
                $.each(inputs, (function(key, input) {
                    // If AmsifyForm Validate Attribute is set
                    if($(input).attr('name') || $(input).attr(this.validateAttr)) {
                        
                        var fieldName       = $(input).attr('name');
                        var formField       = { rules : {}};
                        formField.field     = fieldName;
                        formField.type      = _self.fieldType(fieldName);

                        // Set Title if it is available
                        if($(input).attr(_self.titleAttr)) {
                            formField.name = $(input).attr(_self.titleAttr);
                        } else if($(input).prop('placeholder')) {
                            formField.name = $(input).attr('placeholder');
                        } else {
                            formField.name = $(input).attr('name');
                        }
                        
                        formField = _self.attributesToRules(formField, fieldName, input);

                        $(input).addClass(_self.fieldClass);
                        if($(input).attr(_self.validateAttr)) {
                            formField = _self.validationToObject(formField, $(input).attr(_self.validateAttr));
                            _self.checkSecureAttr(input, _self.validateAttr);
                        }
                        
                        formField = _self.filterObjectRule(formField);

                        if($.inArray(fieldName, _self.fieldNames) == -1) {
                            _self.fieldNames.push(fieldName);
                            _self.fieldRules.push(formField);
                            _self.processTransform(fieldName, input);
                            _self.processMask(fieldName, input);
                        }
                    }
                }).bind(_self));
            },

            processTransform    : function(fieldName, inputSelector) {
                var _self       = this;
                var transforms  = [];
                if($(inputSelector).attr(this.tranformAttr)) {
                    transforms = $(inputSelector).attr(this.tranformAttr).split('|');
                    this.checkSecureAttr(inputSelector, this.tranformAttr)
                } else {
                    $.each(settings.fieldRules, (function(index, field){
                        if(field.field == fieldName && field.transforms) {
                            transforms = ($.isArray(field.transforms))? field.transforms : field.transforms.split('|');
                        }
                    }).bind(_self));
                }
                $.each(transforms, function(index, transform){
                    AmsifyHelper[$.trim(transform)](inputSelector);
                });
            },

            processMask         : function(fieldName, inputSelector) {
                var _self       = this;
                var pattern     = [];
                if($(inputSelector).attr(this.maskAttr)) {
                    pattern = $(inputSelector).attr(this.maskAttr).split('::');
                    this.checkSecureAttr(inputSelector, this.maskAttr)
                } else {
                    $.each(settings.fieldRules, (function(index, field){
                        if(field.field == fieldName && field.mask) {
                            pattern = ($.isArray(field.mask))? field.mask : field.mask.split('::');
                        }
                    }).bind(_self));
                }
                if(pattern.length == 1) {
                    AmsifyHelper.mask(inputSelector, pattern[0]);
                } else if(pattern.length == 2) {
                    AmsifyHelper.mask(inputSelector, pattern[0], pattern[1]);
                }
            },

            attributesToRules   : function (formField, fieldName, input) {
                // If required attribute is found
                if($(input).is('[required]')) {
                    this.checkSecureAttr(input, 'required');
                    formField.rules.required = { message : this.setMessage('required', {field: fieldName})};
                }

                // If input type is email
                if($(input).attr('type') == 'email') {
                    formField.rules.email = { message : this.setMessage('email', {field: fieldName})};
                }

                // If minlength attribute is found
                if($(input).is('[minlength]')) {
                    var number = $(input).attr('minlength');
                    this.checkSecureAttr(input, 'minlength');
                    formField.rules.minlen = { message : this.setMessage('minlen', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[maxlength]')) {
                    var number = $(input).attr('maxlength');
                    this.checkSecureAttr(input, 'maxlength');
                    formField.rules.maxlen = { message : this.setMessage('maxlen', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[min]')) {
                    var number = $(input).attr('min');
                    this.checkSecureAttr(input, 'min');
                    formField.rules.min = { message : this.setMessage('min', {field: fieldName, num: number})};
                }

                // If minlength attribute is found
                if($(input).is('[max]')) {
                    var number = $(input).attr('max');
                    this.checkSecureAttr(input, 'max');
                    formField.rules.max = { message : this.setMessage('max', {field: fieldName, num: number})};
                }

                // If pattern attribute is found
                if($(input).is('[pattern]') || $(input).is('['+this.patternAttr+']')) {
                    var pattern;
                    if($(input).is('[pattern]')) {
                        pattern = $(input).attr('pattern');
                        this.checkSecureAttr(input, 'pattern');
                    } else {
                        pattern = $(input).attr(this.patternAttr);
                        this.checkSecureAttr(input, this.patternAttr);
                    }
                    formField.rules.pattern  = { message : this.setMessage('pattern', {field: fieldName}), check : pattern};
                }

                return formField;
            },

            checkSecureAttr     : function(selector, attribute) {
                if(settings.secureAttributes) {
                    $(selector).removeAttr(attribute);
                }
            },

            filterObjectRule    : function(formField) {
                var _self       = this;
                $.each(settings.fieldRules, (function(index, field){
                    if(formField.field == field.field) {
                        if(field.name) {
                            formField.name = field.name;
                        }
                        settings.fieldRules[index].rules = _self.objectPreRule(settings.fieldRules[index].rules);
                        $.each(field.rules, (function(valIndex, validation) {
                            if($.isFunction(validation)) {
                                formField.rules[valIndex]   = validation.bind(_self.formField(field.field));
                            } else {
                                var ruleArray   = _self.setRuleArray(valIndex, validation);
                                if(validation.message !== undefined) {
                                    validationMessage       = validation.message; 
                                } else {
                                    validationMessage       = _self.setMessage(ruleArray, _self.extractReplacements(formField.name, ruleArray));
                                }
                                formField.rules[valIndex]   = _self.setRuleInfo(formField.name, ruleArray, validationMessage);
                            }
                        }).bind(_self));
                        return false;
                    }
                }).bind(_self));
                return formField;
            },

            setRuleArray        : function(rule, validation) {
                var ruleArray   = [rule];
                var sets        = this.validationSets;
                if(rule == 'ajax') {
                    ruleArray[1]    = validation.url;
                } else if(rule == 'pattern') {
                    ruleArray[1]    = validation.check;
                } else if(rule == 'range') {    
                    ruleArray[1]    = validation.min;
                    ruleArray[2]    = validation.max;
                } else if($.inArray(rule, sets.forNum) > -1) {
                    ruleArray[1]    = validation.num;
                } else if($.inArray(rule, sets.forTwoFields) > -1) {
                    ruleArray[1]    = validation.compareTo;
                    if(rule == 'compare') {
                        ruleArray[2]    = (validation.type !== undefined)? validation.type: 'equal';
                    } else if(validation.values !== undefined) {
                        ruleArray[2]        = validation.values;
                    }
                } else if($.inArray(rule, sets.formats) > -1) {
                    ruleArray[1]    = validation.formats;
                }
                return ruleArray;
            },

            validationToObject  : function(formField, string) {
                var validationArray     = string.split('|');
                validationArray         = this.insertPreRules(validationArray);
                var validationMessage   = '';
                var _self               = this;
                $.each(validationArray, (function(valIndex, validation) {
                    var ruleArray       = validation.split(':');
                    var rule            = ruleArray[0];
                    if(validation.indexOf('message-') != -1) {
                        var messageArray        = validation.split('message-');
                        validationMessage       = messageArray[1]; 
                    } else {
                        validationMessage       = _self.setMessage(ruleArray, _self.extractReplacements(formField.name, ruleArray));
                    }
                    if(!formField.rules.hasOwnProperty(rule)) {
                        formField.rules[rule]   = _self.setRuleInfo(formField.name, ruleArray, validationMessage);
                    }
                }).bind(_self));
                return formField;
            },

            insertPreRules      : function(validationArray) {
                var _self   = this;
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

            objectPreRule       : function(rules) {
                var _self       = this;
                var orderRules  = {};
                $.each(rules, (function(rule, validation) {
                    if(this.preRules[rule]) {
                        if((validation.type === undefined && rule != 'compare') || (validation.type !== undefined && validation.type != 'equal')) {
                            orderRules[_self.preRules[rule]] = {};
                        }
                    }
                    orderRules[rule] = validation;    
                }).bind(_self));
                return orderRules;
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
                            if(ruleArray[0] == 'compare') {
                                info.type   = ruleArray[2];
                            } else {
                                info.values = ($.isArray(ruleArray[2]))? ruleArray[2]: ruleArray[2].split(',');
                            }
                        }
                        info.field      = field;
                        info.compareTo  = ruleArray[1];
                    } else if($.inArray(ruleArray[0], sets.formats) > -1) {
                        info.formats = ($.isArray(ruleArray[1]))? ruleArray[1]: ruleArray[1].split(',');
                    } else if(ruleArray[0] == 'ajax') {
                        info.url  = ruleArray[1];
                        this.formField(field).attr('amsify-ajax-checked', '0');
                    } else if(ruleArray[0] == 'pattern') {
                        info.check  = ruleArray[1];
                    }
                 } else if(ruleArray[0] == 'ajax') {
                    info.url  = this.formField(field).attr('amsify-ajax-url');
                    this.formField(field).attr('amsify-ajax-checked', '0');
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
                                if($.isFunction(rule)) {
                                    var customValidated = _self.validateCustomRule(fieldRule, rule);
                                    if(customValidated !== true){
                                        _self.showError(fieldRule.field, customValidated);
                                        return false;
                                    }
                                } else {
                                    var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                                    if(!ruleValidated) {
                                        var ajaxMessage = this.formField(fieldRule.field).attr('amsify-ajax-message');
                                        if(ruleName == 'ajax' && ajaxMessage)
                                            _self.showError(fieldRule.field, ajaxMessage);
                                        else
                                            _self.showError(fieldRule.field, rule.message);
                                        return false;
                                    } else {
                                        _self.cleanError(fieldRule.field);
                                        return true;
                                    }
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
                            if($.isFunction(rule)) {
                                var customValidated = _self.validateCustomRule(fieldRule, rule);
                                if(customValidated !== true){
                                    _self.showError(fieldRule.field, customValidated);
                                    return _self.validateFalse(fieldRule);
                                }
                            } else {
                                var ruleValidated = _self.validatedRules(fieldRule, ruleName);
                                if(!ruleValidated){
                                    var ajaxMessage = this.formField(fieldRule.field).attr('amsify-ajax-message');
                                    if(ruleName == 'ajax' && ajaxMessage)
                                        _self.showError(fieldRule.field, ajaxMessage);
                                    else
                                        _self.showError(fieldRule.field, rule.message);
                                    return _self.validateFalse(fieldRule);
                                }
                            }
                        }
                    }).bind(_self));
                }).bind(_self));
            },

            validateCustomRule  : function(fieldRule, custom) {
                return custom(this.getFieldValue(fieldRule.field));
            },

            validateFalse       : function(fieldRule) {
                this.validated  = false;
                if(!this.topField) this.topField   = fieldRule.field;
                return false;
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
                    if(isNaN(fieldValue) || Number(fieldValue) < field.rules.min.num)
                        validated = false;
                    break;

                    case 'max':
                    if(isNaN(fieldValue) || Number(fieldValue) > field.rules.max.num)
                        validated = false;
                    break;

                    case 'range':
                    fieldValue = Number(fieldValue);
                    if(isNaN(fieldValue) || fieldValue > field.rules.range.max || fieldValue < field.rules.range.min)
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

                    case 'ajax':
                    if(!this.processAjax(fieldValue, field.field, field.rules.ajax.url))
                        validated = false;
                    break;

                    default:
                        validated = true;
                    break;
                }

                return validated;
            },

            processAjax         : function(value, field, action) {
                var _self         = this;
                var value         = $.trim(value);
                var $formField    = this.formField(field);  
                var fieldChecked  = $formField.attr('amsify-ajax-checked');
                var ajaxSuccess   = $formField.attr('amsify-ajax-success'); 
                var ajaxValue     = $formField.attr('amsify-ajax-value');
                // If ajax value is already validated with error for the same value
                if(value == ajaxValue){
                    return false;
                }
                // If value is null or its already in process
                if(value == '' || $formField.attr('amsify-ajax-checking')) {
                    return false;
                }
                // Call ajax incase all conditions applied
                if(fieldChecked === undefined || fieldChecked == '0' || value != ajaxSuccess) {
                    $formField.attr('amsify-ajax-checked', '0');
                    var actionMethod    = AmsifyHelper.getActionURL(action);
                    var params          = { value : value }; 
                    var ajaxConfig      = {
                        beforeSend      : function() {
                            _self.cleanError(field);
                            $formField.attr('amsify-ajax-checking', '1')
                            if(!$('.'+field+'-field-loader').length) {
                                $formField.after('<span class="'+field+'-field-loader amsify-loader-small"></span>');
                            } else {
                                $('.'+field+'-field-loader').show();
                            }
                        },
                        afterError      : function(data) {
                            _self.showError(field, data.message);
                            $formField.attr('amsify-ajax-value', value);
                            $formField.attr('amsify-ajax-message', data['message']);
                        },
                        afterSuccess    : function(data) {
                            $formField.attr('amsify-ajax-checked', '1').attr('amsify-ajax-success', value);
                            $formField.removeAttr('amsify-ajax-value');
                            _self.cleanError(field);
                        },
                        complete        : function() {
                            $('.'+field+'-field-loader').hide();
                            $formField.removeAttr('amsify-ajax-checking');
                        }
                    };
                    AmsifyHelper.callAjax(actionMethod, params, ajaxConfig, 'POST', false);
                    return false;
                } else {
                    if(fieldChecked) { 
                        _self.cleanError(field);
                        return true;
                    } else {
                        return false;
                    }
                }
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
                    if(isNaN(value) || isNaN(otherValue)) {
                        return false;
                    }
                    else if(type == 'greater') {
                        if(value <= otherValue) return false;
                    } else if(type == 'lesser') {
                        if(value >= otherValue) return false;
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

            /**
             * iterate form field errors
             * @param  {array} fields
             */
            iterateErrors : function(fields) {
                var _self = this;
                $.each(fields, (function(field, message){
                    _self.showError(field, message);
                }).bind(_self));
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
            },

            processFormSection  : function() {
                var _self = this;
                // Check if count down is set
                $findFormTimer = $(this._form).find('['+this.formSection.timeAttr+']');
                if($findFormTimer.length && !isInterval) {
                    var seconds = $findFormTimer.attr(this.formSection.timeAttr);
                    this.startCountDown(this._form, seconds);
                } else if($('['+this.formSection.allTimeAttr+']').length && !$('['+this.formSection.allTimeAttr+']').attr('timer-started')) {
                    var seconds = $('['+this.formSection.allTimeAttr+']').attr(this.formSection.allTimeAttr);
                    $('['+this.formSection.allTimeAttr+']').attr('timer-started', '1');
                    this.startCountDown(this._form, seconds);
                }
                // End of Checking if count down is set

                if($(this._form).hasClass(this.formSection.class.substring(1))) {
                    $(this.formSection.class+':first').show();
                    AmsifyHelper.fixedCloneMethod();
                }
                $(this.formSection.skip).click((function(){
                    var form = $(this).closest('form');
                    if($(form).hasClass(this.formSection.class.substring(1)) && $(form).next(this.formSection.class).length) {
                        _self.transitNextForm(form);
                    }
                }).bind(_self));
            },

            transitNextForm     : function(form) {
                // Clear the timer of running form
                if($(form).attr(this.formSection.clearIntAttr) && !$('['+this.formSection.allTimeAttr+']').length) {
                    interval = $(form).attr(this.formSection.clearIntAttr);
                    clearInterval(interval);
                } else {
                    var interval = $('['+this.formSection.clearIntAttr+']').attr(this.formSection.clearIntAttr);
                    $(form).next(this.formSection.class).attr(this.formSection.clearIntAttr, interval);
                }
                // End of clearing timer

                // Transition of showing next form
                $next = $(form).next(this.formSection.class);
                $(form).css({'position':'absolute', 'width':'inherit'});
                $(form).hide('slide', { direction: 'left' }, 1000);
                $next.show('slide', { direction: 'right' }, 1000);
                $(form).find(':input').not(':submit').clone().hide().prependTo($next);

                // Start next count down if exist
                $findNextTimer = $(form).next(this.formSection.class).find('['+this.formSection.timeAttr+']');
                if($findNextTimer.length) {
                    var nextSeconds = $findNextTimer.attr(this.formSection.timeAttr);
                    this.startCountDown($(form).next(this.formSection.class), nextSeconds);
                }
            },


            startCountDown      : function(form, seconds) {
                var _self   = this;
                $formTimer  = $(form).find('['+this.formSection.timeAttr+']');
                if($('['+this.formSection.allTimeAttr+']').length) {
                  $formTimer = $('['+this.formSection.allTimeAttr+']');
                }

                isInterval = setInterval(function() { 
                    if(seconds <= 0) {
                      $formTimer.text(_self.secondsToHms(seconds));
                      clearInterval(isInterval);
                      $formTimer.hide();
                      if($('['+_self.formSection.allTimeAttr+']').length) {
                           $(_self.formSection.class+':visible').each(function(index, form){
                              $(form).attr('allow-submit', 'yes');
                              $(form).submit();
                           });
                      } else {
                        if($(form).hasClass(_self.formSection.class.substring(1)) && $(form).next(_self.formSection.class).length) {
                          _self.transitNextForm(form);
                        } else {
                          $(form).attr('allow-submit', 'yes');
                          $(form).submit();
                        }
                      }
                    } else {
                      var time = _self.secondsToHms(seconds);
                      if(seconds <= 60 && $formTimer.css('color') != 'red') {
                        $formTimer.css('color', 'red');
                      }
                      $formTimer.text(time);
                      seconds--;  
                    }
                }, 1000);
                $(form).attr(this.formSection.clearIntAttr, isInterval);
            },

            secondsToHms    : function(totalSeconds) {
                var hours   = Math.floor(totalSeconds / 3600);
                var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
                var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

                // round seconds
                seconds = Math.round(seconds * 100) / 100

                var result = (hours < 10 ? "0" + hours : hours);
                    result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                    result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
                return result;
            },

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