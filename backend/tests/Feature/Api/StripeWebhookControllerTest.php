<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;
use App\Services\StripePaymentService; //
use Mockery;

class StripeWebhookControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_stripe_webhook_handles_valid_event_successfully()
    {
        $payload = ['type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_123']]];
        $signature = 'mocked_stripe_signature_header'; // In a real test, you'd generate this

        // Mock the StripePaymentService
        $stripeServiceMock = Mockery::mock(StripePaymentService::class);
        $stripeServiceMock->shouldReceive('handleWebhook')
            ->once()
            ->with(json_encode($payload), $signature)
            ->andReturn(['success' => true, 'message' => 'Webhook handled successfully']);

        $this->app->instance(StripePaymentService::class, $stripeServiceMock);

        $response = $this->postJson('/api/webhooks/stripe', $payload, [ //
            'Stripe-Signature' => $signature,
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);
    }

    public function test_stripe_webhook_returns_error_for_missing_signature()
    {
        Log::shouldReceive('error')->once()->with('Stripe webhook received without signature');

        $response = $this->postJson('/api/webhooks/stripe', ['type' => 'test_event']); //

        $response->assertStatus(400)
            ->assertJson(['error' => 'Missing signature']);
    }

    public function test_stripe_webhook_returns_error_if_service_fails_to_handle()
    {
        $payload = ['type' => 'payment_intent.failed', 'data' => ['object' => ['id' => 'pi_failed']]];
        $signature = 'another_mocked_signature';

        $stripeServiceMock = Mockery::mock(StripePaymentService::class);
        $stripeServiceMock->shouldReceive('handleWebhook')
            ->once()
            ->with(json_encode($payload), $signature)
            ->andReturn(['success' => false, 'error' => 'Webhook processing failed']);
        $this->app->instance(StripePaymentService::class, $stripeServiceMock);

        $response = $this->postJson('/api/webhooks/stripe', $payload, [ //
            'Stripe-Signature' => $signature,
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'Webhook processing failed']);
    }
}
