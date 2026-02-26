<?php
class ControllerExtensionPaymentSoltio extends Controller
{
    public function index()
    {
        $this->load->language('extension/payment/soltio');

        $data['button_confirm'] = $this->language->get('button_confirm');
        $data['action'] = $this->url->link('extension/payment/soltio/checkout', '', true);

        return $this->load->view('extension/payment/soltio', $data);
    }

    public function checkout()
    {
        $this->load->model('checkout/order');
        $order_info = $this->model_checkout_order->getOrder($this->session->data['order_id']);

        if ($order_info) {
            // Construct payload to forward to Soltio system
            $payload = array(
                'amount' => $this->currency->format($order_info['total'], $order_info['currency_code'], $order_info['currency_value'], false),
                'currency' => $order_info['currency_code'],
                'orderDescription' => "Order {$order_info['order_id']} via OpenCart",
                'orderId' => $order_info['order_id'],
                'customerEmail' => $order_info['email'],
                'successUrl' => $this->url->link('checkout/success', '', true),
                'cancelUrl' => $this->url->link('checkout/checkout', '', true)
            );

            // Fetch configured API Key
            $apiKey = $this->config->get('payment_soltio_api_key');

            $ch = curl_init('https://api.soltio.com/api/v1/create-invoice');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey
            ));
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            $response = curl_exec($ch);
            curl_close($ch);

            $result = json_decode($response, true);

            if (isset($result['paymentUrl']) || isset($result['data']['paymentUrl'])) {
                $paymentUrl = $result['paymentUrl'] ?? $result['data']['paymentUrl'];
                // Update order status to pending
                $this->model_checkout_order->addOrderHistory($this->session->data['order_id'], $this->config->get('payment_soltio_order_status_id'));
                // Redirect user
                $this->response->redirect($paymentUrl);
            }
            else {
                $this->session->data['error'] = 'Could not generate crypto invoice. Please try again.';
                $this->response->redirect($this->url->link('checkout/checkout', '', true));
            }
        }
    }
}
