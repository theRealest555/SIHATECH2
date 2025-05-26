<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\Patient;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\User; // Import User model

class AvisTableSeeder extends Seeder
{
    public function run()
    {
        // Vérifier qu'il y a des patients et des docteurs (users)
        if (User::where('role', 'patient')->count() === 0 || User::where('role', 'medecin')->count() === 0) {
            $this->command->error('Veuillez exécuter UserTableSeeder d\'abord pour créer les patients et médecins!');
            return;
        }

        $patients = User::where('role', 'patient')->get();
        $doctors = User::where('role', 'medecin')->get();

        if ($patients->isEmpty() || $doctors->isEmpty()) {
            $this->command->error('Pas assez d\'utilisateurs (patients/médecins) pour semer les avis.');
            return;
        }

        $avisData = [
            [
                'patient_id' => $patients->first()->id,
                'doctor_id' => $doctors->first()->id,
                'rating' => 5, // Corrected from 'note' to 'rating'
                'comment' => 'Excellent médecin, très professionnel et à l\'écoute.', // Corrected from 'commentaire' to 'comment'
                // Removed 'date' as created_at will be automatically handled
            ],
            [
                'patient_id' => $patients->first()->id,
                'doctor_id' => $doctors->get(1)->id ?? $doctors->first()->id,
                'rating' => 4,
                'comment' => 'Bon diagnostic mais un peu long en consultation.',
            ],
            [
                'patient_id' => $patients->get(1)->id ?? $patients->first()->id,
                'doctor_id' => $doctors->first()->id,
                'rating' => 3,
                'comment' => 'Consultation correcte mais manque d\'empathie.',
            ],
            [
                'patient_id' => $patients->get(2)->id ?? $patients->first()->id,
                'doctor_id' => $doctors->get(1)->id ?? $doctors->first()->id,
                'rating' => 2,
                'comment' => 'Déçu par la prise en charge, rendez-vous en retard.',
            ],
            [
                'patient_id' => $patients->get(3)->id ?? $patients->first()->id,
                'doctor_id' => $doctors->get(2)->id ?? $doctors->first()->id,
                'rating' => 1,
                'comment' => 'Très mauvaise expérience, je ne recommande pas.',
            ]
        ];

        foreach ($avisData as $avi) {
            Avis::updateOrCreate(
                [
                    'patient_id' => $avi['patient_id'],
                    'doctor_id' => $avi['doctor_id'],
                    // To prevent duplicate reviews for the same patient-doctor pair,
                    // consider adding a specific appointment_id or ensuring uniqueness
                    // if re-seeding allows for multiple reviews over time.
                    // For now, removing 'date' from unique check.
                ],
                $avi
            );
        }
    }
}
