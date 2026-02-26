<?php
class ControllerExtensionPaymentSoltio extends Controller
{
    private $error = array();

    public function index()
    {
        $this->load->language('extension/payment/soltio');
        $this->document->setTitle($this->language->get('heading_title'));
        $this->load->model('setting/setting');

        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('payment_soltio', $this->request->post);
            $this->session->data['success'] = $this->language->get('text_success');
            $this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=payment', true));
        }

        $data['heading_title'] = $this->language->get('heading_title');
        $data['text_edit'] = $this->language->get('text_edit');
        $data['entry_api_key'] = $this->language->get('entry_api_key');
        $data['entry_status'] = $this->language->get('entry_status');

        $data['action'] = $this->url->link('extension/payment/soltio', 'user_token=' . $this->session->data['user_token'], true);
        $data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=payment', true);

        if (isset($this->request->post['payment_soltio_api_key'])) {
            $data['payment_soltio_api_key'] = $this->request->post['payment_soltio_api_key'];
        }
        else {
            $data['payment_soltio_api_key'] = $this->config->get('payment_soltio_api_key');
        }

        if (isset($this->request->post['payment_soltio_status'])) {
            $data['payment_soltio_status'] = $this->request->post['payment_soltio_status'];
        }
        else {
            $data['payment_soltio_status'] = $this->config->get('payment_soltio_status');
        }

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/payment/soltio', $data));
    }

    protected function validate()
    {
        if (!$this->user->hasPermission('modify', 'extension/payment/soltio')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }
        return !$this->error;
    }
}
