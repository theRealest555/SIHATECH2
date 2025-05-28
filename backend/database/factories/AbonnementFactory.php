<?php

namespace Database\Factories;

use App\Models\Abonnement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Abonnement>
 */
class AbonnementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Abonnement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $billingCycle = $this->faker->randomElement(['monthly', 'yearly', 'semi-annual']);
        $price = $billingCycle === 'yearly' ? $this->faker->randomFloat(2, 100, 1000) : $this->faker->randomFloat(2, 10, 100);

        return [
            'name' => $this->faker->unique()->words(2, true) . ' Plan',
            'description' => $this->faker->sentence,
            'price' => $price,
            'billing_cycle' => $billingCycle,
            'features' => json_encode([
                $this->faker->sentence(3),
                $this->faker->sentence(4),
                $this->faker->sentence(2),
            ]),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'stripe_price_id' => 'price_' . $this->faker->unique()->bothify('??????????????'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the plan is active.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function active(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    /**
     * Indicate that the plan is inactive.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate that the plan is monthly.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function monthly(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'billing_cycle' => 'monthly',
                'price' => $this->faker->randomFloat(2, 10, 100),
            ];
        });
    }

    /**
     * Indicate that the plan is yearly.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function yearly(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'billing_cycle' => 'yearly',
                'price' => $this->faker->randomFloat(2, 100, 1000),
            ];
        });
    }
}
