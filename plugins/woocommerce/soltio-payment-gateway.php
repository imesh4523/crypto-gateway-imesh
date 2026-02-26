<?php
/**
 * Plugin Name: Soltio Crypto Payment Gateway
 * Plugin URI: https://soltio.com/integrations
 * Description: Accept cryptocurrency payments on your WooCommerce store via Soltio payment gateway.
 * Version: 1.0.0
 * Author: Soltio
 * Author URI: https://soltio.com
 * License: MIT
 * Text Domain: soltio-payment
 * Requires at least: 5.0
 * Tested up to: 6.4
 * WC requires at least: 5.0
 * WC tested up to: 8.5
 */

if (!defined('ABSPATH')) {
    exit;
}

// Make sure WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

define('SOLTIO_PLUGIN_VERSION', '1.0.0');
define('SOLTIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SOLTIO_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Register the Soltio payment gateway
 */
add_filter('woocommerce_payment_gateways', 'soltio_add_gateway');
function soltio_add_gateway($gateways) {
    $gateways[] = 'WC_Gateway_Soltio';
    return $gateways;
}

/**
 * Initialize the Gateway Class
 */
add_action('plugins_loaded', 'soltio_init_gateway');
function soltio_init_gateway() {

    class WC_Gateway_Soltio extends WC_Payment_Gateway {

        /** @var string Soltio API Key */
        private $api_key;

        /** @var string API Base URL */
        private $api_url;

        /** @var bool Test mode */
        private $test_mode;

        /** @var string IPN Secret for verifying webhooks */
        private $ipn_secret;

        public function __construct() {
            $this->id                 = 'soltio';
            $this->icon               = SOLTIO_PLUGIN_URL . 'assets/soltio-icon.png';
            $this->has_fields         = false;
            $this->method_title       = __('Soltio Crypto Payments', 'soltio-payment');
            $this->method_description = __('Accept cryptocurrency payments through the Soltio payment gateway. Supports 100+ cryptocurrencies.', 'soltio-payment');

            // Load settings
            $this->init_form_fields();
            $this->init_settings();

            $this->title       = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->enabled     = $this->get_option('enabled');
            $this->test_mode   = 'yes' === $this->get_option('test_mode');
            $this->api_key     = $this->test_mode ? $this->get_option('test_api_key') : $this->get_option('live_api_key');
            $this->api_url     = $this->get_option('api_url', 'https://api.soltio.com');
            $this->ipn_secret  = $this->get_option('ipn_secret');

            // Save settings
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

            // Register IPN webhook handler
            add_action('woocommerce_api_soltio_ipn', array($this, 'handle_ipn'));

            // Custom thank you page
            add_action('woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page'));
        }

        /**
         * Admin settings form fields
         */
        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'soltio-payment'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable Soltio Crypto Payments', 'soltio-payment'),
                    'default' => 'no',
                ),
                'title' => array(
                    'title'       => __('Title', 'soltio-payment'),
                    'type'        => 'text',
                    'description' => __('Payment method title that the customer sees during checkout.', 'soltio-payment'),
                    'default'     => __('Pay with Crypto', 'soltio-payment'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description', 'soltio-payment'),
                    'type'        => 'textarea',
                    'description' => __('Payment method description shown to customer during checkout.', 'soltio-payment'),
                    'default'     => __('Pay securely with Bitcoin, Ethereum, USDT and 100+ other cryptocurrencies.', 'soltio-payment'),
                ),
                'test_mode' => array(
                    'title'       => __('Test Mode', 'soltio-payment'),
                    'type'        => 'checkbox',
                    'label'       => __('Enable Sandbox / Test Mode', 'soltio-payment'),
                    'description' => __('Use test API keys to simulate payments without real transactions.', 'soltio-payment'),
                    'default'     => 'yes',
                    'desc_tip'    => true,
                ),
                'live_api_key' => array(
                    'title'       => __('Live API Key', 'soltio-payment'),
                    'type'        => 'password',
                    'description' => __('Your live Soltio API key from the dashboard.', 'soltio-payment'),
                    'default'     => '',
                ),
                'test_api_key' => array(
                    'title'       => __('Test API Key', 'soltio-payment'),
                    'type'        => 'password',
                    'description' => __('Your test/sandbox Soltio API key.', 'soltio-payment'),
                    'default'     => '',
                ),
                'api_url' => array(
                    'title'       => __('API URL', 'soltio-payment'),
                    'type'        => 'text',
                    'description' => __('Soltio API endpoint URL. Default: https://api.soltio.com', 'soltio-payment'),
                    'default'     => 'https://api.soltio.com',
                ),
                'ipn_secret' => array(
                    'title'       => __('IPN / Webhook Secret', 'soltio-payment'),
                    'type'        => 'password',
                    'description' => __('Used to verify incoming webhook notifications. Found in your Soltio Dashboard → Settings.', 'soltio-payment'),
                    'default'     => '',
                ),
            );
        }

        /**
         * Process the payment — create invoice via Soltio API and redirect
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);

            $payload = array(
                'amount'           => floatval($order->get_total()),
                'currency'         => $order->get_currency(),
                'orderId'          => strval($order_id),
                'orderDescription' => sprintf(
                    __('Order #%s from %s', 'soltio-payment'),
                    $order_id,
                    get_bloginfo('name')
                ),
                'successUrl'       => $this->get_return_url($order),
                'cancelUrl'        => $order->get_cancel_order_url_raw(),
                'ipnCallbackUrl'   => home_url('/wc-api/soltio_ipn'),
            );

            $response = wp_remote_post($this->api_url . '/api/v1/create-invoice', array(
                'method'  => 'POST',
                'timeout' => 30,
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type'  => 'application/json',
                ),
                'body'    => wp_json_encode($payload),
            ));

            if (is_wp_error($response)) {
                wc_add_notice(__('Payment error: Could not connect to Soltio. Please try again.', 'soltio-payment'), 'error');
                return array('result' => 'failure');
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);
            $http_code = wp_remote_retrieve_response_code($response);

            if ($http_code !== 200 && $http_code !== 201) {
                $error_msg = isset($body['error']) ? $body['error'] : __('Unknown error occurred.', 'soltio-payment');
                wc_add_notice(__('Payment error: ', 'soltio-payment') . $error_msg, 'error');
                return array('result' => 'failure');
            }

            // Store Soltio invoice ID in order meta
            if (isset($body['invoiceId'])) {
                $order->update_meta_data('_soltio_invoice_id', sanitize_text_field($body['invoiceId']));
            }
            if (isset($body['data']['invoiceId'])) {
                $order->update_meta_data('_soltio_invoice_id', sanitize_text_field($body['data']['invoiceId']));
            }

            // Set order status to pending payment
            $order->update_status('pending', __('Awaiting Soltio crypto payment.', 'soltio-payment'));
            $order->save();

            // Reduce stock
            wc_reduce_stock_levels($order_id);

            // Empty cart
            WC()->cart->empty_cart();

            // Redirect to Soltio checkout
            $payment_url = isset($body['paymentUrl']) ? $body['paymentUrl'] : (isset($body['data']['paymentUrl']) ? $body['data']['paymentUrl'] : '');

            if (empty($payment_url)) {
                wc_add_notice(__('Payment error: No checkout URL received from Soltio.', 'soltio-payment'), 'error');
                return array('result' => 'failure');
            }

            return array(
                'result'   => 'success',
                'redirect' => $payment_url,
            );
        }

        /**
         * Handle IPN (Instant Payment Notification) callback from Soltio
         */
        public function handle_ipn() {
            $payload = file_get_contents('php://input');

            // Verify signature if IPN secret is set
            if (!empty($this->ipn_secret)) {
                $received_signature = isset($_SERVER['HTTP_X_SOLTIO_SIGNATURE'])
                    ? sanitize_text_field($_SERVER['HTTP_X_SOLTIO_SIGNATURE'])
                    : '';

                $expected_signature = hash_hmac('sha512', $payload, $this->ipn_secret);

                if (!hash_equals($expected_signature, $received_signature)) {
                    status_header(401);
                    wp_die('IPN Signature Verification Failed', 'Soltio IPN', array('response' => 401));
                }
            }

            $data = json_decode($payload, true);

            if (!$data || !isset($data['orderId'])) {
                status_header(400);
                wp_die('Invalid IPN payload', 'Soltio IPN', array('response' => 400));
            }

            $order_id = intval($data['orderId']);
            $order = wc_get_order($order_id);

            if (!$order) {
                status_header(404);
                wp_die('Order not found', 'Soltio IPN', array('response' => 404));
            }

            $status = isset($data['status']) ? strtoupper($data['status']) : '';

            switch ($status) {
                case 'FINISHED':
                case 'COMPLETED':
                case 'CONFIRMED':
                    $order->payment_complete();
                    $order->add_order_note(
                        sprintf(__('Soltio payment completed. Transaction ID: %s', 'soltio-payment'),
                            isset($data['transactionId']) ? $data['transactionId'] : 'N/A'
                        )
                    );
                    break;

                case 'CONFIRMING':
                case 'SENDING':
                    $order->update_status('on-hold', __('Soltio payment is being confirmed on the blockchain.', 'soltio-payment'));
                    break;

                case 'PARTIALLY_PAID':
                    $order->update_status('on-hold',
                        sprintf(__('Soltio: Partial payment received. Expected: %s, Received: %s', 'soltio-payment'),
                            isset($data['expectedAmount']) ? $data['expectedAmount'] : '?',
                            isset($data['actualAmount']) ? $data['actualAmount'] : '?'
                        )
                    );
                    break;

                case 'EXPIRED':
                    $order->update_status('cancelled', __('Soltio payment expired — no payment received.', 'soltio-payment'));
                    break;

                case 'FAILED':
                case 'REFUNDED':
                    $order->update_status('failed', __('Soltio payment failed or was refunded.', 'soltio-payment'));
                    break;

                default:
                    $order->add_order_note(sprintf(__('Soltio IPN received with status: %s', 'soltio-payment'), $status));
                    break;
            }

            $order->save();
            status_header(200);
            echo 'OK';
            exit;
        }

        /**
         * Thank you page content
         */
        public function thankyou_page($order_id) {
            echo '<p>' . esc_html__('Your crypto payment is being processed. You will receive a confirmation once the transaction is verified on the blockchain.', 'soltio-payment') . '</p>';
        }
    }
}

/**
 * Add plugin action links
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'soltio_plugin_action_links');
function soltio_plugin_action_links($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=wc-settings&tab=checkout&section=soltio') . '">' . __('Settings', 'soltio-payment') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}

/**
 * Display admin notices for missing API keys
 */
add_action('admin_notices', 'soltio_admin_notices');
function soltio_admin_notices() {
    $settings = get_option('woocommerce_soltio_settings', array());

    if (isset($settings['enabled']) && $settings['enabled'] === 'yes') {
        $test_mode = isset($settings['test_mode']) && $settings['test_mode'] === 'yes';
        $api_key = $test_mode
            ? (isset($settings['test_api_key']) ? $settings['test_api_key'] : '')
            : (isset($settings['live_api_key']) ? $settings['live_api_key'] : '');

        if (empty($api_key)) {
            $mode = $test_mode ? 'Test' : 'Live';
            echo '<div class="notice notice-warning"><p>';
            printf(
                __('<strong>Soltio Crypto Payments:</strong> %s API Key is missing. <a href="%s">Configure settings</a> to start accepting payments.', 'soltio-payment'),
                $mode,
                admin_url('admin.php?page=wc-settings&tab=checkout&section=soltio')
            );
            echo '</p></div>';
        }
    }
}
