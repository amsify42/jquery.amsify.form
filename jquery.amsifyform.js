(function($) {

    $.fn.amsifyForm = function(options) {

        // merging default settings with custom
        var settings = $.extend({
            formSelector    : 'form',
            autoValidate    : true,
            validateOn      : 'change focusout',
            submitSelector  : '',
            loadingText     : '',
            errorClass      : '.amsify-error'
        }, options);

        /**
         * initialization begins from here
         * @type {Object}
         */
        var initAmsifyForm = {

            fieldRules      : [],

            errorMessages   : {
                required    : ':field is required',
                email       : 'Please enter valid email'
            },

            setOptions : function(form, settings) {
                var inputs = $(form).find(':input');
                this.iterateInputs(inputs);
                console.info(this.fieldRules);
            },

            iterateInputs       : function(inputs) {
                $.each(inputs, (function(key, input) {
                    // If AmsifyForm Validate Attribute is set
                    if($(input).attr('name') && ($(input).attr('amsify-validate') || $(input).prop('required'))) {

                        var fieldName   = $(input).attr('name');
                        var formField   = { rules : {}};

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

                        this.fieldRules[fieldName] = formField;
                    }
                }).bind(this));
            },

            validationToObject  : function(formField, string) {
                var validationArray = string.split('|');
                $.each(validationArray, (function(valIndex, validation){
                    var ruleArray   = validation.split(':');
                    var rule        = ruleArray[0];
                    if(!formField.rules.hasOwnProperty(rule)) {
                        formField.rules[rule] = { message : this.setMessage(rule, formField.name) };
                    }
                }).bind(this));
                return formField;
            },

            setMessage : function(rule, fieldName) {
                var regex   = new RegExp(':field', 'gi');
                var message = this.errorMessages[rule];
                if(message) 
                    return message.replace(regex, fieldName) 
                else 
                    return 'Please fix error';
            },
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