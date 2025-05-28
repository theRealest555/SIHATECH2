<?php

namespace Database\Factories;

use App\Models\Rendezvous;
use App\Models\User; // Assuming patient_id in Rendezvous refers to users.id
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class RendezvousFactory extends Factory
{
    protected $model = Rendezvous::class;

    public function definition(): array
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        // Ensure the patient has a patient profile record if your rendezvous table links to patients.id
        if (!$patientUser->patient) {
            \App\Models\Patient::factory()->create(['user_id' => $patientUser->id]);
        }

        $doctorUser = User::factory()->create(['role' => 'medecin']);
        // Ensure the doctor has a doctor profile record
        if (!$doctorUser->doctor) {
            Doctor::factory()->create(['user_id' => $doctorUser->id]);
        }


        return [
            // Assuming rendezvous.patient_id refers to users.id for the patient
            'patient_id' => $patientUser->id,
            // Assuming rendezvous.doctor_id refers to doctors.id (the primary key of the doctors table)
            'doctor_id' => $doctorUser->doctor->id,
            'date_heure' => Carbon::instance($this->faker->dateTimeBetween('+1 day', '+1 month')),
            'statut' => $this->faker->randomElement(['confirmé', 'en_attente', 'annulé', 'terminé', 'no_show']),
        ];
    }
}
