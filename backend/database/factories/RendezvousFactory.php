<?php

namespace Database\Factories;

use App\Models\Rendezvous;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient; // Import Patient model
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class RendezvousFactory extends Factory
{
    protected $model = Rendezvous::class;

    public function definition(): array
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        // Ensure the patient has a patient profile record
        if (!$patientUser->patient) {
            Patient::factory()->create(['user_id' => $patientUser->id]);
        }
        $patientUser->refresh(); // Refresh to load the 'patient' relationship

        $doctorUser = User::factory()->create(['role' => 'medecin']);
        // Ensure the doctor has a doctor profile record
        if (!$doctorUser->doctor) {
            Doctor::factory()->create(['user_id' => $doctorUser->id]);
        }
        $doctorUser->refresh(); // Refresh to load the 'doctor' relationship


        return [
            // Correctly assign patient_id from the patients table
            'patient_id' => $patientUser->patient->id,
            // doctor_id from the doctors table
            'doctor_id' => $doctorUser->doctor->id,
            'date_heure' => Carbon::instance($this->faker->dateTimeBetween('+1 day', '+1 month')),
            'statut' => $this->faker->randomElement(['confirmé', 'en_attente', 'annulé', 'terminé', 'no_show']),
        ];
    }
}
