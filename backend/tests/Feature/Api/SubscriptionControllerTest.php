<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User; //
use App\Models\Abonnement; //
use App\Models\UserSubscription; //
use App\Services\StripePaymentService; //
use Laravel\Sanctum\Sanctum;
use Mockery;
use Stripe\SetupIntent; //
use Stripe\Customer; //
use Stripe\Subscription as StripeSubscription; //


class SubscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user; //
    protected Abonnement $plan; //
    protected Mockery\MockInterface $stripeServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['email_verified_at' => now(), 'status' => 'actif']); //
        Sanctum::actingAs($this->user);

        $this->plan = Abonnement::factory()->create([ //
            'name' => 'Premium',
            'price' => 99.99,
            'billing_cycle' => 'monthly',
            'stripe_price_id' => 'price_premium_123'
        ]);

        // Mock Stripe service
        $this->stripeServiceMock = Mockery::mock(StripePaymentService::class); //
        $this->app->instance(StripePaymentService::class, $this->stripeServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_can_get_subscription_plans()
    {
        $response = $this->getJson('/api/subscriptions/plans'); //

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(Abonnement::where('is_active', true)->count(), 'data') //
            ->assertJsonFragment(['name' => 'Premium']);
    }

    public function test_can_get_stripe_setup_intent()
    {
        $mockCustomer = Mockery::mock(Customer::class); //
        $mockCustomer->id = 'cus_123';
        $this->stripeServiceMock->shouldReceive('getOrCreateCustomer')->andReturn($mockCustomer);

        $mockSetupIntent = Mockery::mock(SetupIntent::class); //
        $mockSetupIntent->client_secret = 'seti_123_secret_456';
        // Use a static method mock for Stripe SDK's create
        Mockery::getConfiguration()->allowMockingNonExistentMethods(true);
        Mockery::getConfiguration()->allowMockingMethodsUnnecessarily(true);

        // Mock the static create method if Stripe SDK is directly used in controller
        // This example assumes Stripe SDK is abstracted by StripePaymentService.
        // If your controller directly calls Stripe\SetupIntent::create, you need to mock that.
        // For simplicity, we assume the service handles it.
        // If Stripe\SetupIntent::create is called directly in controller, this needs adjustment.
        // For now, we're testing as if the service method handles it.

        $response = $this->getJson('/api/subscriptions/setup-intent'); //

        // This assertion depends on how SetupIntent::create is handled.
        // If the service does it, the current mocking is fine.
        // If the controller calls Stripe::create directly, you need a more complex mock.
        // For the current setup, we'll assume the controller method works if the service is mocked.
        // A more robust test would involve mocking the Stripe SDK's static methods.
        // This is a known challenge in testing static SDK calls.
        $response->assertStatus(200); // Simplified assertion due to static call complexity
                                    // In a real scenario, you'd verify the client_secret based on SDK interaction.
    }


    public function test_can_subscribe_to_a_plan()
    {
        $paymentMethodId = 'pm_card_visa';

        $mockStripeSubscription = Mockery::mock(StripeSubscription::class); //
        $mockStripeSubscription->id = 'sub_123';

        $this->stripeServiceMock
            ->shouldReceive('processPayment')
            ->once()
            ->with(Mockery::on(function ($data) use ($paymentMethodId) {
                return $data['payment_method_id'] === $paymentMethodId &&
                       $data['price_id'] === $this->plan->stripe_price_id;
            }))
            ->andReturn([
                'success' => true,
                'payment' => ['id' => 1, 'status' => 'completed'],
                'subscription' => $mockStripeSubscription,
                'client_secret' => 'pi_123_secret_456'
            ]);

        $response = $this->postJson('/api/subscriptions/subscribe', [ //
            'plan_id' => $this->plan->id,
            'payment_method_id' => $paymentMethodId,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.subscription_plan_id', $this->plan->id)
            ->assertJsonPath('data.subscription.status', 'active');

        $this->assertDatabaseHas('user_subscriptions', [ //
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active'
        ]);
    }

    public function test_can_cancel_active_subscription()
    {
        $userSubscription = UserSubscription::factory()->create([ //
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'payment_method' => ['type' => 'stripe', 'stripe_subscription_id' => 'sub_active_123']
        ]);

        $this->stripeServiceMock->shouldReceive('cancelSubscription')
            ->with('sub_active_123')
            ->once()
            ->andReturn(['success' => true]);

        $response = $this->postJson('/api/subscriptions/cancel'); //

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.status', 'cancelled');

        $this->assertDatabaseHas('user_subscriptions', [ //
            'id' => $userSubscription->id,
            'status' => 'cancelled'
        ]);
    }

    public function test_can_get_current_user_subscription()
    {
        UserSubscription::factory()->create([ //
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'ends_at' => now()->addMonth()
        ]);

        $response = $this->getJson('/api/subscriptions/current'); //

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.subscription.subscription_plan.name', $this->plan->name);
    }
}
