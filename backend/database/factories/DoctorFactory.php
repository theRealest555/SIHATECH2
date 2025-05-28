<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Speciality;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    protected $model = Doctor::class;

    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'medecin']);
        $speciality = Speciality::factory()->create();
        // $location = Location::factory()->create(); // Assuming Location model and factory exist

        return [
            'user_id' => $user->id,
            'speciality_id' => $speciality->id,
            // 'location_id' => $location->id,
            'description' => $this->faker->sentence,
            'horaires' => json_encode([
                'lundi' => ['09:00-12:00', '14:00-17:00'],
                'mardi' => ['09:00-12:00', '14:00-17:00'],
            ]),
            'is_verified' => $this->faker->boolean(80), // 80% chance of being verified
            'is_active' => true,
            'average_rating' => $this->faker->optional()->randomFloat(1, 3, 5),
            'total_reviews' => $this->faker->optional()->numberBetween(0, 100),
        ];
    }
}
