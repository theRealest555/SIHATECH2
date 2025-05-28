<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Abonnement;
use App\Models\UserSubscription;
use App\Services\StripePaymentService;
use Laravel\Sanctum\Sanctum;
use Mockery;
// It's generally better to mock your service rather than Stripe SDK statics directly
// use Stripe\SetupIntent;
// use Stripe\Customer;
// use Stripe\Subscription as StripeSubscription;


class SubscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Abonnement $plan;
    protected Mockery\MockInterface $stripeServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['email_verified_at' => now(), 'status' => 'actif']);
        Sanctum::actingAs($this->user);

        $this->plan = Abonnement::factory()->create([
            'name' => 'Premium',
            'price' => 99.99,
            'billing_cycle' => 'monthly',
            'stripe_price_id' => 'price_premium_123'
        ]);

        // Mock Stripe service
        $this->stripeServiceMock = Mockery::mock(StripePaymentService::class);
        $this->app->instance(StripePaymentService::class, $this->stripeServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_can_get_subscription_plans()
    {
        $response = $this->getJson('/api/subscriptions/plans');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(Abonnement::where('is_active', true)->count(), 'data')
            ->assertJsonFragment(['name' => 'Premium']);
    }

    public function test_can_get_stripe_setup_intent()
    {
        // Mock the service method that encapsulates Stripe SDK calls
        $this->stripeServiceMock
            ->shouldReceive('getOrCreateCustomer')
            ->with($this->user) // Ensure the correct user is passed
            ->andReturn((object)['id' => 'cus_123']); // Return a simple object or array

        // Assume SubscriptionController calls a method in StripePaymentService to create setup intent
        // This makes the controller easier to test.
        // If SubscriptionController calls Stripe\SetupIntent::create directly, this test would be more complex.
        // Let's assume a method like createStripeSetupIntent exists in your service.
        $this->stripeServiceMock
            ->shouldReceive('createStripeSetupIntent') // This method needs to exist in StripePaymentService
            ->with('cus_123') // Customer ID
            ->andReturn((object)['client_secret' => 'seti_123_secret_456']);


        $response = $this->getJson('/api/subscriptions/setup-intent');

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonPath('client_secret', 'seti_123_secret_456')
                 ->assertJsonPath('customer_id', 'cus_123');
    }


    public function test_can_subscribe_to_a_plan()
    {
        $paymentMethodId = 'pm_card_visa';

        // Mock the service's processPayment method
        $this->stripeServiceMock
            ->shouldReceive('processPayment')
            ->once()
            ->with(Mockery::on(function ($data) use ($paymentMethodId) {
                return $data['payment_method_id'] === $paymentMethodId &&
                       $data['price_id'] === $this->plan->stripe_price_id &&
                       $data['user_id'] === $this->user->id;
            }))
            ->andReturn([
                'success' => true,
                'payment' => (object)['id' => 1, 'status' => 'completed'], // Use object for consistency
                'subscription' => (object)['id' => 'sub_123', /* other necessary Stripe subscription fields */],
                'client_secret' => 'pi_123_secret_456'
            ]);

        $response = $this->postJson('/api/subscriptions/subscribe', [
            'plan_id' => $this->plan->id,
            'payment_method_id' => $paymentMethodId,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.subscription_plan_id', $this->plan->id)
            ->assertJsonPath('data.subscription.status', 'active'); // Assuming successful payment activates it

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active' // Check for active status after successful payment
        ]);
    }

    public function test_can_cancel_active_subscription()
    {
        $userSubscription = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'payment_method' => ['type' => 'stripe', 'stripe_subscription_id' => 'sub_active_123']
        ]);

        $this->stripeServiceMock->shouldReceive('cancelSubscription')
            ->with('sub_active_123')
            ->once()
            ->andReturn(['success' => true, 'subscription' => (object)['status' => 'canceled']]);

        $response = $this->postJson('/api/subscriptions/cancel');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.status', 'cancelled');

        $this->assertDatabaseHas('user_subscriptions', [
            'id' => $userSubscription->id,
            'status' => 'cancelled'
        ]);
    }

    public function test_can_get_current_user_subscription()
    {
        UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'ends_at' => now()->addMonth()
        ]);

        $response = $this->getJson('/api/subscriptions/current');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.subscription_plan.name', $this->plan->name);
    }
}
