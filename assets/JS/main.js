function Validator(formSelector) {
    var formElement = document.querySelector(formSelector);
    var formRules = {
        // fullname: 'required',
        // email: 'required|email'
    };
    var _this = this;

    function getParent(element, selector) {
        return element.closest(selector);
    }
    /* Defines the rules
     * Rules are
     * 1. When error occurs => Return error message
     * 2. When valid => Return nothing (undefined)
     */
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },

        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`;
            }
        },

        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập ít nhất ${max} ký tự`;
            }
        },
    }

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            var rulesLabel = input.getAttribute('rules').split('|');
            // console.log(rulesLabel)
            for (var rule of rulesLabel) {
                var ruleInfo;
                // handle case rule has a value (min, max length for password)
                var isRuleHasValue = rule.includes(':');
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0]; 
                }
                // pass min, max value to function(min), function(max)
                // to use function(value) inside function(min), function(max)
                var ruleFunc = validatorRules[rule];
                // console.log(ruleFunc)
                // console.log(input.name)
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // listen event validate (blur, change,...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        // function using for validate
        function handleValidate(event) {
            // console.log(event.target)
            // console.log(event.target.name)
            // console.log(event.target.value)
            var rules = formRules[event.target.name];
            // console.log(rules);
            var errorMessage;
            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            // console.log(errorMessage)
            return !errorMessage;
        }

        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }

    // handle submit behavior
    formElement.onsubmit = function(event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for (var input of inputs) {
            if (!handleValidate({target:input})) {
                isValid = false;
            };
        }

        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var validInputs = formElement.querySelectorAll('[name]');
                var formValues = Array.from(validInputs).reduce(function(values, input) {
                switch(input.type) {
                    case 'radio':
                        values[input.name] = formElement.querySelector('input[name="' + input.name + '"]');
                        break;
                    case 'checkbox':
                        if (!input.matches(':checked')) {
                        if (!Array.isArray(values[input.name])) {
                            values[input.name] = '';
                        }
                        return values;
                        } else {
                        values[input.name] = [];
                        }
                        values[input.name].push(input.value);
                        break;
                    case 'file':
                        values[input.name] = input.files;
                        break;  
                    default:
                        values[input.name] = input.value;
                    }
                return values;
                }, {});

                _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    }
}