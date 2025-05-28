<?php

namespace Database\Factories;

use App\Models\Avis;
use App\Models\User;
use App\Models\Rendezvous;
use Illuminate\Database\Eloquent\Factories\Factory;

class AvisFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Avis::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure patient and doctor users exist or create them
        $patientUser = User::factory()->create(['role' => 'patient']);
        $doctorUser = User::factory()->create(['role' => 'medecin']);

        // Ensure the doctor has a doctor profile record
        if (!$doctorUser->doctor) {
            \App\Models\Doctor::factory()->create(['user_id' => $doctorUser->id]);
        }

        // Create an appointment for context, or handle null rendezvous_id
        $rendezvous = Rendezvous::factory()->create([
            'patient_id' => $patientUser->patient->id, // Assuming patient_id in rendezvous refers to patients table id
            'doctor_id' => $doctorUser->doctor->id, // Assuming doctor_id in rendezvous refers to doctors table id
        ]);


        return [
            'patient_id' => $patientUser->id, // patient_id in reviews table refers to users table id
            'doctor_id' => $doctorUser->id,   // doctor_id in reviews table refers to users table id
            'rendezvous_id' => $rendezvous->id,
            'rating' => $this->faker->numberBetween(1, 5),
            'comment' => $this->faker->paragraph,
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'moderated_at' => null,
            'moderated_by' => null,
        ];
    }

    /**
     * Indicate that the review is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
            ];
        });
    }

    /**
     * Indicate that the review is approved.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'moderated_at' => now(),
                'moderated_by' => User::factory()->admin()->create()->id, // Assign a moderator
            ];
        });
    }

    /**
     * Indicate that the review is rejected.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'rejected',
                'moderated_at' => now(),
                'moderated_by' => User::factory()->admin()->create()->id, // Assign a moderator
            ];
        });
    }
}
