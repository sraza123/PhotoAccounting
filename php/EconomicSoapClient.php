<?php
/**
 * PHP extensions must be anabled: php_soap, php_openssl
 * @author igreactive
 *
 */
class EconomicSoapClient {
	private static $client;
	
	
	function __construct() {
		$this->connect();
	}
	
	/**
	 * Note: This might be helpfull: 
	 * http://apiforum.e-conomic.com/soap-f8/economic-api-exceptions-authorizationexception-t4678.html
	 */
	private function connect() {
		ini_set('max_execution_time', 0);
		try {
			$this->client = new SoapClient("https://www.e-conomic.com/secure/api1/EconomicWebservice.asmx?WSDL", array("trace" => 1, "exceptions" => 1));
		
			$this->client->Connect(array(
					'agreementNumber' => "438582",
					'userName' => "Dav",
					'password' => "a5wht4kn"
			));
		} catch (SoapFault $fault) {
			trigger_error(sprintf("Soap fault %s - %s", $fault->faultcode, $fault->faultstring), E_USER_ERROR);
		}
	}
}