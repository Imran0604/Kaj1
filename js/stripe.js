(function () {
  let stripe;

  async function initializeStripe() {
    try {
      const response = await fetch('get-stripe-key.php');
      const data = await response.json();
      stripe = Stripe(data.publishableKey);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  async function testConnection() {
    try {
      const response = await fetch('test-connection.php');
      const data = await response.json();
      console.log('Connection test:', data);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async function createCheckoutSession(data) {
    try {
      console.log('Creating checkout session with:', data);
      const response = await fetch('./create-checkout-session.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status, 'OK:', response.ok);
      const text = await response.text();
      console.log('Raw response:', text);

      if (!response.ok) throw new Error(`Server error: ${response.status} - ${text || 'No response body'}`);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON response from server. Raw response: ' + text);
      }

      console.log('Parsed response:', result);

      if (result.error) {
        alert('Error: ' + result.error);
        return;
      }
      if (!result.id) {
        alert('Error: No session ID received');
        return;
      }

      if (!stripe) {
        await initializeStripe();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!stripe) throw new Error('Stripe failed to initialize');

      const stripeResult = await stripe.redirectToCheckout({ sessionId: result.id });
      if (stripeResult.error) alert(stripeResult.error.message);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again. Error: ' + error.message);
    }
  }

  window.initializeStripe = initializeStripe;
  window.testConnection = testConnection;
  window.createCheckoutSession = createCheckoutSession;
})();
