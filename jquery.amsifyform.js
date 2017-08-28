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
        var initAmsifyForm = {

            fieldRules          : [],

            validated           : true,

            topField            : null,

            errorMessages       : {
                default     : 'There is a error in the field',
                required    : ':field is required',
                email       : 'Please enter valid email'
            },

            setOptions          : function(form, settings) {
                this.iterateInputs($(form).find(':input'));
                $(form).submit((function(e){
                    this.validateFields();
                    if(!this.validated) e.preventDefault();
                    this.focusField(this.topField);
                }).bind(this));
                if(settings.validateOn) {
                    $(form).find(':input').on(settings.validateOn, (function(event){
                        this.validatedSingle(event.target.name);
                    }).bind(this));
                }
            },

            iterateInputs       : function(inputs) {
                $.each(inputs, (function(key, input) {
                    // If AmsifyForm Validate Attribute is set
                    if($(input).attr('name') && ($(input).attr('amsify-validate') || $(input).prop('required'))) {

                        var fieldName       = $(input).attr('name');
                        var formField       = { rules : {}};
                        formField.field     = fieldName;
                        formField.type      = this.fieldType(fieldName);

                        // Set Title if it is available
                        if($(input).prop('placeholder')) {
                            formField.name = $(input).attr('placeholder');
                        } else {
                            formField.name = $(input).attr('name');
                        }

                        // If required attribute is found
                        if($(input).is('[required]')) {
                            $(input).removeAttr('required');
                            formField.rules.required = { message : this.setMessage('required', fieldName)};
                        }

                        // If input type is email
                        if($(input).attr('type') == 'email') {
                            formField.rules.email = { message : this.setMessage('email', fieldName)};
                        }

                        $(input).addClass('amsify-validate-field');
                        formField = this.validationToObject(formField, $(input).attr('amsify-validate'));

                        this.fieldRules.push(formField);
                    }
                }).bind(this));
            },

            validationToObject  : function(formField, string) {
                var validationArray     = string.split('|');
                var validationMessage   = '';
                $.each(validationArray, (function(valIndex, validation){
                    var ruleArray   = validation.split(':');
                    var rule        = ruleArray[0];
                    if(validation.indexOf('message-') != -1) {
                        var messageArray     = validation.split('message-');
                        validationMessage    = messageArray[1]; 
                    } else {
                        validationMessage    = this.setMessage(rule, formField.name);
                    }
                    if(!formField.rules.hasOwnProperty(rule)) {
                        formField.rules[rule] = { message : validationMessage };
                    }
                }).bind(this));
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
                $.each(this.fieldRules, (function(fieldIndex, fieldRule){
                    if(name = fieldRule.field) {
                        $.each(fieldRule.rules, (function(ruleName, rule){
                            if(!this.validatedRules(fieldRule, ruleName)){
                                this.showError(fieldRule.field, rule.message);
                            } else {
                                this.cleanError(fieldRule.field);
                            }
                        }).bind(this));
                    }
                }).bind(this));
            },

            validateFields      : function() {
                this.cleanAllErrors();
                this.topField = null;
                $.each(this.fieldRules, (function(fieldIndex, fieldRule){
                    $.each(fieldRule.rules, (function(ruleName, rule){
                        if(!this.validatedRules(fieldRule, ruleName)){
                            this.showError(fieldRule.field, rule.message);
                            this.validated  = false;
                            if(!this.topField) this.topField   = fieldRule.field;
                            return;
                        }
                    }).bind(this));
                }).bind(this));
            },

            validatedRules      : function(field, rule) {
                var validated   = true;
                var fieldvalue;
                if(field.type !== undefined)
                    fieldvalue  = this.valueByInput(field.field, field.type);
                else
                    fieldvalue  = this.valueByInput(field.field, this.fieldType(field.name));

                switch(rule) {
                    case 'required':
                    if(fieldvalue === undefined || fieldvalue == '' || !fieldvalue.length) {
                        validated = false;
                        break;
                    }
                        
                    default:
                    validated = true;
                }
                return validated;
            },

            valueByInput        : function(name, type) {
                var field       = this.formField(name);
                var fieldvalue;
                if(type == 'DIV') {
                    fieldvalue = $(field).html();
                } else if(type == 'INPUT') {
                    var inputType = $(field).attr('type'); 
                    // If Input type is radio
                    if(inputType == 'radio') {
                        fieldvalue = $(field+'[type="radio"]:checked').val();
                    }
                    // If Input type is checkbox
                    else if(inputType == 'checkbox') {
                        fieldvalue = this.checkboxValues(field);
                    } 
                    else {
                        fieldvalue = $(field).val();
                    }
                } else {
                    fieldvalue = $(field).val();
                }

                return fieldvalue;
            },

            formField           : function(name) {
                return '*[name="'+name+'"]';
            },

            fieldType           : function(name) {
                return $(this.formField(name)).prop('tagName');
            },

            checkboxValues      : function(field) {
                return $(field+":checked").map(function(){ return $(this).val(); }).get();
            },

            focusField          : function(name) {
                $(this.formField(name)).focus();
            },

            showError           : function(fieldName, message) {
                var field       = this.formField(fieldName);
                // Check for span with 'for' attribute
                if($('span').is('[for="'+fieldName+'"]')) {
                    $('span[for="'+fieldName+'"]').addClass(settings.errorClass.substring(1)).show().html(message);
                } 
                // One Sibling
                else if($(field).siblings(settings.errorClass).length == 1) {
                    $(field).siblings(settings.errorClass).show().html(message);
                } 
                // Multiple Siblings
                else if($(field).siblings(settings.errorClass).length > 1) {
                    // Next Sibling
                    if($(field).next(settings.errorClass).length) {
                        $(field).next(settings.errorClass).show().html(message); 
                    } 
                    // Previous Sibling
                    else {
                        $(field).prev(settings.errorClass).show().html(message); 
                    }
                } 
                // append html for message in case no tag is found
                else {
                    $(field).after('<span class="'+settings.errorClass.substring(1)+'">'+message+'</span>');
                }
            },

            cleanError          : function(fieldName) {
                var field       = this.formField(fieldName);
                // Check for span with 'for' attribute
                if($('span').is('[for="'+fieldName+'"]')) {
                    $('span[for="'+fieldName+'"]').addClass(settings.errorClass.substring(1)).hide();
                } 
                // One Sibling
                else if($(field).siblings(settings.errorClass).length == 1) {
                    $(field).siblings(settings.errorClass).hide();
                } 
                // Multiple Siblings
                else if($(field).siblings(settings.errorClass).length > 1) {
                    // Next Sibling
                    if($(field).next(settings.errorClass).length) {
                        $(field).next(settings.errorClass).hide(); 
                    } 
                    // Previous Sibling
                    else {
                        $(field).prev(settings.errorClass).hide(); 
                    }
                }
            },

            cleanAllErrors      : function() {
                $.each(this.fieldRules, (function(fieldIndex, fieldRule){
                    this.cleanError(fieldRule.field)
                }).bind(this));
            }
        };

        /**
         * Initializing each instance of selector
         * @return {object}
         */
        return this.each(function() {
            initAmsifyForm.setOptions(this, settings);
        });

    };

}(jQuery));