<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Speciality;
use App\Models\Rendezvous;
use App\Models\Leave;
use App\Models\Admin;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $patientUser;
    protected Patient $patient;
    protected User $doctorUser;
    protected Doctor $doctor;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Patient
        $this->patientUser = User::factory()->create(['role' => 'patient', 'email_verified_at' => now(), 'status' => 'actif']);
        $this->patient = Patient::factory()->create(['user_id' => $this->patientUser->id]);

        // Doctor
        $this->doctorUser = User::factory()->create(['role' => 'medecin', 'email_verified_at' => now(), 'status' => 'actif']);
        $speciality = Speciality::factory()->create();
        $this->doctor = Doctor::factory()->create([
            'user_id' => $this->doctorUser->id,
            'speciality_id' => $speciality->id,
            'is_verified' => true,
            'horaires' => ['lundi' => ['09:00-12:00', '14:00-17:00'], 'mardi' => ['09:00-12:00']] // Example schedule
        ]);

        // Admin
        $this->adminUser = User::factory()->create(['role' => 'admin', 'email_verified_at' => now(), 'status' => 'actif']);
        Admin::factory()->active()->create(['user_id' => $this->adminUser->id]);
    }

    // --- Test getAvailableSlots (already in PublicDoctorControllerTest, but can be here too for specific context) ---
    public function test_get_available_slots_for_a_doctor_on_a_specific_date()
    {
        Sanctum::actingAs($this->patientUser, ['role:patient']);
        $testDate = Carbon::parse('next monday')->format('Y-m-d');

        // Book a slot to make it unavailable
        Rendezvous::factory()->create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->patient->id,
            'date_heure' => Carbon::parse($testDate . ' 09:00:00'),
            'statut' => 'confirmé'
        ]);

        $response = $this->getJson("/api/public/doctors/{$this->doctor->id}/slots?date={$testDate}"); //
        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'data', 'meta'])
            ->assertJsonFragment(['09:30']) // Assuming 30 min slots
            ->assertJsonMissing(['09:00']);
    }


    // --- Test bookAppointment ---
    public function test_patient_can_book_an_appointment()
    {
        Sanctum::actingAs($this->patientUser, ['role:patient']);
        $slotToBook = Carbon::parse('next monday 10:00:00'); // Ensure this day is in doctor's schedule

        $response = $this->postJson("/api/patient/doctors/{$this->doctor->id}/appointments", [ //
            'date_heure' => $slotToBook->toDateTimeString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.doctor_id', $this->doctor->id)
            ->assertJsonPath('data.patient_id', $this->patientUser->id) // patient_id in rendezvous is user_id of patient
            ->assertJsonPath('data.statut', 'en_attente');

        $this->assertDatabaseHas('rendezvous', [
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->patientUser->id,
            'date_heure' => $slotToBook->toDateTimeString(),
        ]);
    }

    public function test_patient_cannot_book_taken_slot()
    {
        Sanctum::actingAs($this->patientUser, ['role:patient']);
        $slot = Carbon::parse('next monday 10:00:00');
        Rendezvous::factory()->create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => Patient::factory()->create()->id,
            'date_heure' => $slot,
            'statut' => 'confirmé'
        ]);

        $response = $this->postJson("/api/patient/doctors/{$this->doctor->id}/appointments", [ //
            'date_heure' => $slot->toDateTimeString()
        ]);
        $response->assertStatus(409) // Conflict or custom error
            ->assertJsonPath('message', 'This time slot is no longer available');
    }

    // --- Test updateAppointmentStatus (for Patient) ---
    public function test_patient_can_cancel_their_appointment()
    {
        Sanctum::actingAs($this->patientUser, ['role:patient']);
        $appointment = Rendezvous::factory()->create([
            'patient_id' => $this->patientUser->id,
            'doctor_id' => $this->doctor->id,
            'statut' => 'confirmé',
            'date_heure' => now()->addDay()
        ]);

        $response = $this->patchJson("/api/patient/appointments/{$appointment->id}/status", ['statut' => 'annulé']); //

        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'annulé');
        $this->assertDatabaseHas('rendezvous', ['id' => $appointment->id, 'statut' => 'annulé']);
    }


    // --- Test updateStatus (for Doctor) ---
    public function test_doctor_can_update_appointment_status()
    {
        Sanctum::actingAs($this->doctorUser, ['role:medecin']);
        $appointment = Rendezvous::factory()->create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->patient->user_id, // Corrected to use user_id from patient's user record
            'statut' => 'en_attente'
        ]);

        // The route is PATCH /api/appointments/{id}/status, using the 'updateStatus' method in AppointmentController
        $response = $this->patchJson("/api/doctor/appointments/{$appointment->id}/status", ['statut' => 'confirmé']); //

        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'confirmé');
        $this->assertDatabaseHas('rendezvous', ['id' => $appointment->id, 'statut' => 'confirmé']);
    }


    // --- Test markAsNoShow ---
    public function test_doctor_can_mark_appointment_as_no_show()
    {
        Sanctum::actingAs($this->doctorUser, ['role:medecin']);
        $appointment = Rendezvous::factory()->create([
            'doctor_id' => $this->doctor->id,
            'date_heure' => now()->subHour(), // Past appointment
            'statut' => 'confirmé'
        ]);

        $response = $this->postJson("/api/doctor/appointments/{$appointment->id}/no-show", ['reason' => 'Patient did not arrive']); //
        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'no_show');
        $this->assertDatabaseHas('rendezvous', ['id' => $appointment->id, 'statut' => 'no_show']);
    }

    public function test_admin_can_mark_appointment_as_no_show()
    {
        Sanctum::actingAs($this->adminUser, ['role:admin']);
         $appointment = Rendezvous::factory()->create([
            'doctor_id' => $this->doctor->id,
            'date_heure' => now()->subHour(),
            'statut' => 'confirmé'
        ]);
        $response = $this->postJson("/api/admin/appointments/{$appointment->id}/no-show", ['reason' => 'Admin marked no-show']); //
        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'no_show');
    }


    // --- Test getAppointments ---
    public function test_patient_can_get_their_appointments()
    {
        Sanctum::actingAs($this->patientUser, ['role:patient']);
        Rendezvous::factory(3)->create(['patient_id' => $this->patientUser->id, 'doctor_id' => $this->doctor->id]);
        Rendezvous::factory(2)->create(); // Other appointments

        $response = $this->getJson('/api/appointments'); // (also GET /api/patient/appointments)
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
        foreach ($response->json('data') as $appt) {
            $this->assertEquals($this->patientUser->id, $appt['patient_id']);
        }
    }

    public function test_doctor_can_get_their_appointments()
    {
        Sanctum::actingAs($this->doctorUser, ['role:medecin']);
        Rendezvous::factory(4)->create(['doctor_id' => $this->doctor->id]);
        Rendezvous::factory(2)->create(); // Other appointments

        $response = $this->getJson('/api/appointments'); // (also GET /api/doctor/appointments)
        $response->assertStatus(200)
            ->assertJsonCount(4, 'data');
        foreach ($response->json('data') as $appt) {
            $this->assertEquals($this->doctor->id, $appt['doctor_id']);
        }
    }

    public function test_admin_can_get_all_appointments_or_filter()
    {
        Sanctum::actingAs($this->adminUser, ['role:admin']);
        Rendezvous::factory(5)->create();
        $doctorForFilter = Doctor::factory()->create();
        Rendezvous::factory(2)->create(['doctor_id' => $doctorForFilter->id]);


        $responseAll = $this->getJson('/api/appointments'); //
        $responseAll->assertStatus(200)
            ->assertJsonCount(Rendezvous::count(), 'data');

        $responseFiltered = $this->getJson('/api/appointments?doctor_id=' . $doctorForFilter->id); //
        $responseFiltered->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
