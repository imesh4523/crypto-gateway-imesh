/**
 * Soltio Pay - Frontend JavaScript
 * Handles payment button clicks and donation form submissions
 */

(function () {
    'use strict';

    /**
     * Create a payment via AJAX and redirect to Soltio checkout
     */
    window.soltioCreatePayment = function (btn) {
        if (btn.classList.contains('loading')) return;

        var amount = btn.getAttribute('data-amount');
        var currency = btn.getAttribute('data-currency') || 'USD';
        var description = btn.getAttribute('data-description') || '';
        var orderId = btn.getAttribute('data-order-id') || '';

        btn.classList.add('loading');
        btn.disabled = true;

        var formData = new FormData();
        formData.append('action', 'soltio_create_invoice');
        formData.append('nonce', soltioConfig.nonce);
        formData.append('amount', amount);
        formData.append('currency', currency);
        formData.append('description', description);
        formData.append('order_id', orderId);

        fetch(soltioConfig.ajaxUrl, {
            method: 'POST',
            body: formData,
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.success && data.data.paymentUrl) {
                    window.location.href = data.data.paymentUrl;
                } else {
                    var msg = data.data && data.data.message ? data.data.message : 'Payment creation failed.';
                    alert('Error: ' + msg);
                    btn.classList.remove('loading');
                    btn.disabled = false;
                }
            })
            .catch(function (err) {
                console.error('Soltio Error:', err);
                alert('Could not initiate payment. Please try again.');
                btn.classList.remove('loading');
                btn.disabled = false;
            });
    };

    /**
     * Set donation amount from preset buttons
     */
    window.soltioSetDonation = function (btn, amount) {
        var container = btn.closest('.soltio-donate-widget');
        var input = container.querySelector('.soltio-donate-input');
        var buttons = container.querySelectorAll('.soltio-preset-btn');

        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        input.value = amount;
    };

    /**
     * Send donation payment
     */
    window.soltioDonate = function (widgetId, currency) {
        var widget = document.getElementById(widgetId);
        var input = widget.querySelector('.soltio-donate-input');
        var btn = widget.querySelector('.soltio-donate-btn');
        var amount = parseFloat(input.value);

        if (!amount || amount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }

        btn.setAttribute('data-amount', amount);
        btn.setAttribute('data-currency', currency);
        btn.setAttribute('data-description', 'Donation');
        window.soltioCreatePayment(btn);
    };

})();
