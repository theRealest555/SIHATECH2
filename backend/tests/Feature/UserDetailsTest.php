<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Speciality;
use Laravel\Sanctum\Sanctum;

class UserDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_patient_can_get_their_details()
    {
        $user = User::factory()->create(['role' => 'patient', 'status' => 'actif', 'email_verified_at' => now()]);
        Patient::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user, ['role:patient']);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'nom', 'prenom', 'email', 'role', 'status', 'email_verified_at', 'photo', 'telephone', 'patient' => ['id']],
                'role',
            ])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.role', 'patient')
            ->assertJsonPath('role', 'patient')
            ->assertJsonPath('user.patient.id', $user->patient->id);
    }

    public function test_authenticated_doctor_can_get_their_details()
    {
        $user = User::factory()->create(['role' => 'medecin', 'status' => 'actif', 'email_verified_at' => now()]);
        $speciality = Speciality::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $user->id,
            'speciality_id' => $speciality->id,
            'is_verified' => true,
        ]);

        Sanctum::actingAs($user, ['role:medecin']);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'nom', 'prenom', 'email', 'role', 'status', 'email_verified_at', 'photo', 'telephone', 'doctor' => ['id', 'is_verified', 'speciality', 'average_rating', 'total_reviews']],
                'role',
            ])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.role', 'medecin')
            ->assertJsonPath('role', 'medecin')
            ->assertJsonPath('user.doctor.id', $doctor->id)
            ->assertJsonPath('user.doctor.is_verified', true)
            ->assertJsonPath('user.doctor.speciality.id', $speciality->id);
    }

    public function test_authenticated_admin_can_get_their_details()
    {
        $user = User::factory()->create(['role' => 'admin', 'status' => 'actif', 'email_verified_at' => now()]);
        $admin = Admin::factory()->create(['user_id' => $user->id, 'admin_status' => 1]);

        Sanctum::actingAs($user, ['role:admin']);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'nom', 'prenom', 'email', 'role', 'status', 'email_verified_at', 'photo', 'telephone', 'admin' => ['id', 'admin_status']],
                'role',
            ])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('role', 'admin')
            ->assertJsonPath('user.admin.id', $admin->id)
            ->assertJsonPath('user.admin.admin_status', 1);
    }

    public function test_unauthenticated_user_cannot_get_user_details()
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }
}
