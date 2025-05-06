(function () {
    const inputId = 'playerCountInput';
    const cookieName = 'playerCount';

    function setCookie(name, value, days = 1) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 864e5));
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
    }

    function getCookie(name) {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1] || '';
    }

    function applySavedValue() {
        const input = document.getElementById(inputId);
        if (!input) return;

        const savedValue = getCookie(cookieName);
        const numericValue = parseInt(savedValue, 10);

        if (!isNaN(numericValue) && numericValue > 2) {
            input.value = numericValue;
            input.classList.add('valid');
        } else {
            input.value = '';
            input.classList.remove('valid');
        }
    }

    function onInputChange(e) {
        const input = e.target;
        input.classList.remove('valid'); // Remove class on manual change
        setCookie(cookieName, input.value);
    }

    function init() {
        const input = document.getElementById(inputId);
        if (!input) return;

        applySavedValue();
        input.addEventListener('input', onInputChange);
    }

    document.addEventListener('DOMContentLoaded', init);

    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            applySavedValue();
        }
    });
})(); 