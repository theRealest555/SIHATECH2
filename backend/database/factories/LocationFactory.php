<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->city, // 'name' field as per your model
            'region' => $this->faker->optional()->state, // region is nullable
            'city' => $this->faker->optional()->city, // city is nullable
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate a location in a specific region.
     *
     * @param string $regionName
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function inRegion(string $regionName): Factory
    {
        return $this->state(function (array $attributes) use ($regionName) {
            return [
                'region' => $regionName,
            ];
        });
    }
}
