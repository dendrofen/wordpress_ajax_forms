//ajax.url > php
/*
wp_enqueue_script('ajax-forms', theme_asset_url('assets/js/ajax-forms.js'));
wp_localize_script( 'ajax-forms', 'ajax', array( 'url' => admin_url( 'admin-ajax.php' ) ) );
*/

const moduleAjaxUrl = ajax.url;
function formSubmited(e) {
    var formEl = e.target;
    if (formEl.hasAttribute('data-ajax')) {
        e.preventDefault();

        var data = new FormData(formEl); //init request data

        //form nonce
        var wpnonce = formEl.querySelector('[name="_wpnonce"]');
        wpnonce = wpnonce ? wpnonce : document.querySelector('#_wpnonce');
        console.log(wpnonce);
        if (wpnonce !== null) {
            data.append('_wpnonce', wpnonce.value);
        }

        //form action
        if (formEl.querySelector('input[name="action"]') == null) {
            var action = formEl.getAttribute('data-action');
            if (action != null && action != '') {
                data.append('action', action);
            }
        }
        var XHR = new XMLHttpRequest();
        //sending request
        XHR.addEventListener('load', function () {
            if (XHR.status == 200) {
                responseHandler(XHR.response, formEl);
            }
        });
        XHR.open('POST', moduleAjaxUrl);
        XHR.send(data);
    }
}

function responseHandler(responseText, formEl) {
    var response = JSON.parse(responseText);
    var responseData = response.data;
    var message = responseData.message;
    var html = responseData.html;

    //setting message
    if (message != undefined && formEl.querySelector('.form__info') != null) {
        formEl.querySelector('.form__info').innerHTML = message;
    }

    if (response.success) {
        var successRedirect = formEl.getAttribute('data-success_redirect');
        var successReload = formEl.getAttribute('data-success_reload');
        var successEvent = formEl.getAttribute('data-success_event');

        var successRedirectDelay = formEl.getAttribute('data-success_delay');
        if (successRedirectDelay == null) {
            successRedirectDelay = 0;
        }

        //html fill container
        var htmlContainer = document.querySelector(formEl.getAttribute('data-fill'));
        if (htmlContainer != null && html != undefined) {
            htmlContainer.innerHTML = html;
        }

        //redirect | delay if enabled
        if (successRedirect) {
            setTimeout(() => {
                if (window.location.href != successRedirect) {
                    window.location.href = successRedirect;
                }
            }, successRedirectDelay);
        }

        //reload
        if (successReload != null) {
            window.location.reload();
        }

        if (successEvent != null) {
            document.dispatchEvent(new CustomEvent(successEvent, {
                detail: responseData
            }));
        }
    }
}
function initAjaxForms() {
    document.querySelectorAll('form').forEach(el => {
        el.addEventListener("submit", formSubmited);

        var instantClass = 'instant-processed';
        if (el.hasAttribute('data-instant') && el.hasAttribute('data-ajax') && el.classList.contains(instantClass) == false) {
            el.querySelector('[type="submit"]').click();
            el.classList.add(instantClass);
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    //init events
    initAjaxForms();
});
document.addEventListener('DOMSubtreeModified', function () {
    //init events
    initAjaxForms();
});
