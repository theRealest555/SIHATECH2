<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'patient']);
        $doctor = Doctor::factory()->create(); // Ensure a doctor exists to be a favorite

        return [
            'user_id' => $user->id,
            'medecin_favori_id' => $this->faker->optional()->randomElement(Doctor::pluck('id')->toArray()),
        ];
    }
}
