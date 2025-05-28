<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure a user exists to associate with the payment
        $user = User::factory()->create();

        // Optionally create a UserSubscription to link
        // This can be null, so we'll make it optional here
        $userSubscription = null;
        if ($this->faker->boolean(50)) { // 50% chance of having an associated subscription
            // Ensure a subscription plan exists, assuming AbonnementFactory exists or create one
            $subscriptionPlan = \App\Models\Abonnement::factory()->create();
            $userSubscription = UserSubscription::factory()->create([
                'user_id' => $user->id,
                'subscription_plan_id' => $subscriptionPlan->id,
            ]);
        }

        return [
            'user_id' => $user->id,
            'user_subscription_id' => $userSubscription ? $userSubscription->id : null,
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'amount' => $this->faker->randomFloat(2, 50, 500), // Generates an amount like 123.45
            'currency' => 'MAD',
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'payment_method' => $this->faker->randomElement(['stripe', 'cih_pay', 'paypal']),
            'payment_data' => json_encode(['description' => 'Factory generated payment', 'ref' => Str::uuid()]),
            'invoice_url' => $this->faker->optional()->url,
            'created_at' => Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now')),
            'updated_at' => Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now')),
        ];
    }

    /**
     * Indicate that the payment is completed.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function completed(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
            ];
        });
    }

    /**
     * Indicate that the payment is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
            ];
        });
    }

    /**
     * Indicate that the payment has failed.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function failed(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'failed',
            ];
        });
    }
}
