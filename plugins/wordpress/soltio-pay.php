<?php
/**
 * Plugin Name: Soltio Crypto Pay Button
 * Plugin URI: https://soltio.com/integrations
 * Description: Add crypto payment buttons and donation widgets to any WordPress page using shortcodes or Gutenberg blocks.
 * Version: 1.0.0
 * Author: Soltio
 * Author URI: https://soltio.com
 * License: MIT
 * Text Domain: soltio-pay
 * Requires at least: 5.0
 * Tested up to: 6.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SOLTIO_PAY_VERSION', '1.0.0');
define('SOLTIO_PAY_DIR', plugin_dir_path(__FILE__));
define('SOLTIO_PAY_URL', plugin_dir_url(__FILE__));

// ─── Admin Settings Page ───

add_action('admin_menu', 'soltio_pay_admin_menu');
function soltio_pay_admin_menu()
{
    add_options_page(
        __('Soltio Payments', 'soltio-pay'),
        __('Soltio Payments', 'soltio-pay'),
        'manage_options',
        'soltio-pay-settings',
        'soltio_pay_settings_page'
    );
}

add_action('admin_init', 'soltio_pay_register_settings');
function soltio_pay_register_settings()
{
    register_setting('soltio_pay_options', 'soltio_pay_api_key');
    register_setting('soltio_pay_options', 'soltio_pay_api_url');
    register_setting('soltio_pay_options', 'soltio_pay_test_mode');
    register_setting('soltio_pay_options', 'soltio_pay_test_api_key');
    register_setting('soltio_pay_options', 'soltio_pay_button_style');
}

function soltio_pay_settings_page()
{
?>
    <div class="wrap">
        <h1><?php esc_html_e('Soltio Payment Settings', 'soltio-pay'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('soltio_pay_options'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Test Mode', 'soltio-pay'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="soltio_pay_test_mode" value="1"
                                <?php checked(1, get_option('soltio_pay_test_mode', 0)); ?> />
                            <?php esc_html_e('Enable sandbox/test mode', 'soltio-pay'); ?>
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Live API Key', 'soltio-pay'); ?></th>
                    <td>
                        <input type="password" name="soltio_pay_api_key"
                            value="<?php echo esc_attr(get_option('soltio_pay_api_key', '')); ?>"
                            class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Test API Key', 'soltio-pay'); ?></th>
                    <td>
                        <input type="password" name="soltio_pay_test_api_key"
                            value="<?php echo esc_attr(get_option('soltio_pay_test_api_key', '')); ?>"
                            class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('API URL', 'soltio-pay'); ?></th>
                    <td>
                        <input type="url" name="soltio_pay_api_url"
                            value="<?php echo esc_attr(get_option('soltio_pay_api_url', 'https://api.soltio.com')); ?>"
                            class="regular-text" />
                        <p class="description"><?php esc_html_e('Default: https://api.soltio.com', 'soltio-pay'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Button Style', 'soltio-pay'); ?></th>
                    <td>
                        <select name="soltio_pay_button_style">
                            <option value="default" <?php selected('default', get_option('soltio_pay_button_style', 'default')); ?>>
                                <?php esc_html_e('Default (Indigo)', 'soltio-pay'); ?>
                            </option>
                            <option value="dark" <?php selected('dark', get_option('soltio_pay_button_style', 'default')); ?>>
                                <?php esc_html_e('Dark', 'soltio-pay'); ?>
                            </option>
                            <option value="minimal" <?php selected('minimal', get_option('soltio_pay_button_style', 'default')); ?>>
                                <?php esc_html_e('Minimal (Outline)', 'soltio-pay'); ?>
                            </option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <hr />
        <h2><?php esc_html_e('Usage (Shortcodes)', 'soltio-pay'); ?></h2>
        <p><code>[soltio_pay amount="50" currency="USD"]</code> — <?php esc_html_e('Fixed amount payment button', 'soltio-pay'); ?></p>
        <p><code>[soltio_pay amount="50" currency="USD" label="Buy Now"]</code> — <?php esc_html_e('Custom button text', 'soltio-pay'); ?></p>
        <p><code>[soltio_donate]</code> — <?php esc_html_e('Donation form with custom amount input', 'soltio-pay'); ?></p>
    </div>
    <?php
}

// ─── Shortcode: [soltio_pay] ───

add_shortcode('soltio_pay', 'soltio_pay_shortcode');
function soltio_pay_shortcode($atts)
{
    $atts = shortcode_atts(array(
        'amount' => '10',
        'currency' => 'USD',
        'label' => 'Pay with Crypto',
        'description' => '',
        'order_id' => '',
    ), $atts, 'soltio_pay');

    $unique_id = 'soltio-btn-' . wp_rand(1000, 9999);
    $style = get_option('soltio_pay_button_style', 'default');

    $btn_classes = 'soltio-pay-btn';
    if ($style === 'dark')
        $btn_classes .= ' soltio-btn-dark';
    elseif ($style === 'minimal')
        $btn_classes .= ' soltio-btn-minimal';

    ob_start();
?>
    <div class="soltio-pay-wrapper" id="<?php echo esc_attr($unique_id); ?>">
        <button class="<?php echo esc_attr($btn_classes); ?>"
            data-amount="<?php echo esc_attr($atts['amount']); ?>"
            data-currency="<?php echo esc_attr($atts['currency']); ?>"
            data-description="<?php echo esc_attr($atts['description']); ?>"
            data-order-id="<?php echo esc_attr($atts['order_id']); ?>"
            onclick="soltioCreatePayment(this)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <?php echo esc_html($atts['label']); ?>
            <span class="soltio-amount"><?php echo esc_html($atts['amount'] . ' ' . $atts['currency']); ?></span>
        </button>
    </div>
    <?php
    return ob_get_clean();
}

// ─── Shortcode: [soltio_donate] ───

add_shortcode('soltio_donate', 'soltio_donate_shortcode');
function soltio_donate_shortcode($atts)
{
    $atts = shortcode_atts(array(
        'currency' => 'USD',
        'title' => 'Support Us with Crypto',
        'description' => 'Choose an amount and pay with your favorite cryptocurrency.',
    ), $atts, 'soltio_donate');

    $unique_id = 'soltio-donate-' . wp_rand(1000, 9999);

    ob_start();
?>
    <div class="soltio-donate-widget" id="<?php echo esc_attr($unique_id); ?>">
        <div class="soltio-donate-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <h3><?php echo esc_html($atts['title']); ?></h3>
        </div>
        <p class="soltio-donate-desc"><?php echo esc_html($atts['description']); ?></p>
        <div class="soltio-donate-presets">
            <button class="soltio-preset-btn" onclick="soltioSetDonation(this, 5)">$5</button>
            <button class="soltio-preset-btn" onclick="soltioSetDonation(this, 10)">$10</button>
            <button class="soltio-preset-btn active" onclick="soltioSetDonation(this, 25)">$25</button>
            <button class="soltio-preset-btn" onclick="soltioSetDonation(this, 50)">$50</button>
            <button class="soltio-preset-btn" onclick="soltioSetDonation(this, 100)">$100</button>
        </div>
        <div class="soltio-donate-custom">
            <span class="soltio-currency-symbol">$</span>
            <input type="number" class="soltio-donate-input" value="25" min="1" step="1" id="<?php echo esc_attr($unique_id); ?>-amount" />
        </div>
        <button class="soltio-pay-btn soltio-donate-btn"
            data-currency="<?php echo esc_attr($atts['currency']); ?>"
            onclick="soltioDonate('<?php echo esc_attr($unique_id); ?>', '<?php echo esc_attr($atts['currency']); ?>')">
            Donate with Crypto
        </button>
    </div>
    <?php
    return ob_get_clean();
}

// ─── Enqueue Frontend Assets ───

add_action('wp_enqueue_scripts', 'soltio_pay_enqueue_assets');
function soltio_pay_enqueue_assets()
{
    // CSS
    wp_enqueue_style('soltio-pay-style', SOLTIO_PAY_URL . 'assets/soltio-pay.css', array(), SOLTIO_PAY_VERSION);

    // JS
    wp_enqueue_script('soltio-pay-script', SOLTIO_PAY_URL . 'assets/soltio-pay.js', array(), SOLTIO_PAY_VERSION, true);

    $test_mode = get_option('soltio_pay_test_mode', 0);
    $api_key = $test_mode ? get_option('soltio_pay_test_api_key', '') : get_option('soltio_pay_api_key', '');

    wp_localize_script('soltio-pay-script', 'soltioConfig', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('soltio_pay_nonce'),
        'apiUrl' => get_option('soltio_pay_api_url', 'https://api.soltio.com'),
        'testMode' => (bool)$test_mode,
    ));
}

// ─── AJAX Handler for creating invoices (server-side to protect API key) ───

add_action('wp_ajax_soltio_create_invoice', 'soltio_ajax_create_invoice');
add_action('wp_ajax_nopriv_soltio_create_invoice', 'soltio_ajax_create_invoice');
function soltio_ajax_create_invoice()
{
    check_ajax_referer('soltio_pay_nonce', 'nonce');

    $amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;
    $currency = isset($_POST['currency']) ? sanitize_text_field($_POST['currency']) : 'USD';
    $description = isset($_POST['description']) ? sanitize_text_field($_POST['description']) : '';
    $order_id = isset($_POST['order_id']) ? sanitize_text_field($_POST['order_id']) : 'WP-' . wp_rand(10000, 99999);

    if ($amount <= 0) {
        wp_send_json_error(array('message' => 'Invalid amount'));
    }

    $test_mode = get_option('soltio_pay_test_mode', 0);
    $api_key = $test_mode ? get_option('soltio_pay_test_api_key', '') : get_option('soltio_pay_api_key', '');
    $api_url = get_option('soltio_pay_api_url', 'https://api.soltio.com');

    if (empty($api_key)) {
        wp_send_json_error(array('message' => 'API key not configured'));
    }

    $payload = array(
        'amount' => $amount,
        'currency' => $currency,
        'orderId' => $order_id,
        'orderDescription' => $description ?: sprintf('Payment from %s', get_bloginfo('name')),
        'successUrl' => home_url('/?soltio_status=success'),
        'cancelUrl' => home_url('/?soltio_status=cancelled'),
    );

    $response = wp_remote_post($api_url . '/api/v1/create-invoice', array(
        'method' => 'POST',
        'timeout' => 30,
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
        ),
        'body' => wp_json_encode($payload),
    ));

    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => 'Could not connect to Soltio'));
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $http_code = wp_remote_retrieve_response_code($response);

    if ($http_code !== 200 && $http_code !== 201) {
        $error = isset($body['error']) ? $body['error'] : 'Unknown error';
        wp_send_json_error(array('message' => $error));
    }

    $payment_url = isset($body['paymentUrl']) ? $body['paymentUrl'] : (isset($body['data']['paymentUrl']) ? $body['data']['paymentUrl'] : '');

    if (empty($payment_url)) {
        wp_send_json_error(array('message' => 'No payment URL received'));
    }

    wp_send_json_success(array('paymentUrl' => $payment_url));
}

// ─── Plugin Action Links ───

add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'soltio_pay_action_links');
function soltio_pay_action_links($links)
{
    $settings_link = '<a href="options-general.php?page=soltio-pay-settings">' . __('Settings', 'soltio-pay') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
