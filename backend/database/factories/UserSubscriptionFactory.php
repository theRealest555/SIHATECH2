<?php

namespace Database\Factories;

use App\Models\UserSubscription;
use App\Models\User;
use App\Models\Abonnement;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserSubscription>
 */
class UserSubscriptionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = UserSubscription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::factory()->create();
        $plan = Abonnement::factory()->create();

        $startsAt = Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now'));
        $endsAt = $plan->billing_cycle === 'monthly'
            ? $startsAt->copy()->addMonth()
            : $startsAt->copy()->addYear();

        $status = $this->faker->randomElement(['active', 'cancelled', 'expired', 'pending']);
        $cancelledAt = $status === 'cancelled' ? $this->faker->dateTimeBetween($startsAt, $endsAt) : null;

        return [
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => $status,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'cancelled_at' => $cancelledAt,
            'payment_method' => json_encode([
                'type' => 'stripe',
                'payment_method_id' => 'pm_' . $this->faker->lexify('???????????????'),
                'stripe_subscription_id' => 'sub_' . $this->faker->lexify('???????????????'),
            ]),
            'created_at' => $startsAt,
            'updated_at' => $this->faker->dateTimeBetween($startsAt, 'now'),
        ];
    }

    /**
     * Indicate that the subscription is active.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function active(): Factory
    {
        return $this->state(function (array $attributes) {
            $startsAt = Carbon::instance($this->faker->dateTimeBetween('-1 month', '-1 day'));
            $endsAt = $startsAt->copy()->addMonth(); // Assuming monthly for simplicity
             if (isset($attributes['subscription_plan_id'])) {
                $plan = Abonnement::find($attributes['subscription_plan_id']);
                if ($plan && $plan->billing_cycle === 'yearly') {
                    $endsAt = $startsAt->copy()->addYear();
                }
            }
            return [
                'status' => 'active',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'cancelled_at' => null,
            ];
        });
    }

    /**
     * Indicate that the subscription is cancelled.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function cancelled(): Factory
    {
        return $this->state(function (array $attributes) {
            $startsAt = Carbon::instance($this->faker->dateTimeBetween('-2 months', '-1 month'));
            $endsAt = $startsAt->copy()->addMonth();
             if (isset($attributes['subscription_plan_id'])) {
                $plan = Abonnement::find($attributes['subscription_plan_id']);
                 if ($plan && $plan->billing_cycle === 'yearly') {
                    $endsAt = $startsAt->copy()->addYear();
                }
            }
            return [
                'status' => 'cancelled',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'cancelled_at' => $this->faker->dateTimeBetween($startsAt, $endsAt),
            ];
        });
    }

    /**
     * Indicate that the subscription is expired.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function expired(): Factory
    {
        return $this->state(function (array $attributes) {
            $endsAt = Carbon::instance($this->faker->dateTimeBetween('-1 year', '-1 day'));
            $startsAt = $endsAt->copy()->subMonth(); // Assuming monthly for simplicity
            if (isset($attributes['subscription_plan_id'])) {
                $plan = Abonnement::find($attributes['subscription_plan_id']);
                 if ($plan && $plan->billing_cycle === 'yearly') {
                    $startsAt = $endsAt->copy()->subYear();
                }
            }
            return [
                'status' => 'expired',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'cancelled_at' => null,
            ];
        });
    }

    /**
     * Indicate that the subscription is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'starts_at' => now(),
                'ends_at' => now()->addMonth(), // Default to a month for pending
            ];
        });
    }
}
